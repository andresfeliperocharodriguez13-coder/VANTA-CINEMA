document.addEventListener('DOMContentLoaded', () => {
  const reservaTemp = leerAlmacenamientoJSON('vanta_reserva_temp', null);
  const perfil = leerAlmacenamientoJSON('vanta_perfil', {});

  const nuevaSeccion = document.getElementById('seccionNuevaReserva');
  const form = document.getElementById('formReserva');
  const resultado = document.getElementById('resultadoReserva');
  const contenedor = document.getElementById('contenedorReservas');
  const vacias = document.getElementById('reservasVacias');
  const emailBuscar = document.getElementById('emailBuscarReservas');
  const btnBuscar = document.getElementById('btnBuscarReservas');

  if (perfil?.email && emailBuscar) emailBuscar.value = perfil.email;

  if (reservaTemp && nuevaSeccion) {
    nuevaSeccion.classList.remove('hidden');

    document.getElementById('reservaTitulo').textContent = reservaTemp.peliculaTitulo || 'Película';
    document.getElementById('reservaFecha').textContent = reservaTemp.fecha || '--';
    document.getElementById('reservaHora').textContent = reservaTemp.horario || '--';
    document.getElementById('reservaFormato').textContent = reservaTemp.formato || '--';
    document.getElementById('reservaSala').textContent = `Sala ${reservaTemp.roomId || '--'}`;
    document.getElementById('reservaCantidad').textContent = reservaTemp.cantidadTickets || reservaTemp.asientos?.length || 0;
    document.getElementById('reservaTotal').textContent =
      `$${Number(reservaTemp.totalPagar || 0).toLocaleString('es-CO')} COP`;

    document.getElementById('reservaAsientos').textContent =
      (reservaTemp.ubicaciones || reservaTemp.asientos?.map(seat => ({
        seatCode: seat,
        location: 'No especificada',
        type: 'Estándar'
      })) || [])
        .map(item => `${item.seatCode} — ${item.location} (${item.type})`)
        .join(' · ');

    if (perfil?.nombre) document.getElementById('nombreReserva').value = perfil.nombre;
    if (perfil?.email) document.getElementById('emailReserva').value = perfil.email;

    form?.addEventListener('submit', confirmarReserva);
  }

  btnBuscar?.addEventListener('click', () => cargarReservas(emailBuscar.value.trim()));

  if (emailBuscar?.value) {
    cargarReservas(emailBuscar.value.trim());
  }

  async function confirmarReserva(event) {
    event.preventDefault();

    if (!reservaTemp?.functionId) {
      alert('No hay una función seleccionada para reservar.');
      return;
    }

    const nombre = document.getElementById('nombreReserva').value.trim();
    const email = document.getElementById('emailReserva').value.trim();
    const documento = document.getElementById('documentoReserva').value.trim();
    const cantidadTickets = Number(reservaTemp.cantidadTickets || 0);

    if (!nombre || !email || !documento) return;

    if (cantidadTickets !== reservaTemp.asientos.length) {
      alert('La cantidad de tickets debe coincidir con las sillas seleccionadas.');
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'GUARDANDO RESERVA...';

    try {
      const response = await fetch(`${JSON_SERVER_URL}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionId: reservaTemp.functionId,
          roomId: reservaTemp.roomId,
          movieId: reservaTemp.movieId,
          pelicula: reservaTemp.peliculaTitulo,
          fecha: reservaTemp.fecha,
          horario: reservaTemp.horario,
          formato: reservaTemp.formato,
          asientos: reservaTemp.asientos,
          cantidadTickets,
          totalPagar: reservaTemp.totalPagar,
          comprador: { nombre, email, documento }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo crear la reserva.');
      }

      localStorage.setItem('vanta_perfil', JSON.stringify({
        ...perfil,
        nombre,
        email
      }));
      localStorage.setItem('vanta_ultima_reserva', JSON.stringify(data));
      localStorage.removeItem('vanta_reserva_temp');

      resultado.innerHTML = `
        <strong>✓ Reserva confirmada</strong>
        <span>Código: ${escapeHtml(data.idReserva)}</span>
        <span>Estado: RESERVADA</span>
        <span>Válida hasta: ${new Date(data.expiresAt).toLocaleString('es-CO')}</span>
        <div class="resultado-acciones">
          <button type="button" id="btnComprarReserva">COMPRAR ESTAS ENTRADAS</button>
          <button type="button" id="btnCerrarResultado">CERRAR</button>
        </div>
      `;
      resultado.classList.remove('hidden');

      document.getElementById('btnComprarReserva').addEventListener('click', () => {
        localStorage.setItem('vanta_reserva_temp', JSON.stringify({
          ...reservaTemp,
          reservationId: data.id
        }));
        window.location.href = 'confirmacion.html';
      });

      document.getElementById('btnCerrarResultado').addEventListener('click', () => {
        resultado.classList.add('hidden');
      });

      form.reset();
      await cargarReservas(email);
    } catch (error) {
      alert(error.message);
      console.error('Error al crear reserva:', error);
    } finally {
      button.disabled = false;
      button.textContent = 'CONFIRMAR RESERVA';
    }
  }

  async function cargarReservas(email) {
    if (!contenedor || !vacias) return;

    contenedor.innerHTML = '';
    const correo = String(email || '').trim();

    if (!correo) {
      vacias.classList.remove('hidden');
      vacias.querySelector('h3').textContent = 'Indica un correo para consultar tus reservas.';
      return;
    }

    try {
      const response = await fetch(
        `${JSON_SERVER_URL}/reservations?email=${encodeURIComponent(correo)}`
      );

      if (!response.ok) throw new Error('No se pudieron consultar las reservas.');

      const reservas = await response.json();
      const activas = reservas.filter(item => item.status === 'active');

      vacias.classList.toggle('hidden', activas.length > 0);

      activas.forEach(reserva => {
        const card = document.createElement('article');
        card.className = 'reserva-card';

        const title = document.createElement('h3');
        title.textContent = reserva.pelicula || 'Película';

        const code = document.createElement('span');
        code.className = 'codigo-reserva';
        code.textContent = reserva.idReserva || '--';

        const details = document.createElement('p');
        details.textContent =
          `${reserva.fecha || '--'} · ${reserva.horario || '--'} · Sala ${reserva.roomId || '--'}`;

        const seats = document.createElement('p');
        seats.textContent =
          `Asientos: ${(reserva.asientos || []).join(', ')} · Tickets: ${reserva.cantidadTickets || reserva.asientos?.length || 0}`;

        const expiry = document.createElement('p');
        expiry.className = 'reserva-expira';
        expiry.textContent =
          `Reservada hasta: ${new Date(reserva.expiresAt).toLocaleString('es-CO')}`;

        const cancel = document.createElement('button');
        cancel.type = 'button';
        cancel.className = 'btn-cancelar-reserva';
        cancel.textContent = 'CANCELAR RESERVA';
        cancel.addEventListener('click', () => cancelarReserva(reserva.id, correo));

        card.append(title, code, details, seats, expiry, cancel);
        contenedor.appendChild(card);
      });
    } catch (error) {
      console.error(error);
      vacias.classList.remove('hidden');
      vacias.querySelector('h3').textContent = 'No se pudieron cargar las reservas.';
    }
  }

  async function cancelarReserva(id, email) {
    if (!confirm('¿Deseas cancelar esta reserva y liberar sus asientos?')) return;

    try {
      const response = await fetch(
        `${JSON_SERVER_URL}/reservations/${encodeURIComponent(id)}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo cancelar la reserva.');
      }

      alert('Reserva cancelada. Los asientos volvieron a estar disponibles.');
      await cargarReservas(email);
    } catch (error) {
      alert(error.message);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
});
