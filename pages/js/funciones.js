document.addEventListener('DOMContentLoaded', async () => {

    const parametrosURL = new URLSearchParams(window.location.search);
    const movieId = parametrosURL.get('id');

    const loading = document.getElementById('loading');
    const contenidoFunciones = document.getElementById('contenidoFunciones');
    const btnVolverDetalle = document.getElementById('btnVolverDetalle');
    const btnContinuarAsientos = document.getElementById('btnContinuarAsientos');
    const resumenSeleccion = document.getElementById('resumenSeleccion');

    const baseUrlReal =
        typeof BASE_URL !== 'undefined'
            ? BASE_URL
            : 'https://api.themoviedb.org/3';

    const imgBaseReal =
        typeof IMAGE_BASE_URL !== 'undefined'
            ? IMAGE_BASE_URL
            : 'https://image.tmdb.org/t/p/w500';

    let funcionSeleccionada = {
        movieId: movieId,
        peliculaTitulo: '',
        functionId: null,
        fecha: null,
        formato: null,
        horario: null,
        precioUnitario: 0,
        roomId: null
    };

    // Verificar que exista el ID de la película
    if (!movieId) {
        if (loading) {
            loading.textContent =
                '⚠️ No se especificó ninguna película.';
        }
        return;
    }

    // Botón volver
    if (btnVolverDetalle) {
        btnVolverDetalle.href = `detalle.html?id=${movieId}`;
    }

    try {

        // ==========================================
        // 1. OBTENER PELÍCULA DESDE TMDB
        // ==========================================

        const resPeli = await fetch(
            `${baseUrlReal}/movie/${encodeURIComponent(movieId)}?language=es-ES`
        );

        if (!resPeli.ok) {
            throw new Error(
                'No se pudo cargar la información de la película.'
            );
        }

        const pelicula = await resPeli.json();

        funcionSeleccionada.peliculaTitulo = pelicula.title;

        // Mostrar información
        const tituloPeli = document.getElementById('tituloPeli');
        const duracionPeli = document.getElementById('duracionPeli');
        const promedioPeli = document.getElementById('promedioPeli');
        const generosPeli = document.getElementById('generosPeli');
        const posterPeli = document.getElementById('posterPeli');

        if (tituloPeli) {
            tituloPeli.textContent = pelicula.title;
        }

        if (duracionPeli) {
            duracionPeli.textContent =
                pelicula.runtime
                    ? `${pelicula.runtime} min`
                    : 'N/A';
        }

        if (promedioPeli) {
            promedioPeli.textContent =
                pelicula.vote_average
                    ? pelicula.vote_average.toFixed(1)
                    : 'N/A';
        }

        if (generosPeli && pelicula.genres) {
            generosPeli.textContent =
                pelicula.genres.map(g => g.name).join(' • ');
        }

        if (posterPeli && pelicula.poster_path) {
            posterPeli.src =
                `${imgBaseReal}${pelicula.poster_path}`;
        }

        // ==========================================
        // 2. GENERAR LOS 5 DÍAS
        // ==========================================

        generarFechas();

        // ==========================================
        // 3. GENERAR FUNCIONES PARA ESTA PELÍCULA
        // ==========================================

        await generarFunciones();

        // Mostrar contenido
        if (loading) {
            loading.classList.add('hidden');
        }

        if (contenidoFunciones) {
            contenidoFunciones.classList.remove('hidden');
        }

    } catch (error) {

        console.error('Error:', error);

        if (loading) {
            loading.textContent =
                `⚠️ ${error.message}`;
        }
    }


    // ==========================================
    // GENERAR LOS 5 DÍAS
    // ==========================================

    function generarFechas() {

        const contenedorFechas =
            document.getElementById('contenedorFechas');

        if (!contenedorFechas) return;

        const diasSemana = [
            'DOM',
            'LUN',
            'MAR',
            'MIÉ',
            'JUE',
            'VIE',
            'SÁB'
        ];

        const meses = [
            'ENE',
            'FEB',
            'MAR',
            'ABR',
            'MAY',
            'JUN',
            'JUL',
            'AGO',
            'SEP',
            'OCT',
            'NOV',
            'DIC'
        ];

        const hoy = new Date();

        let HTMLFechas = '';

        for (let i = 0; i < 5; i++) {

            const fechaObj = new Date();

            fechaObj.setDate(
                hoy.getDate() + i
            );

            const diaSem =
                diasSemana[fechaObj.getDay()];

            const numDia =
                fechaObj.getDate();

            const mesNom =
                meses[fechaObj.getMonth()];

            // Fecha real para trabajar
            const fechaReal =
                fechaObj.toISOString().split('T')[0];

            const fechaTexto =
                `${diaSem} ${numDia} ${mesNom}`;

            const esActivo =
                i === 0 ? 'active' : '';

            if (i === 0) {
                funcionSeleccionada.fecha =
                    fechaReal;
            }

            HTMLFechas += `
                <div
                    class="card-fecha ${esActivo}"
                    data-fecha="${fechaReal}"
                >
                    <span class="dia-semana">
                        ${i === 0 ? 'HOY' : diaSem}
                    </span>

                    <span class="num-dia">
                        ${numDia}
                    </span>

                    <span class="mes">
                        ${mesNom}
                    </span>
                </div>
            `;
        }

        contenedorFechas.innerHTML =
            HTMLFechas;

        const tarjetas =
            contenedorFechas.querySelectorAll(
                '.card-fecha'
            );

        tarjetas.forEach(card => {

            card.addEventListener('click', async () => {

                tarjetas.forEach(c =>
                    c.classList.remove('active')
                );

                card.classList.add('active');

                funcionSeleccionada.fecha =
                    card.getAttribute('data-fecha');

                funcionSeleccionada.functionId =
                    null;

                funcionSeleccionada.horario =
                    null;

                funcionSeleccionada.formato =
                    null;

                funcionSeleccionada.precioUnitario =
                    0;

                funcionSeleccionada.roomId =
                    null;

                await generarFunciones();

                actualizarEstadoBoton();
            });
        });
    }


    // ==========================================
    // GENERAR FUNCIONES AUTOMÁTICAMENTE
    // ==========================================

    async function generarFunciones() {

        const contenedorHorarios =
            document.getElementById(
                'contenedorHorarios'
            );

        if (!contenedorHorarios) return;

        contenedorHorarios.innerHTML = `
            <p class="mensaje-funciones">
                Cargando funciones...
            </p>
        `;

        // ==========================================
        // CONFIGURACIÓN DE LAS SALAS
        // ==========================================

        const ofertas = [

            {
                roomId: 1,
                nombre: 'SALA TRADICIONAL 2D',
                formato: '2D',
                precio: 15000,
                horarios: [
                    '14:00',
                    '16:30',
                    '18:00',
                    '20:30'
                ]
            },

            {
                roomId: 2,
                nombre: 'SALA TRADICIONAL 2D',
                formato: '2D',
                precio: 18000,
                horarios: [
                    '15:00',
                    '17:30',
                    '20:00',
                    '22:00'
                ]
            },

            {
                roomId: 3,
                nombre: 'SALA 3D',
                formato: '3D',
                precio: 22000,
                horarios: [
                    '16:00',
                    '19:00',
                    '21:30'
                ]
            }
        ];


        // ==========================================
        // BUSCAR FUNCIONES EXISTENTES EN JSON-SERVER
        // ==========================================

        let funcionesDB = [];

        try {

            const respuesta =
                await fetch(
                    `${JSON_SERVER_URL}/functions`
                );

            if (respuesta.ok) {
                funcionesDB =
                    await respuesta.json();
            }

        } catch (error) {

            console.warn(
                'No se pudieron cargar las funciones del servidor.'
            );
        }


        // ==========================================
        // CREAR FUNCIONES PARA LA PELÍCULA
        // ==========================================

        const funcionesGeneradas = [];

        ofertas.forEach(oferta => {

            oferta.horarios.forEach(horario => {

                const funcionExistente =
                    funcionesDB.find(funcion =>
                        String(funcion.movieId) === String(movieId) &&
                        funcion.date === funcionSeleccionada.fecha &&
                        funcion.time === horario &&
                        String(funcion.roomId) === String(oferta.roomId)
                    );

                if (funcionExistente) {

                    funcionesGeneradas.push({
                        ...funcionExistente,
                        nombreSala: oferta.nombre,
                        formato: oferta.formato,
                        precio: funcionExistente.price
                    });

                } else {

                    // ID temporal único
                    const idTemporal =
                        `${movieId}-${funcionSeleccionada.fecha}-${oferta.roomId}-${horario}`;

                    funcionesGeneradas.push({

                        id: idTemporal,

                        movieId: Number(movieId),

                        roomId: oferta.roomId,

                        date: funcionSeleccionada.fecha,

                        time: horario,

                        format: oferta.formato,

                        price: oferta.precio,

                        nombreSala: oferta.nombre

                    });
                }
            });
        });


        // ==========================================
        // MOSTRAR FUNCIONES
        // ==========================================

        contenedorHorarios.innerHTML = '';

        const funcionesPorSala = {};

        funcionesGeneradas.forEach(funcion => {

            if (!funcionesPorSala[funcion.roomId]) {
                funcionesPorSala[funcion.roomId] = [];
            }

            funcionesPorSala[funcion.roomId].push(
                funcion
            );
        });


        Object.values(funcionesPorSala).forEach(
            funciones => {

                if (funciones.length === 0) return;

                const primera =
                    funciones[0];

                const bloque =
                    document.createElement('div');

                bloque.className =
                    'formato-block';

                bloque.innerHTML = `

                    <div class="formato-header">

                        <span class="formato-nombre">
                            ${primera.nombreSala}
                        </span>

                        <span class="formato-precio">
                            ${primera.format}
                            ·
                            $${primera.price.toLocaleString('es-CO')}
                        </span>

                    </div>

                    <div class="horarios-grid">

                        ${funciones.map(funcion => `

                            <button
                                class="btn-horario"

                                data-function-id="${funcion.id}"

                                data-room-id="${funcion.roomId}"

                                data-formato="${funcion.format}"

                                data-precio="${funcion.price}"

                                data-horario="${funcion.time}"
                            >

                                ${funcion.time}

                            </button>

                        `).join('')}

                    </div>
                `;

                contenedorHorarios.appendChild(
                    bloque
                );
            }
        );


        // ==========================================
        // EVENTOS DE LOS HORARIOS
        // ==========================================

        const botonesHorario =
            contenedorHorarios.querySelectorAll(
                '.btn-horario'
            );

        botonesHorario.forEach(btn => {

            btn.addEventListener('click', () => {

                botonesHorario.forEach(b =>
                    b.classList.remove('active')
                );

                btn.classList.add('active');

                funcionSeleccionada.functionId =
                    btn.getAttribute(
                        'data-function-id'
                    );

                funcionSeleccionada.roomId =
                    Number(
                        btn.getAttribute(
                            'data-room-id'
                        )
                    );

                funcionSeleccionada.formato =
                    btn.getAttribute(
                        'data-formato'
                    );

                funcionSeleccionada.horario =
                    btn.getAttribute(
                        'data-horario'
                    );

                funcionSeleccionada.precioUnitario =
                    Number(
                        btn.getAttribute(
                            'data-precio'
                        )
                    );

                actualizarEstadoBoton();
            });
        });
    }


    // ==========================================
    // ACTUALIZAR RESUMEN
    // ==========================================

    function actualizarEstadoBoton() {

        if (
            funcionSeleccionada.fecha &&
            funcionSeleccionada.horario
        ) {

            resumenSeleccion.textContent =
                `${funcionSeleccionada.fecha} — ` +
                `${funcionSeleccionada.horario} ` +
                `(${funcionSeleccionada.formato})`;

            btnContinuarAsientos.disabled =
                false;

        } else {

            resumenSeleccion.textContent =
                'Ningún horario seleccionado';

            btnContinuarAsientos.disabled =
                true;
        }
    }


    // ==========================================
    // IR A ASIENTOS
    // ==========================================

    if (btnContinuarAsientos) {

        btnContinuarAsientos.addEventListener(
            'click',
            () => {

                if (
                    !funcionSeleccionada.horario
                ) {
                    return;
                }

                // Guardar información
                localStorage.setItem(
                    'vanta_funcion_seleccionada',
                    JSON.stringify(
                        funcionSeleccionada
                    )
                );


                // Enviar información a asientos
                const params =
                    new URLSearchParams({

                        id:
                            funcionSeleccionada.movieId,

                        functionId:
                            funcionSeleccionada.functionId,

                        fecha:
                            funcionSeleccionada.fecha,

                        horario:
                            funcionSeleccionada.horario,

                        formato:
                            funcionSeleccionada.formato,

                        precio:
                            funcionSeleccionada.precioUnitario,

                        roomId:
                            funcionSeleccionada.roomId
                    });


                window.location.href =
                    `asientos.html?${params.toString()}`;
            }
        );
    }

});
