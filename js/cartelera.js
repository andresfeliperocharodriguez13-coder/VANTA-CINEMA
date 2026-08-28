document.addEventListener("DOMContentLoaded", function () {
  const contenedorPeliculas = document.getElementById("contenedorPeliculas");
  const buscarPelicula = document.getElementById("buscarPelicula");
  const btnBuscar = document.getElementById("btnBuscar");
  const filtroGenero = document.getElementById("filtroGenero");
  const header = document.querySelector("header");

  // Si no existe el contenedor de películas en la página actual, detiene el script
  if (!contenedorPeliculas) return;

  let peliculasOriginales = [];
  let peliculasActuales = [];
  let fondoActual = 0;
  let intervaloFondo = null;

  // 1. Escuchadores de eventos para búsqueda y filtro
  if (btnBuscar && buscarPelicula) {
    btnBuscar.addEventListener("click", ejecutarBusqueda);
    buscarPelicula.addEventListener("keyup", function (e) {
      if (e.key === "Enter") ejecutarBusqueda();
    });
  }

  if (filtroGenero) {
    filtroGenero.addEventListener("change", function () {
      const generoId = parseInt(this.value, 10);
      if (isNaN(generoId)) {
        mostrarPeliculas(peliculasOriginales);
      } else {
        const filtradas = peliculasOriginales.filter((p) =>
          p.genre_ids && p.genre_ids.includes(generoId)
        );
        mostrarPeliculas(filtradas);
      }
    });
  }

  function ejecutarBusqueda() {
    const texto = buscarPelicula.value.trim();
    if (texto === "") {
      mostrarPeliculas(peliculasOriginales);
    } else {
      buscarPeliculas(texto);
    }
  }

  // 2. Obtener películas iniciales en cartelera
  async function obtenerPeliculas() {
    try {
      const respuesta = await fetch(
        `${URL_TMDB}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`
      );
      const datos = await respuesta.json();
      peliculasOriginales = datos.results || [];
      peliculasActuales = [...peliculasOriginales];

      mostrarPeliculas(peliculasActuales);
      if (header) cambiarFondoConPeliculas();
    } catch (error) {
      console.error("Error al obtener películas:", error);
    }
  }

  // 3. Buscar películas por texto en TMDB
  async function buscarPeliculas(texto) {
    try {
      const respuesta = await fetch(
        `${URL_TMDB}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(texto)}`
      );
      const datos = await respuesta.json();
      peliculasActuales = datos.results || [];

      mostrarPeliculas(peliculasActuales);
    } catch (error) {
      console.error("Error al buscar películas:", error);
    }
  }

  // 4. Renderizar tarjetas de películas en el DOM
  function mostrarPeliculas(peliculas) {
    peliculasActuales = peliculas;
    contenedorPeliculas.innerHTML = "";
    fondoActual = 0; // Reiniciar índice de fondo

    if (!peliculas || peliculas.length === 0) {
      contenedorPeliculas.innerHTML = "<p class='sin-resultados'>No se encontraron películas.</p>";
      return;
    }

    peliculas.forEach(function (pelicula) {
      const article = document.createElement("article");
      article.className = "pelicula-card";

      const poster = pelicula.poster_path
        ? URL_IMAGEN + pelicula.poster_path
        : "https://via.placeholder.com/500x750?text=VANTA-CINEMA";

      article.innerHTML = `
        <div class="pelicula-poster">
          <img src="${poster}" alt="${pelicula.title}" loading="lazy">
        </div>
        <div class="pelicula-info">
          <h3>${pelicula.title}</h3>
          <p>Estreno: ${pelicula.release_date || "No disponible"}</p>
          <a href="pages/detalle.html?id=${pelicula.id}" class="btn-detalle">Ver detalle</a>
        </div>
      `;

      contenedorPeliculas.appendChild(article);
    });
  }

  // 5. Rotación automática del fondo del Hero
  function cambiarFondoConPeliculas() {
    if (intervaloFondo) clearInterval(intervaloFondo);

    intervaloFondo = setInterval(function () {
      if (!peliculasActuales || peliculasActuales.length === 0) return;

      // Reset de índice seguro antes de la lectura
      if (fondoActual >= peliculasActuales.length) {
        fondoActual = 0;
      }

      const pelicula = peliculasActuales[fondoActual];

      if (pelicula && pelicula.backdrop_path) {
        header.style.backgroundImage = `
          linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.75)),
          url("${URL_BACKDROP + pelicula.backdrop_path}")
        `;
        header.style.backgroundSize = "cover";
        header.style.backgroundPosition = "center";
        header.style.transition = "background-image 0.8s ease-in-out";
      }

      fondoActual++;
    }, 5000);
  }

  // Iniciar flujo
  obtenerPeliculas();
});