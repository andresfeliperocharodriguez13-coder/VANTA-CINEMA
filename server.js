const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { randomUUID } = require('crypto');

const ROOT_DIR = __dirname;
const DB_PATH = path.join(ROOT_DIR, 'db.json');
const PORT = Number(process.env.PORT) || 3000;

function loadEnvironmentFile() {
  const environmentFile = path.join(ROOT_DIR, '.env');
  if (!fs.existsSync(environmentFile)) return;

  fs.readFileSync(environmentFile, 'utf8').split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  });
}

loadEnvironmentFile();
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(data));
}

function readDatabase() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDatabase(database) {
  fs.writeFileSync(DB_PATH, `${JSON.stringify(database, null, 2)}\n`);
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('La solicitud es demasiado grande.'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function proxyTmdb(request, response, url) {
  if (!TMDB_API_KEY) {
    sendJson(response, 503, {
      error: 'TMDB_API_KEY no está configurada en el servidor.'
    });
    return;
  }

  const tmdbPath = url.pathname.replace(/^\/api\/tmdb/, '') || '/';
  const query = new URLSearchParams(url.searchParams);

  query.delete('api_key');
  query.set('api_key', TMDB_API_KEY);

  const upstream = https.request({
    hostname: 'api.themoviedb.org',
    path: `/3${tmdbPath}?${query.toString()}`,
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  }, upstreamResponse => {
    response.writeHead(upstreamResponse.statusCode || 502, {
      'Content-Type':
        upstreamResponse.headers['content-type'] || 'application/json'
    });

    upstreamResponse.pipe(response);
  });

  upstream.on('error', () => {
    sendJson(response, 502, {
      error: 'No se pudo conectar con TMDB.'
    });
  });

  upstream.end();
}
async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/functions') {
    const database = readDatabase();
    sendJson(response, 200, database.functions || []);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/purchases') {
    const database = readDatabase();
    const functionId = url.searchParams.get('functionId');
    if (!functionId) {
      sendJson(response, 400, { error: 'Se debe indicar la función.' });
      return;
    }
    const purchases = (database.purchases || [])
      .filter(purchase => String(purchase.functionId) === functionId)
      .map(purchase => ({ functionId: purchase.functionId, asientos: purchase.asientos }));
    sendJson(response, 200, purchases);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/seats') {
    const database = readDatabase();
    const roomId = url.searchParams.get('roomId');
    const seats = (database.seats || []).filter(seat =>
      !roomId || String(seat.roomId) === roomId
    );
    sendJson(response, 200, seats);
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/purchases') {
    let purchase;

    try {
      purchase = JSON.parse(await readRequestBody(request));
    } catch (error) {
      sendJson(response, 400, { error: 'El cuerpo de la compra no es válido.' });
      return;
    }

    const requiredFields = ['functionId', 'roomId', 'pelicula', 'fecha', 'horario', 'asientos', 'totalPagar'];
    const hasValidSeats = Array.isArray(purchase.asientos) && purchase.asientos.length > 0 &&
      purchase.asientos.every(seat => typeof seat === 'string' && /^[A-Z]\d{1,2}$/.test(seat));

    if (requiredFields.some(field => purchase[field] === undefined || purchase[field] === '') ||
        !hasValidSeats ||
        new Set(purchase.asientos).size !== purchase.asientos.length ||
        !Number.isFinite(Number(purchase.totalPagar))) {
      sendJson(response, 400, { error: 'Los datos de la compra son inválidos.' });
      return;
    }

    // Node procesa estas solicitudes una a una y la escritura síncrona evita
    // que dos comprobaciones de disponibilidad se intercalen.
    const database = readDatabase();
    const purchases = database.purchases || [];
    const soldSeats = new Set(
      purchases
        .filter(item => String(item.functionId) === String(purchase.functionId))
        .flatMap(item => item.asientos || [])
    );
    const occupiedSeats = purchase.asientos.filter(seat => soldSeats.has(seat));

    if (occupiedSeats.length > 0) {
      sendJson(response, 409, {
        error: 'Uno o más asientos ya fueron vendidos.',
        occupiedSeats
      });
      return;
    }

    const savedPurchase = {
      ...purchase,
      id: randomUUID(),
      idReserva: purchase.idReserva || `VT-${Date.now().toString().slice(-6)}`,
      fechaReserva: new Date().toISOString(),
      asientos: [...purchase.asientos].sort()
    };

    purchases.push(savedPurchase);
    database.purchases = purchases;
    writeDatabase(database);
    sendJson(response, 201, savedPurchase);
    return;
  }

  sendJson(response, 404, { error: 'Ruta de API no encontrada.' });
}

function serveStatic(response, url) {
  const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(ROOT_DIR, `.${requestedPath}`);

  if (!filePath.startsWith(`${ROOT_DIR}${path.sep}`) ||
      filePath === DB_PATH ||
      path.basename(filePath).startsWith('.')) {
    sendJson(response, 403, { error: 'Ruta no permitida.' });
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(response, error.code === 'ENOENT' ? 404 : 500, {
        error: error.code === 'ENOENT' ? 'Archivo no encontrado.' : 'No se pudo leer el archivo.'
      });
      return;
    }

    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname.startsWith('/api/tmdb/')) {
    proxyTmdb(request, response, url);
  } else if (url.pathname.startsWith('/api/')) {
    handleApi(request, response, url).catch(error => {
      console.error(error);
      sendJson(response, 500, { error: 'Error interno del servidor.' });
    });
  } else {
    serveStatic(response, url);
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`VANTA Cinema disponible en http://localhost:${PORT}`);
  console.log('Configura TMDB_API_KEY para habilitar la cartelera de TMDB.');
});
