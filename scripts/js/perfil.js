document.addEventListener('DOMContentLoaded', () => {
  const formPerfil = document.getElementById('formPerfil');
  const contenedorHistorial = document.getElementById('contenedorHistorial');

  // Cargar historial de compras desde localStorage (RF-07)
  const historial = leerAlmacenamientoJSON('vanta_historial_reservas', []);
  const perfilGuardado = leerAlmacenamientoJSON('vanta_perfil', null);

  if (perfilGuardado) {
    document.getElementById('nombrePerfil').value = perfilGuardado.nombre || '';
    document.getElementById('emailPerfil').value = perfilGuardado.email || '';
    document.getElementById('telefonoPerfil').value = perfilGuardado.telefono || '';
  }

  if (historial.length > 0) {
    contenedorHistorial.replaceChildren(...historial.map(item => {
      const card = document.createElement('div');
      card.className = 'historial-item';
      const info = document.createElement('div');
      const reservation = document.createElement('span');
      reservation.textContent = `RESERVA #${item.idReserva || '--'}`;
      const title = document.createElement('h3');
      title.textContent = item.pelicula || 'Película';
      const details = document.createElement('p');
      details.textContent = `${item.fecha || '--'} — ${item.horario || '--'} | Asientos: ${(item.asientos || []).join(', ')}`;
      const total = document.createElement('span');
      total.textContent = `$${Number(item.totalPagar || 0).toLocaleString('es-CO')} COP`;
      info.append(reservation, title, details);
      card.append(info, total);
      return card;
    }));
  }

  // Guardar perfil
  formPerfil.addEventListener('submit', (e) => {
    e.preventDefault();
    const perfil = {
      nombre: document.getElementById('nombrePerfil').value.trim(),
      email: document.getElementById('emailPerfil').value.trim(),
      telefono: document.getElementById('telefonoPerfil').value.trim()
    };
    localStorage.setItem('vanta_perfil', JSON.stringify(perfil));
    alert('Información del perfil actualizada.');
  });
});
