document.addEventListener("DOMContentLoaded", function () {
  const contenedorPeliculas = document.getElementById("contenedorPeliculas");
  const buscarPelicula = document.getElementById("buscarPelicula");
  const btnBuscar = document.getElementById("btnBuscar");
  const header = document.querySelector("header");

  // Si no existe el contenedor de películas en la página actual detiene el script xd
  if (!contenedorPeliculas) return;

  let peliculasActuales = [];
  let fondoActual = 0;

  // Evento de Búsqueda
  if (btnBuscar && buscarPelicula) {
    btnBuscar.addEventListener("click", function () {
      const texto = buscarPelicula.value.trim();
      if (texto === "") {
        obtenerPeliculas();
      } else {
        buscarPeliculas(texto);
      }
    });
  }

  // Obtener películas de TMDB
  async function obtenerPeliculas() {
    try {
      const respuesta = await fetch(
        `${URL_TMDB}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`
      );
      const datos = await respuesta.json();
      peliculasActuales = datos.results;

      mostrarPeliculas(peliculasActuales);
      if (header) cambiarFondoConPeliculas();
    } catch (error) {
      console.error("Error al obtener películas:", error);
    }
  }

  // Buscar películas por texto
  async function buscarPeliculas(texto) {
    try {
      const respuesta = await fetch(
        `${URL_TMDB}/search/movie?api_key=${API_KEY}&language=es-ES&query=${texto}`
      );
      const datos = await respuesta.json();
      peliculasActuales = datos.results;

      mostrarPeliculas(peliculasActuales);
    } catch (error) {
      console.error("Error al buscar películas:", error);
    }
  }

  // Renderizar tarjetas de películas
  function mostrarPeliculas(peliculas) {
    contenedorPeliculas.innerHTML = "";

    if (!peliculas || peliculas.length === 0) {
      contenedorPeliculas.innerHTML = "<p>No se encontraron películas.</p>";
      return;
    }

    peliculas.forEach(function (pelicula) {
      const article = document.createElement("article");

      const poster = pelicula.poster_path
        ? URL_IMAGEN + pelicula.poster_path
        : "https://via.placeholder.com/500x750?text=VANTA-CINEMA";

      // Redirecciona a pages/detalle.html enviando el id por URL
      article.innerHTML = `
        <img src="${poster}" alt="${pelicula.title}">
        <h3>${pelicula.title}</h3>
        <p>Fecha de estreno: ${pelicula.release_date || "No disponible"}</p>
        <a href="pages/detalle.html?id=${pelicula.id}" class="btn-detalle">Ver detalle</a>
      `;

      contenedorPeliculas.appendChild(article);
    });
  }

  // Cambiar fondo del hero automáticamente
  function cambiarFondoConPeliculas() {
    setInterval(function () {
      if (peliculasActuales.length === 0) return;

      const pelicula = peliculasActuales[fondoActual];

      if (pelicula.backdrop_path) {
        header.style.backgroundImage = `
          linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.55)),
          url("${URL_BACKDROP + pelicula.backdrop_path}")
        `;
      }

      fondoActual++;

      if (fondoActual >= peliculasActuales.length) {
        fondoActual = 0;
      }
    }, 5000);
  }

  // Iniciar carga
  obtenerPeliculas();
});