document.addEventListener('DOMContentLoaded', () => {
  const funcion = leerAlmacenamientoJSON('vanta_funcion_seleccionada', null);
  const contenedor = document.getElementById('contenedorSillas');
  const boton = document.getElementById('btnConfirmarReserva');

  if (!contenedor || !boton) return;

  // Esta vista heredada no duplica la lógica de compra. Lleva al selector
  // actual, que es el único que aplica disponibilidad y bloqueo de asientos.
  if (funcion?.functionId) {
    document.getElementById('nombrePelicula').textContent = funcion.peliculaTitulo || 'Película seleccionada';
    document.getElementById('fechaFuncion').textContent = funcion.fecha || '--';
    document.getElementById('horaFuncion').textContent = funcion.horario || '--';
    document.getElementById('salaFuncion').textContent = `Sala ${funcion.roomId || '--'}`;
    contenedor.textContent = 'Continúa para seleccionar tus sillas.';
    boton.textContent = 'SELECCIONAR SILLAS';
    boton.addEventListener('click', () => { window.location.href = 'asientos.html'; });
    return;
  }

  contenedor.textContent = 'Primero elige una película y una función en la cartelera.';
  boton.textContent = 'VER CARTELERA';
  boton.addEventListener('click', () => { window.location.href = '../index.html#cartelera'; });
});
