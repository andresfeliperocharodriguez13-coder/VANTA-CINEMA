// ========================================
// CONFIGURACIÓN TMDB
// ========================================

const API_KEY = "e5cec716f497580725e06e674ee89fb";

const URL_TMDB = "https://api.themoviedb.org/3";

const URL_IMAGEN = "https://image.tmdb.org/t/p/w500";


// ========================================
// OBTENER ID DE LA URL
// ========================================

const parametros = new URLSearchParams(
    window.location.search
);

const idPelicula = parametros.get("id");


// ========================================
// ELEMENTOS DEL HTML
// ========================================

const detalle = document.getElementById(
    "detallePelicula"
);

const trailer = document.getElementById(
    "trailer"
);


// ========================================
// OBTENER INFORMACIÓN
// ========================================

async function cargarDetalle() {

    if (!idPelicula) {

        detalle.innerHTML = `
            <h2>
                Película no encontrada
            </h2>
        `;

        return;

    }


    try {

        const respuesta = await fetch(
            `${URL_TMDB}/movie/${idPelicula}?api_key=${API_KEY}&language=es-ES&append_to_response=credits,videos`
        );


        const pelicula = await respuesta.json();


        mostrarDetalle(pelicula);


    } catch (error) {

        console.error(
            "Error:",
            error
        );


        detalle.innerHTML = `
            <h2>
                No se pudo cargar la película
            </h2>
        `;

    }

}


// ========================================
// MOSTRAR DETALLE
// ========================================

function mostrarDetalle(pelicula) {

    const poster = pelicula.poster_path
        ? URL_IMAGEN + pelicula.poster_path
        : "https://via.placeholder.com/500x750?text=VANTA-CINEMA";


    // DIRECTOR

    const director =
        pelicula.credits.crew.find(
            function(persona) {

                return persona.job === "Director";

            }
        );


    // REPARTO

    const reparto =
        pelicula.credits.cast
            .slice(0, 8)
            .map(
                function(actor) {

                    return actor.name;

                }
            )
            .join(", ");


    // TRAILER

    const video =
        pelicula.videos.results.find(
            function(video) {

                return (
                    video.type === "Trailer" &&
                    video.site === "YouTube"
                );

            }
        );


    // HTML

    detalle.innerHTML = `

        <div class="detalle-poster">

            <img
                src="${poster}"
                alt="${pelicula.title}"
            >

        </div>


        <div class="detalle-contenido">

            <span>
                VANTA-CINEMA
            </span>


            <h1>
                ${pelicula.title}
            </h1>


            <div class="datos-pelicula">

                <p>
                    📅 Estreno:
                    ${pelicula.release_date || "No disponible"}
                </p>

                <p>
                    ⏱ Duración:
                    ${pelicula.runtime || 0}
                    minutos
                </p>

                <p>
                    ⭐ Valoración:
                    ${pelicula.vote_average.toFixed(1)}
                </p>

            </div>


            <div>

                <h2>
                    Géneros
                </h2>

                <p>
                    ${
                        pelicula.genres
                            .map(
                                function(genero) {
                                    return genero.name;
                                }
                            )
                            .join(", ")
                    }
                </p>

            </div>


            <div>

                <h2>
                    Sinopsis
                </h2>

                <p>
                    ${
                        pelicula.overview ||
                        "No hay sinopsis disponible."
                    }
                </p>

            </div>


            <div>

                <h2>
                    Director
                </h2>

                <p>
                    ${
                        director
                            ? director.name
                            : "No disponible"
                    }
                </p>

            </div>


            <div>

                <h2>
                    Reparto
                </h2>

                <p>
                    ${
                        reparto ||
                        "No disponible"
                    }
                </p>

            </div>


            <div class="acciones-detalle">

                ${
                    video
                    ?
                    `
                    <button
                        id="btnTrailer"
                        type="button"
                    >
                        ▶ Ver trailer
                    </button>
                    `
                    :
                    ""
                }


                <button
                    id="btnFunciones"
                    type="button"
                >
                    Ver funciones
                </button>

            </div>

        </div>

    `;


    // ========================================
    // BOTÓN TRAILER
    // ========================================

    const btnTrailer =
        document.getElementById(
            "btnTrailer"
        );


    if (btnTrailer && video) {

        btnTrailer.addEventListener(
            "click",
            function() {

                trailer.innerHTML = `

                    <h2>
                        Trailer
                    </h2>

                    <iframe

                        src="https://www.youtube.com/embed/${video.key}"

                        title="Trailer de ${pelicula.title}"

                        allowfullscreen>

                    </iframe>

                `;


                trailer.scrollIntoView({
                    behavior: "smooth"
                });

            }
        );

    }


    // ========================================
    // BOTÓN FUNCIONES
    // ========================================

    const btnFunciones =
        document.getElementById(
            "btnFunciones"
        );


    btnFunciones.addEventListener(
        "click",
        function() {

            window.location.href =
                `funciones.html?movieId=${pelicula.id}`;

        }
    );

}


// ========================================
// INICIAR
// ========================================

cargarDetalle();