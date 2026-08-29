document.addEventListener('DOMContentLoaded', () => {
  // Cargar reserva previa guardada en localStorage
  const reservaTemp = leerAlmacenamientoJSON('vanta_reserva_temp', null);

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
  formCheckout.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreComprador').value.trim();
    const email = document.getElementById('emailComprador').value.trim();
    const documento = document.getElementById('documentoComprador').value.trim();

    if (!nombre || !email || !documento) return;

    const btnConfirmar = formCheckout.querySelector('button[type="submit"]');
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'VALIDANDO ASIENTOS...';

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
      functionId: reservaTemp.functionId,
      roomId: reservaTemp.roomId,
      asientos: reservaTemp.asientos,
      totalPagar: reservaTemp.totalPagar
    };

    try {
      // El servidor valida y guarda en una única operación atómica.
      const respuestaCompra = await fetch(`${JSON_SERVER_URL}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compraFinalizada)
      });

      if (respuestaCompra.status === 409) {
        alert('Uno o más asientos ya fueron vendidos. Vuelve a seleccionar tus sillas.');
        window.location.href = 'asientos.html';
        return;
      }

      if (!respuestaCompra.ok) {
        throw new Error('No fue posible registrar la compra.');
      }

    } catch (error) {
      // Respaldo para conexiones sin servidor.
      const comprasLocales = leerAlmacenamientoJSON(
        'vanta_compras_confirmadas',
        []
      );
      const asientosYaVendidos = new Set(
        comprasLocales
          .filter(compra => String(compra.functionId) === String(reservaTemp.functionId))
          .flatMap(compra => compra.asientos || [])
      );

      if (reservaTemp.asientos.some(asiento => asientosYaVendidos.has(asiento))) {
        alert('Uno o más asientos ya fueron vendidos. Vuelve a seleccionar tus sillas.');
        window.location.href = 'asientos.html';
        return;
      }

      comprasLocales.push(compraFinalizada);
      localStorage.setItem('vanta_compras_confirmadas', JSON.stringify(comprasLocales));
      console.warn('Compra guardada localmente:', error);
    }

    // GUARDAR EN HISTORIAL (Persistencia Local RF-07)
    const historialPrevio = leerAlmacenamientoJSON('vanta_historial_reservas', []);
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
