document.addEventListener('DOMContentLoaded', () => {
  const parametrosURL = new URLSearchParams(window.location.search);
  
  // Leer contexto enviado desde la vista anterior o localStorage
  const funcionGuardada = JSON.parse(localStorage.getItem('vanta_funcion_seleccionada') || '{}');

  const movieId = parametrosURL.get('id') || funcionGuardada.movieId;
  const fecha = parametrosURL.get('fecha') || funcionGuardada.fecha || 'Hoy';
  const horario = parametrosURL.get('horario') || funcionGuardada.horario || '19:00';
  const formato = parametrosURL.get('formato') || funcionGuardada.formato || '2D TRADICIONAL';
  const precioUnitario = parseInt(parametrosURL.get('precio') || funcionGuardada.precioUnitario || 14000, 10);
  const peliculaTitulo = funcionGuardada.peliculaTitulo || 'Película Seleccionada';

  // Referencias DOM
  const peliculaTituloEl = document.getElementById('peliculaTitulo');
  const funcionDetalleEl = document.getElementById('funcionDetalle');
  const precioUnitarioTextoEl = document.getElementById('precioUnitarioTexto');
  const gridAsientosEl = document.getElementById('gridAsientos');
  const asientosSeleccionadosTextoEl = document.getElementById('asientosSeleccionadosTexto');
  const totalPagarTextoEl = document.getElementById('totalPagarTexto');
  const btnContinuarPago = document.getElementById('btnContinuarPago');
  const btnVolverFunciones = document.getElementById('btnVolverFunciones');

  let asientosSeleccionados = [];

  // Configurar enlace de retorno
  if (btnVolverFunciones && movieId) {
    btnVolverFunciones.href = `funciones.html?id=${movieId}`;
  }

  // Pintar resumen en pantalla
  if (peliculaTituloEl) peliculaTituloEl.textContent = peliculaTitulo;
  if (funcionDetalleEl) funcionDetalleEl.textContent = `${fecha} | ${horario} | ${formato}`;
  if (precioUnitarioTextoEl) precioUnitarioTextoEl.textContent = `$${precioUnitario.toLocaleString('es-CO')} COP`;

  // Construir mapa de la sala (6 filas: A - F, 10 sillas por fila)
  const filas = ['A', 'B', 'C', 'D', 'E', 'F'];
  const sillasPorFila = 10;

  // Asientos ocupados de ejemplo (simulado por función)
  const ocupadosSimulados = ['A3', 'A4', 'C5', 'C6', 'D1', 'E8', 'E9', 'F5'];

  renderizarSala();

  function renderizarSala() {
    if (!gridAsientosEl) return;
    gridAsientosEl.innerHTML = '';

    filas.forEach(letraFila => {
      const filaDiv = document.createElement('div');
      filaDiv.classList.add('fila-asientos');

      // Etiqueta izquierda de la fila
      const etiquetaIzq = document.createElement('span');
      etiquetaIzq.classList.add('letra-fila');
      etiquetaIzq.textContent = letraFila;
      filaDiv.appendChild(etiquetaIzq);

      // Bloque Izquierdo (Sillas 1 a 5)
      const grupoIzq = document.createElement('div');
      grupoIzq.classList.add('sillas-grupo');
      
      for (let i = 1; i <= 5; i++) {
        grupoIzq.appendChild(crearSilla(letraFila, i));
      }
      filaDiv.appendChild(grupoIzq);

      // Bloque Derecho con pasillo (Sillas 6 a 10)
      const grupoDer = document.createElement('div');
      grupoDer.classList.add('sillas-grupo', 'pasillo');

      for (let i = 6; i <= sillasPorFila; i++) {
        grupoDer.appendChild(crearSilla(letraFila, i));
      }
      filaDiv.appendChild(grupoDer);

      // Etiqueta derecha de la fila
      const etiquetaDer = document.createElement('span');
      etiquetaDer.classList.add('letra-fila');
      etiquetaDer.textContent = letraFila;
      filaDiv.appendChild(etiquetaDer);

      gridAsientosEl.appendChild(filaDiv);
    });
  }

  function crearSilla(fila, numero) {
    const codigoAsiento = `${fila}${numero}`;
    const btnSilla = document.createElement('button');
    btnSilla.classList.add('asiento');
    btnSilla.textContent = numero;
    btnSilla.setAttribute('data-codigo', codigoAsiento);

    // Verificar si está ocupado
    if (ocupadosSimulados.includes(codigoAsiento)) {
      btnSilla.classList.add('ocupado');
      btnSilla.disabled = true;
    } else {
      btnSilla.addEventListener('click', () => toggleSeleccionAsiento(codigoAsiento, btnSilla));
    }

    return btnSilla;
  }

  function toggleSeleccionAsiento(codigo, elemento) {
    if (asientosSeleccionados.includes(codigo)) {
      asientosSeleccionados = asientosSeleccionados.filter(a => a !== codigo);
      elemento.classList.remove('seleccionado');
    } else {
      asientosSeleccionados.push(codigo);
      elemento.classList.add('seleccionado');
    }

    actualizarResumenPago();
  }

  function actualizarResumenPago() {
    const cantidad = asientosSeleccionados.length;
    const total = cantidad * precioUnitario;

    if (cantidad > 0) {
      asientosSeleccionadosTextoEl.textContent = asientosSeleccionados.sort().join(', ');
      totalPagarTextoEl.textContent = `$${total.toLocaleString('es-CO')} COP`;
      btnContinuarPago.disabled = false;
    } else {
      asientosSeleccionadosTextoEl.textContent = 'Ninguno';
      totalPagarTextoEl.textContent = '$0 COP';
      btnContinuarPago.disabled = true;
    }
  }

  // Navegar a confirmación de registro/pago
  if (btnContinuarPago) {
    btnContinuarPago.addEventListener('click', () => {
      if (asientosSeleccionados.length === 0) return;

      const reservaActual = {
        movieId: movieId,
        peliculaTitulo: peliculaTitulo,
        fecha: fecha,
        horario: horario,
        formato: formato,
        precioUnitario: precioUnitario,
        asientos: asientosSeleccionados.sort(),
        totalPagar: asientosSeleccionados.length * precioUnitario
      };

      // Guardar reserva en localStorage
      localStorage.setItem('vanta_reserva_temp', JSON.stringify(reservaActual));

      // Redirigir a confirmación/checkout
      window.location.href = 'confirmacion.html';
    });
  }
});