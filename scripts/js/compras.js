document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedorCompras');
  const sinCompras = document.getElementById('sinCompras');
  const detalle = document.getElementById('detalleCompra');

  if (!contenedor || !sinCompras || !detalle) return;

  const compras = leerAlmacenamientoJSON('vanta_historial_reservas', []);
  sinCompras.classList.toggle('hidden', compras.length > 0);

  compras.slice().reverse().forEach(compra => {
    const card = document.createElement('article');
    card.className = 'compra-card';
    const title = document.createElement('h3');
    title.textContent = compra.pelicula || 'Película';
    const meta = document.createElement('p');
    meta.textContent = `${compra.fecha || '--'} · ${compra.horario || '--'} · ${(compra.asientos || []).join(', ')}`;
    const total = document.createElement('strong');
    total.textContent = `$${Number(compra.totalPagar || 0).toLocaleString('es-CO')} COP`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn-primary';
    button.textContent = 'Ver detalle';
    button.addEventListener('click', () => mostrarDetalle(compra));
    card.append(title, meta, total, button);
    contenedor.appendChild(card);
  });

  function mostrarDetalle(compra) {
    document.getElementById('compraPelicula').textContent = compra.pelicula || '--';
    document.getElementById('compraFecha').textContent = compra.fecha || '--';
    document.getElementById('compraHora').textContent = compra.horario || '--';
    document.getElementById('compraSala').textContent = compra.formato || '--';
    document.getElementById('compraSillas').textContent = (compra.asientos || []).join(', ') || '--';
    document.getElementById('compraTotal').textContent = `$${Number(compra.totalPagar || 0).toLocaleString('es-CO')} COP`;
    detalle.classList.remove('hidden');
    detalle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
