
document.addEventListener("DOMContentLoaded", function () {
  const btnAbrirMenu = document.getElementById("btnAbrirMenu");
  const btnCerrarMenu = document.getElementById("btnCerrarMenu");
  const menuLateral = document.getElementById("menuLateral");
  const header = document.querySelector("header");

  // Abrir Menú
  if (btnAbrirMenu && menuLateral) {
    btnAbrirMenu.addEventListener("click", function () {
      menuLateral.classList.add("activo");
    });
  }

  // Cerrar Menú
  if (btnCerrarMenu && menuLateral) {
    btnCerrarMenu.addEventListener("click", function () {
      menuLateral.classList.remove("activo");
    });
  }

  // Efecto Parallax en el Header
  if (header) {
    window.addEventListener("scroll", function () {
      const scroll = window.scrollY;
      header.style.backgroundPositionY = scroll * 0.35 + "px";
    });
  }
});