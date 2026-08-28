document.addEventListener('DOMContentLoaded', () => {
  const formPerfil = document.getElementById('formPerfil');
  const contenedorHistorial = document.getElementById('contenedorHistorial');

  // Cargar historial de compras desde localStorage (RF-07)
  const historial = JSON.parse(localStorage.getItem('vanta_historial_reservas') || '[]');

  if (historial.length > 0) {
    contenedorHistorial.innerHTML = historial.map(item => `
      <div style="background: #141414; padding: 18px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 0.65rem; color: #888; font-weight:700; letter-spacing:1px;">RESERVA #${item.idReserva}</span>
          <h3 style="font-size: 1.1rem; color: #fff; margin: 4px 0;">${item.pelicula}</h3>
          <p style="font-size: 0.8rem; color: #aaa;">${item.fecha} — ${item.horario} | Asientos: ${item.asientos.join(', ')}</p>
        </div>
        <span style="font-weight: 800; color: #ffffff;">$${item.totalPagar.toLocaleString('es-CO')} COP</span>
      </div>
    `).join('');
  }

  // Guardar perfil
  formPerfil.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Información del perfil actualizada.');
  });
});