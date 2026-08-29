document.addEventListener('DOMContentLoaded', async () => {
  const parametrosURL = new URLSearchParams(window.location.search);
  const movieId = parametrosURL.get('id');

  const loading = document.getElementById('loading');
  const detallePelicula = document.getElementById('detallePelicula');

  const baseUrlReal = (typeof BASE_URL !== 'undefined') ? BASE_URL : '/api/tmdb';
  const imgBaseReal = (typeof IMAGE_BASE_URL !== 'undefined') ? IMAGE_BASE_URL : 'https://image.tmdb.org/t/p/w500';

  if (!movieId) {
    if (loading) loading.textContent = '⚠️ No se especificó ninguna película. Vuelve a la cartelera.';
    return;
  }

  try {
    //  Datos principales de la película
    const resPeli = await fetch(`${baseUrlReal}/movie/${encodeURIComponent(movieId)}?language=es-ES`);
    if (!resPeli.ok) throw new Error(`Error ${resPeli.status} de TMDB: Película no encontrada.`);
    const pelicula = await resPeli.json();

    //  Tráiler
    const resVideos = await fetch(`${baseUrlReal}/movie/${encodeURIComponent(movieId)}/videos?language=es-ES`);
    const dataVideos = resVideos.ok ? await resVideos.json() : { results: [] };

    //  Créditos (Director y Reparto)
    const resCreditos = await fetch(`${baseUrlReal}/movie/${encodeURIComponent(movieId)}/credits?language=es-ES`);
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
      generosContainer.replaceChildren(...pelicula.genres.map(g => {
        const genre = document.createElement('span');
        genre.className = 'tag-genero';
        genre.textContent = g.name;
        return genre;
      }));
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
        contenedorReparto.replaceChildren(...actoresPrincipales.map(actor => {
          const foto = actor.profile_path 
            ? `${imgBaseReal}${actor.profile_path}` 
            : 'https://via.placeholder.com/150x225?text=Sin+Foto';
          const card = document.createElement('div');
          card.className = 'actor-card';
          const image = document.createElement('img');
          image.src = foto;
          image.alt = actor.name || 'Actor';
          image.loading = 'lazy';
          const info = document.createElement('div');
          info.className = 'actor-info';
          const name = document.createElement('p');
          name.className = 'nombre-actor';
          name.title = actor.name || '';
          name.textContent = actor.name || 'Sin nombre';
          const character = document.createElement('p');
          character.className = 'personaje-actor';
          character.title = actor.character || '';
          character.textContent = actor.character || 'Personaje';
          info.append(name, character);
          card.append(image, info);
          return card;
        }));
      }
    }

    // Tráiler de yutu
    const contenedorTrailer = document.getElementById('contenedorTrailer');
    const trailer = dataVideos.results?.find(
      v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
    );

    if (trailer && contenedorTrailer && /^[A-Za-z0-9_-]+$/.test(trailer.key)) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${trailer.key}`;
      iframe.title = `Tráiler de ${pelicula.title || 'la película'}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      contenedorTrailer.replaceChildren(iframe);
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
