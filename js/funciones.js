document.addEventListener('DOMContentLoaded', async () => {
  const parametrosURL = new URLSearchParams(window.location.search);
  const movieId = parametrosURL.get('id');

  const loading = document.getElementById('loading');
  const contenidoFunciones = document.getElementById('contenidoFunciones');
  const btnVolverDetalle = document.getElementById('btnVolverDetalle');
  const btnContinuarAsientos = document.getElementById('btnContinuarAsientos');
  const resumenSeleccion = document.getElementById('resumenSeleccion');

  const baseUrlReal = (typeof BASE_URL !== 'undefined') ? BASE_URL : 'https://api.themoviedb.org/3';
  const apiKeyReal = (typeof API_KEY !== 'undefined') ? API_KEY : '';
  const imgBaseReal = (typeof IMAGE_BASE_URL !== 'undefined') ? IMAGE_BASE_URL : 'https://image.tmdb.org/t/p/w500';

  let funcionSeleccionada = {
    movieId: movieId,
    peliculaTitulo: '',
    fecha: null,
    formato: null,
    horario: null,
    precioUnitario: 0
  };

  if (!movieId) {
    if (loading) loading.textContent = '⚠️ No se especificó ninguna película. Regresa a la cartelera.';
    return;
  }

  // Configurar enlace de regresar al detalle
  if (btnVolverDetalle) {
    btnVolverDetalle.href = `detalle.html?id=${movieId}`;
  }

  try {
    // 1. Obtener datos de la película desde TMDB
    const resPeli = await fetch(`${baseUrlReal}/movie/${movieId}?api_key=${apiKeyReal}&language=es-ES`);
    if (!resPeli.ok) throw new Error('No se pudo cargar la información de la película.');
    const pelicula = await resPeli.json();

    funcionSeleccionada.peliculaTitulo = pelicula.title;

    // Llenar Ficha Resumen
    document.getElementById('tituloPeli').textContent = pelicula.title;
    document.getElementById('duracionPeli').textContent = pelicula.runtime || 'N/A';
    document.getElementById('promedioPeli').textContent = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : 'N/A';
    
    if (pelicula.genres && pelicula.genres.length > 0) {
      document.getElementById('generosPeli').textContent = pelicula.genres.map(g => g.name).join(' • ');
    }

    if (pelicula.poster_path) {
      document.getElementById('posterPeli').src = `${imgBaseReal}${pelicula.poster_path}`;
    }

    // 2. Generar Fechas Disponibles (Próximos 5 días)
    generarFechas();

    // 3. Generar Formatos y Horarios
    generarFormatosYHorarios();

    // Mostrar Contenido
    if (loading) loading.classList.add('hidden');
    if (contenidoFunciones) contenidoFunciones.classList.remove('hidden');

  } catch (error) {
    console.error('Error:', error);
    if (loading) loading.textContent = `⚠️ ${error.message}`;
  }

  // --- FUNCIÓN: Generar tarjetas de fecha ---
  function generarFechas() {
    const contenedorFechas = document.getElementById('contenedorFechas');
    if (!contenedorFechas) return;

    const diasSemana = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    const hoy = new Date();
    let HTMLFechas = '';

    for (let i = 0; i < 5; i++) {
      const fechaObj = new Date();
      fechaObj.setDate(hoy.getDate() + i);

      const diaSem = diasSemana[fechaObj.getDay()];
      const numDia = fechaObj.getDate();
      const mesNom = meses[fechaObj.getMonth()];
      const fechaTexto = `${diaSem} ${numDia} ${mesNom}`;
      
      const esActivo = i === 0 ? 'active' : '';
      if (i === 0) funcionSeleccionada.fecha = fechaTexto;

      HTMLFechas += `
        <div class="card-fecha ${esActivo}" data-fecha="${fechaTexto}">
          <span class="dia-semana">${i === 0 ? 'HOY' : diaSem}</span>
          <span class="num-dia">${numDia}</span>
          <span class="mes">${mesNom}</span>
        </div>
      `;
    }

    contenedorFechas.innerHTML = HTMLFechas;

    // Escuchar clicks en tarjetas de fecha
    const tarjetas = contenedorFechas.querySelectorAll('.card-fecha');
    tarjetas.forEach(card => {
      card.addEventListener('click', () => {
        tarjetas.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        funcionSeleccionada.fecha = card.getAttribute('data-fecha');
        actualizarEstadoBoton();
      });
    });
  }

  // --- FUNCIÓN: Generar bloques de formatos y horarios ---
  function generarFormatosYHorarios() {
    const contenedorHorarios = document.getElementById('contenedorHorarios');
    if (!contenedorHorarios) return;

    const ofertas = [
      {
        nombre: 'SALA TRADICIONAL 2D (DOBLADA / SUB)',
        precio: 14000,
        precioFormateado: '$14.000 COP',
        horarios: ['14:10', '16:40', '19:15', '21:50']
      },
      {
        nombre: 'SALA 3D / DOLBY ATMOS',
        precio: 18000,
        precioFormateado: '$18.000 COP',
        horarios: ['15:00', '18:20', '21:00']
      },
      {
        nombre: 'SALA VIP / RECLINABLE',
        precio: 25000,
        precioFormateado: '$25.000 COP',
        horarios: ['17:00', '20:30']
      }
    ];

    contenedorHorarios.innerHTML = ofertas.map(f => `
      <div class="formato-block">
        <div class="formato-header">
          <span class="formato-nombre">${f.nombre}</span>
          <span class="formato-precio">${f.precioFormateado}</span>
        </div>
        <div class="horarios-grid">
          ${f.horarios.map(h => `
            <button 
              class="btn-horario" 
              data-formato="${f.nombre}" 
              data-precio="${f.precio}" 
              data-horario="${h}">
              ${h}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');

    // Escuchar clicks en botones de horario
    const botonesHorario = contenedorHorarios.querySelectorAll('.btn-horario');
    botonesHorario.forEach(btn => {
      btn.addEventListener('click', () => {
        botonesHorario.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        funcionSeleccionada.formato = btn.getAttribute('data-formato');
        funcionSeleccionada.horario = btn.getAttribute('data-horario');
        funcionSeleccionada.precioUnitario = parseInt(btn.getAttribute('data-precio'), 10);

        actualizarEstadoBoton();
      });
    });
  }

  // --- FUNCIÓN: Actualizar texto del resumen y habilitar botón ---
  function actualizarEstadoBoton() {
    if (funcionSeleccionada.fecha && funcionSeleccionada.horario) {
      resumenSeleccion.textContent = `${funcionSeleccionada.fecha} — ${funcionSeleccionada.horario} (${funcionSeleccionada.formato})`;
      btnContinuarAsientos.disabled = false;
    } else {
      resumenSeleccion.textContent = 'Ningún horario seleccionado';
      btnContinuarAsientos.disabled = true;
    }
  }

  // NAVEGACIÓN A ASIENTOS
  if (btnContinuarAsientos) {
    btnContinuarAsientos.addEventListener('click', () => {
      if (!funcionSeleccionada.horario) return;

      // Guardar contexto en localStorage para el flujo completo
      localStorage.setItem('vanta_funcion_seleccionada', JSON.stringify(funcionSeleccionada));

      // Redirigir a la vista de asientos con query params
      const params = new URLSearchParams({
        id: funcionSeleccionada.movieId,
        fecha: funcionSeleccionada.fecha,
        horario: funcionSeleccionada.horario,
        formato: funcionSeleccionada.formato,
        precio: funcionSeleccionada.precioUnitario
      });

      window.location.href = `asientos.html?${params.toString()}`;
    });
  }
});