const API_KEY = "e5cec716f497580725e06e674ee89fb0";
const URL_TMDB = "https://api.themoviedb.org/3";
const URL_IMAGEN = "https://image.tmdb.org/t/p/w500";
const URL_BACKDROP = "https://image.tmdb.org/t/p/original";

const contenedorPeliculas = document.getElementById("contenedorPeliculas");
const detallePelicula = document.getElementById("detallePelicula");
const buscarPelicula = document.getElementById("buscarPelicula");
const btnBuscar = document.getElementById("btnBuscar");
const header = document.querySelector("header");

const btnAbrirMenu = document.getElementById("btnAbrirMenu");
const btnCerrarMenu = document.getElementById("btnCerrarMenu");
const menuLateral = document.getElementById("menuLateral");

let peliculasActuales = [];
let fondoActual = 0;

btnAbrirMenu.addEventListener("click", function () {
  menuLateral.classList.add("activo");
});

btnCerrarMenu.addEventListener("click", function () {
  menuLateral.classList.remove("activo");
});

btnBuscar.addEventListener("click", function () {
  const texto = buscarPelicula.value.trim();

  if (texto === "") {
    obtenerPeliculas();
  } else {
    buscarPeliculas(texto);
  }
});

async function obtenerPeliculas() {
  const respuesta = await fetch(
    `${URL_TMDB}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`
  );

  const datos = await respuesta.json();
  peliculasActuales = datos.results;

  mostrarPeliculas(peliculasActuales);
  cambiarFondoConPeliculas();
}

async function buscarPeliculas(texto) {
  const respuesta = await fetch(
    `${URL_TMDB}/search/movie?api_key=${API_KEY}&language=es-ES&query=${texto}`
  );

  const datos = await respuesta.json();
  peliculasActuales = datos.results;

  mostrarPeliculas(peliculasActuales);
}

function mostrarPeliculas(peliculas) {
  contenedorPeliculas.innerHTML = "";

  peliculas.forEach(function (pelicula) {
    const article = document.createElement("article");

    const poster = pelicula.poster_path
      ? URL_IMAGEN + pelicula.poster_path
      : "https://via.placeholder.com/500x750?text=VANTA-CINEMA";

    article.innerHTML = `
      <img src="${poster}" alt="${pelicula.title}">
      <h3>${pelicula.title}</h3>
      <p>Fecha de estreno: ${pelicula.release_date || "No disponible"}</p>
      <button type="button">Ver detalle</button>
    `;

    const boton = article.querySelector("button");

    boton.addEventListener("click", function () {
      obtenerDetallePelicula(pelicula.id);
    });

    contenedorPeliculas.appendChild(article);
  });
}

async function obtenerDetallePelicula(idPelicula) {
  const respuesta = await fetch(
    `${URL_TMDB}/movie/${idPelicula}?api_key=${API_KEY}&language=es-ES&append_to_response=credits,videos`
  );

  const pelicula = await respuesta.json();

  const director = pelicula.credits.crew.find(function (persona) {
    return persona.job === "Director";
  });

  const trailer = pelicula.videos.results.find(function (video) {
    return video.type === "Trailer" && video.site === "YouTube";
  });

  detallePelicula.innerHTML = `
    <h3>${pelicula.title}</h3>
    <p>${pelicula.overview || "Sin sinopsis disponible."}</p>

    <ul>
      <li>Géneros: ${pelicula.genres.map(genero => genero.name).join(", ")}</li>
      <li>Duración: ${pelicula.runtime} minutos</li>
      <li>Estreno: ${pelicula.release_date}</li>
      <li>Director: ${director ? director.name : "No disponible"}</li>
      <li>Valoración: ${pelicula.vote_average}</li>
    </ul>

    ${
      trailer
        ? `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">Ver trailer</a>`
        : "<p>No hay trailer disponible.</p>"
    }
  `;

  document.getElementById("detalle").scrollIntoView();
}

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

window.addEventListener("scroll", function () {
  const scroll = window.scrollY;
  header.style.backgroundPositionY = scroll * 0.35 + "px";
});

obtenerPeliculas();