document.addEventListener("DOMContentLoaded", async function () {
  const detallePelicula = document.getElementById("detallePelicula");
  if (!detallePelicula) return;

  // Lee el  id de la URL (?id=12345asdkasjkd)
  const urlParams = new URLSearchParams(window.location.search);
  const idPelicula = urlParams.get("id");

  if (!idPelicula) {
    detallePelicula.innerHTML = "<p>No se especificó ninguna película.</p>";
    return;
  }

  try {
    const respuesta = await fetch(
      `${URL_TMDB}/movie/${idPelicula}?api_key=${API_KEY}&language=es-ES&append_to_response=credits,videos`
    );
    const pelicula = await respuesta.json();

    const director = pelicula.credits?.crew?.find(persona => persona.job === "Director");
    const trailer = pelicula.videos?.results?.find(video => video.type === "Trailer" && video.site === "YouTube");

    detallePelicula.innerHTML = `
      <div class="detalle-contenido">
        <img src="${URL_IMAGEN + pelicula.poster_path}" alt="${pelicula.title}">
        <div class="detalle-info">
          <h2>${pelicula.title}</h2>
          <p>${pelicula.overview || "Sin sinopsis disponible."}</p>
          <ul>
            <li><strong>Géneros:</strong> ${pelicula.genres.map(g => g.name).join(", ")}</li>
            <li><strong>Duración:</strong> ${pelicula.runtime} minutos</li>
            <li><strong>Estreno:</strong> ${pelicula.release_date}</li>
            <li><strong>Director:</strong> ${director ? director.name : "No disponible"}</li>
            <li><strong>Valoración:</strong> ⭐ ${pelicula.vote_average.toFixed(1)}</li>
          </ul>
          <a href="funciones.html?tmdbId=${pelicula.id}" class="btn-funciones">Ver Funciones</a>
        </div>
      </div>

      <div class="trailer-container">
        <h3>Tráiler Oficial</h3>
        ${
          trailer
            ? `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`
            : "<p>No hay tráiler disponible.</p>"
        }
      </div>
    `;
  } catch (error) {
    console.error("Error al obtener detalle de la película:", error);
  }
});