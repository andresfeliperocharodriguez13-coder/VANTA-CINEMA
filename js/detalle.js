document.addEventListener('DOMContentLoaded', async () => {
  const parametrosURL = new URLSearchParams(window.location.search);
  const movieId = parametrosURL.get('id');

  const loading = document.getElementById('loading');
  const detallePelicula = document.getElementById('detallePelicula');

  const baseUrlReal = (typeof BASE_URL !== 'undefined') ? BASE_URL : 'https://api.themoviedb.org/3';
  const apiKeyReal = (typeof API_KEY !== 'undefined') ? API_KEY : '';
  const imgBaseReal = (typeof IMAGE_BASE_URL !== 'undefined') ? IMAGE_BASE_URL : 'https://image.tmdb.org/t/p/w500';

  if (!movieId) {
    if (loading) loading.textContent = '⚠️ No se especificó ninguna película. Vuelve a la cartelera.';
    return;
  }

  if (!apiKeyReal || apiKeyReal === 'TU_API_KEY_AQUI') {
    if (loading) loading.textContent = '⚠️ Falta configurar tu API Key en js/config.js';
    return;
  }

  try {
    //  Datos principales de la película
    const resPeli = await fetch(`${baseUrlReal}/movie/${movieId}?api_key=${apiKeyReal}&language=es-ES`);
    if (!resPeli.ok) throw new Error(`Error ${resPeli.status} de TMDB: Película no encontrada.`);
    const pelicula = await resPeli.json();

    //  Tráiler
    const resVideos = await fetch(`${baseUrlReal}/movie/${movieId}/videos?api_key=${apiKeyReal}&language=es-ES`);
    const dataVideos = resVideos.ok ? await resVideos.json() : { results: [] };

    //  Créditos (Director y Reparto)
    const resCreditos = await fetch(`${baseUrlReal}/movie/${movieId}/credits?api_key=${apiKeyReal}&language=es-ES`);
    const dataCreditos = resCreditos.ok ? await resCreditos.json() : { cast: [], crew: [] };

    // Los datos principales
    document.getElementById('titulo').textContent = pelicula.title || 'Sin Título';
    document.getElementById('tagline').textContent = pelicula.tagline ? `"${pelicula.tagline}"` : '';
    document.getElementById('duracion').textContent = pelicula.runtime || 'N/A';
    document.getElementById('promedio').textContent = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : 'N/A';
    document.getElementById('fecha').textContent = pelicula.release_date || 'Por anunciar';
    document.getElementById('sinopsis').textContent = pelicula.overview || 'Sinopsis no disponible en español.';

    // Enlace al botón de funciones
    const btnVerFunciones = document.getElementById('btnVerFunciones');
    if (btnVerFunciones) {
      btnVerFunciones.href = `funciones.html?id=${pelicula.id}`;
    }

    // Imágenes
    if (pelicula.poster_path) {
      document.getElementById('poster').src = `${imgBaseReal}${pelicula.poster_path}`;
    } else {
      document.getElementById('poster').src = 'https://via.placeholder.com/300x450?text=Sin+Poster';
    }

    if (pelicula.backdrop_path) {
      document.getElementById('backdropBg').style.backgroundImage = `url(https://image.tmdb.org/t/p/original${pelicula.backdrop_path})`;
    }

    // Géneros como píldoras
    const generosContainer = document.getElementById('generos');
    if (generosContainer && pelicula.genres && pelicula.genres.length > 0) {
      generosContainer.innerHTML = pelicula.genres
        .map(g => `<span class="tag-genero">${g.name}</span>`)
        .join('');
    } else if (generosContainer) {
      generosContainer.innerHTML = '<span class="tag-genero">Cine</span>';
    }

    // Director
    const director = dataCreditos.crew?.find(persona => persona.job === 'Director');
    document.getElementById('directorNombre').textContent = director ? director.name : 'No disponible';

    // Los actores
    const contenedorReparto = document.getElementById('contenedorReparto');
    if (contenedorReparto) {
      const actoresPrincipales = dataCreditos.cast?.slice(0, 15) || [];
      if (actoresPrincipales.length === 0) {
        contenedorReparto.innerHTML = '<p style="color:#888;">Información del reparto no disponible.</p>';
      } else {
        contenedorReparto.innerHTML = actoresPrincipales.map(actor => {
          const foto = actor.profile_path 
            ? `${imgBaseReal}${actor.profile_path}` 
            : 'https://via.placeholder.com/150x225?text=Sin+Foto';
          return `
            <div class="actor-card">
              <img src="${foto}" alt="${actor.name}" loading="lazy">
              <div class="actor-info">
                <p class="nombre-actor" title="${actor.name}">${actor.name}</p>
                <p class="personaje-actor" title="${actor.character}">${actor.character || 'Personaje'}</p>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Tráiler de yutu
    const contenedorTrailer = document.getElementById('contenedorTrailer');
    const trailer = dataVideos.results?.find(
      v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
    );

    if (trailer && contenedorTrailer) {
      contenedorTrailer.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${trailer.key}" 
          title="Tráiler de ${pelicula.title}" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
    } else if (contenedorTrailer) {
      contenedorTrailer.innerHTML = '<p class="sin-trailer">Tráiler no disponible para esta película.</p>';
    }

    // Muestra contenido
    if (loading) loading.classList.add('hidden');
    if (detallePelicula) detallePelicula.classList.remove('hidden');

  } catch (error) {
    console.error('Error al cargar detalle:', error);
    if (loading) loading.textContent = `⚠️ ${error.message}`;
  }
});