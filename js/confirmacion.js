document.addEventListener('DOMContentLoaded', () => {
  // Cargar reserva previa guardada en localStorage
  const reservaTemp = JSON.parse(localStorage.getItem('vanta_reserva_temp') || 'null');

  const seccionFormulario = document.getElementById('seccionFormulario');
  const seccionBoleto = document.getElementById('seccionBoleto');
  const formCheckout = document.getElementById('formCheckout');

  if (!reservaTemp) {
    alert('No se encontró ninguna reserva activa. Serás redirigido a la cartelera.');
    window.location.href = '../index.html';
    return;
  }

  // Renderizar Resumen en Formulario
  document.getElementById('resumenTitulo').textContent = reservaTemp.peliculaTitulo;
  document.getElementById('resumenFechaHora').textContent = `${reservaTemp.fecha} — ${reservaTemp.horario}`;
  document.getElementById('resumenFormato').textContent = reservaTemp.formato;
  document.getElementById('resumenAsientos').textContent = reservaTemp.asientos.join(', ');
  document.getElementById('resumenTotal').textContent = `$${reservaTemp.totalPagar.toLocaleString('es-CO')} COP`;

  // Manejar submit de compra
  formCheckout.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreComprador').value.trim();
    const email = document.getElementById('emailComprador').value.trim();
    const documento = document.getElementById('documentoComprador').value.trim();

    if (!nombre || !email || !documento) return;

    // Generar código aleatorio de reserva único
    const codigoReserva = 'VT-' + Math.floor(100000 + Math.random() * 900000);

    // Crear objeto final de compra
    const compraFinalizada = {
      idReserva: codigoReserva,
      fechaReserva: new Date().toISOString(),
      comprador: { nombre, email, documento },
      pelicula: reservaTemp.peliculaTitulo,
      fecha: reservaTemp.fecha,
      horario: reservaTemp.horario,
      formato: reservaTemp.formato,
      asientos: reservaTemp.asientos,
      totalPagar: reservaTemp.totalPagar
    };

    // GUARDAR EN HISTORIAL (Persistencia Local RF-07)
    const historialPrevio = JSON.parse(localStorage.getItem('vanta_historial_reservas') || '[]');
    historialPrevio.push(compraFinalizada);
    localStorage.setItem('vanta_historial_reservas', JSON.stringify(historialPrevio));

    // Limpiar reserva temporal
    localStorage.removeItem('vanta_reserva_temp');

    // Llenar datos del Boleto Digital
    document.getElementById('ticketCodigo').textContent = `#${codigoReserva}`;
    document.getElementById('ticketTitulo').textContent = compraFinalizada.pelicula;
    document.getElementById('ticketFecha').textContent = compraFinalizada.fecha;
    document.getElementById('ticketHora').textContent = compraFinalizada.horario;
    document.getElementById('ticketFormato').textContent = compraFinalizada.formato;
    document.getElementById('ticketAsientos').textContent = compraFinalizada.asientos.join(', ');
    document.getElementById('ticketNombre').textContent = compraFinalizada.comprador.nombre;

    // Generar Código QR mediante API pública limpia
    const qrData = encodeURIComponent(`VANTA-CINEMA|${codigoReserva}|${compraFinalizada.pelicula}|${compraFinalizada.asientos.join('-')}`);
    document.getElementById('ticketQR').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    // Cambiar vista
    seccionFormulario.classList.add('hidden');
    seccionBoleto.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});