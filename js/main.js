const API_KEY = "e5cec716f497580725e06e674ee89fb0";
const URL_TMDB = "https://api.themoviedb.org/3";
const URL_IMAGEN = "https://image.tmdb.org/t/p/w500";

const contenedorPeliculas = document.getElementById("contenedorPeliculas");

async function obtenerPeliculas() {
  try {
    const respuesta = await fetch(
      `${URL_TMDB}/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`
    );

    const datos = await respuesta.json();

    console.log(datos);

    mostrarPeliculas(datos.results);
  } catch (error) {
    console.log("Error al obtener películas:", error);
  }
}

function mostrarPeliculas(peliculas) {
  contenedorPeliculas.innerHTML = "";

  peliculas.forEach(function (pelicula) {
    const article = document.createElement("article");

    article.innerHTML = `
      <img src="${URL_IMAGEN + pelicula.poster_path}" alt="${pelicula.title}">
      <h3>${pelicula.title}</h3>
      <p>Fecha de estreno: ${pelicula.release_date}</p>
      <button>Ver detalle</button>
    `;

    contenedorPeliculas.appendChild(article);
  });
}

obtenerPeliculas();