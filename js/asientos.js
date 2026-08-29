document.addEventListener('DOMContentLoaded', () => {
    const parametrosURL = new URLSearchParams(window.location.search);

    const funcionGuardada = leerAlmacenamientoJSON(
        'vanta_funcion_seleccionada',
        {}
    );

    const movieId =
        parametrosURL.get('id') ||
        funcionGuardada.movieId;

    const functionId =
        parametrosURL.get('functionId') ||
        funcionGuardada.functionId;

    const fecha =
        parametrosURL.get('fecha') ||
        funcionGuardada.fecha ||
        funcionGuardada.date ||
        'Hoy';

    const horario =
        parametrosURL.get('horario') ||
        funcionGuardada.horario ||
        funcionGuardada.time ||
        '19:00';

    const formato =
        parametrosURL.get('formato') ||
        funcionGuardada.formato ||
        funcionGuardada.format ||
        '2D';

    const precioUnitario = parseInt(
        parametrosURL.get('precio') ||
        funcionGuardada.precioUnitario ||
        funcionGuardada.price ||
        14000,
        10
    );

    const peliculaTitulo =
        funcionGuardada.peliculaTitulo ||
        'Película seleccionada';

    const roomId =
        funcionGuardada.roomId ||
        parametrosURL.get('roomId') ||
        1;


    // ==============================
    // 2. REFERENCIAS DEL HTML
    // ==============================

    const peliculaTituloEl =
        document.getElementById('peliculaTitulo');

    const funcionDetalleEl =
        document.getElementById('funcionDetalle');

    const precioUnitarioTextoEl =
        document.getElementById('precioUnitarioTexto');

    const gridAsientosEl =
        document.getElementById('gridAsientos');

    const asientosSeleccionadosTextoEl =
        document.getElementById('asientosSeleccionadosTexto');

    const totalPagarTextoEl =
        document.getElementById('totalPagarTexto');

    const btnContinuarPago =
        document.getElementById('btnContinuarPago');

    const btnVolverFunciones =
        document.getElementById('btnVolverFunciones');


    // ==============================
    // 3. ASIENTOS SELECCIONADOS
    // ==============================

    let asientosSeleccionados = [];


    // ==============================
    // 4. CONFIGURAR BOTÓN VOLVER
    // ==============================

    if (btnVolverFunciones && movieId) {
        btnVolverFunciones.href =
            `funciones.html?id=${movieId}`;
    }


    // ==============================
    // 5. MOSTRAR INFORMACIÓN
    // ==============================

    if (peliculaTituloEl) {
        peliculaTituloEl.textContent =
            peliculaTitulo;
    }

    if (funcionDetalleEl) {
        funcionDetalleEl.textContent =
            `${fecha} | ${horario} | ${formato} | Sala ${roomId}`;
    }

    if (precioUnitarioTextoEl) {
        precioUnitarioTextoEl.textContent =
            `$${precioUnitario.toLocaleString('es-CO')} COP`;
    }


    // ==============================
    // 6. CARGAR ASIENTOS
    // ==============================

    cargarAsientos();


    async function cargarAsientos() {

        try {

            const respuesta = await fetch(
                `${JSON_SERVER_URL}/seats?roomId=${encodeURIComponent(roomId)}`
            );

            if (!respuesta.ok) {
                throw new Error('No se pudieron cargar los asientos');
            }

            const asientosSala = await respuesta.json();

            // Las compras confirmadas se guardan en el servidor. Consultarlas
            // aquí evita que una silla ya vendida vuelva a mostrarse disponible.
            const comprasConfirmadas = await cargarComprasConfirmadas();


            // El historial de compras es la fuente única del estado. Así se
            // evita depender de functionSeats vacíos o desactualizados.
            const asientosOcupados = new Set(
                comprasConfirmadas.flatMap(compra => compra.asientos || [])
            );
            const estadosFuncion = asientosSala.map(asiento => ({
                functionId,
                seatId: asiento.id,
                status: asientosOcupados.has(`${asiento.row}${asiento.number}`)
                    ? 'occupied'
                    : 'available'
            }));


            // Mostrar los asientos

            renderizarSala(
                asientosSala,
                estadosFuncion
            );

        } catch (error) {

            console.error(
                'Error cargando los asientos:',
                error
            );

            if (gridAsientosEl) {

                gridAsientosEl.innerHTML = `
                    <p class="error">
                        No se pudieron cargar los asientos.
                    </p>
                `;

            }

        }

    }

    async function cargarComprasConfirmadas() {

        const comprasLocales = leerAlmacenamientoJSON(
            'vanta_compras_confirmadas',
            []
        ).filter(compra => String(compra.functionId) === String(functionId));

        try {
            const respuesta = await fetch(
                `${JSON_SERVER_URL}/purchases?functionId=${encodeURIComponent(functionId)}`
            );

            if (!respuesta.ok) {
                throw new Error('No se pudieron cargar las compras');
            }

            const comprasServidor = await respuesta.json();
            const comprasUnicas = new Map();

            [...comprasServidor, ...comprasLocales].forEach(compra => {
                const clave = compra.id || compra.idReserva || JSON.stringify(compra);
                comprasUnicas.set(clave, compra);
            });

            return [...comprasUnicas.values()];

        } catch (error) {
            console.warn('Usando el historial local de asientos vendidos.', error);

            return comprasLocales;
        }
    }


    // ==============================
    // 7. CREAR LA SALA
    // ==============================

    function renderizarSala(
        asientosSala,
        estadosFuncion
    ) {

        if (!gridAsientosEl) {
            return;
        }

        gridAsientosEl.innerHTML = '';


        // Agrupar los asientos por fila

        const filas = {};


        asientosSala.forEach(asiento => {

            if (!filas[asiento.row]) {
                filas[asiento.row] = [];
            }

            filas[asiento.row].push(asiento);

        });


        // Crear cada fila

        Object.keys(filas).forEach(letraFila => {

            const filaDiv =
                document.createElement('div');

            filaDiv.classList.add(
                'fila-asientos'
            );


            // Letra de la fila izquierda

            const etiquetaIzq =
                document.createElement('span');

            etiquetaIzq.classList.add(
                'letra-fila'
            );

            etiquetaIzq.textContent =
                letraFila;

            filaDiv.appendChild(
                etiquetaIzq
            );


            // Grupo izquierdo de asientos

            const grupoIzq =
                document.createElement('div');

            grupoIzq.classList.add(
                'sillas-grupo'
            );


            filas[letraFila]
                .filter(asiento => asiento.number <= 5)
                .forEach(asiento => {

                    grupoIzq.appendChild(
                        crearSilla(
                            asiento,
                            estadosFuncion
                        )
                    );

                });


            filaDiv.appendChild(
                grupoIzq
            );


            // Grupo derecho de asientos

            const grupoDer =
                document.createElement('div');

            grupoDer.classList.add(
                'sillas-grupo',
                'pasillo'
            );


            filas[letraFila]
                .filter(asiento => asiento.number > 5)
                .forEach(asiento => {

                    grupoDer.appendChild(
                        crearSilla(
                            asiento,
                            estadosFuncion
                        )
                    );

                });


            filaDiv.appendChild(
                grupoDer
            );


            // Letra de la fila derecha

            const etiquetaDer =
                document.createElement('span');

            etiquetaDer.classList.add(
                'letra-fila'
            );

            etiquetaDer.textContent =
                letraFila;

            filaDiv.appendChild(
                etiquetaDer
            );


            // Agregar la fila completa

            gridAsientosEl.appendChild(
                filaDiv
            );

        });

    }


    // ==============================
    // 8. CREAR CADA ASIENTO
    // ==============================

    function crearSilla(
        asiento,
        estadosFuncion
    ) {

        const codigoAsiento =
            `${asiento.row}${asiento.number}`;


        const btnSilla =
            document.createElement('button');

        btnSilla.classList.add(
            'asiento'
        );

        btnSilla.textContent =
            asiento.number;

        btnSilla.setAttribute(
            'data-codigo',
            codigoAsiento
        );


        // Buscar el estado del asiento

        const estado =
            estadosFuncion.find(
                functionSeat =>
                    String(functionSeat.seatId) ===
                    String(asiento.id)
            );


        // Si el asiento está ocupado

        if (
            estado &&
            estado.status === 'occupied'
        ) {

            btnSilla.classList.add(
                'ocupado'
            );

            btnSilla.disabled = true;

        } else {

            // Si está disponible,
            // permitir que el usuario lo seleccione

            btnSilla.addEventListener(
                'click',
                () => {

                    toggleSeleccionAsiento(
                        codigoAsiento,
                        btnSilla
                    );

                }
            );

        }


        return btnSilla;

    }


    // ==============================
    // 9. SELECCIONAR / DESELECCIONAR
    // ==============================

    function toggleSeleccionAsiento(
        codigo,
        elemento
    ) {

        // Comprobar si ya está seleccionado

        if (
            asientosSeleccionados.includes(codigo)
        ) {

            // Quitar el asiento

            asientosSeleccionados =
                asientosSeleccionados.filter(
                    asiento =>
                        asiento !== codigo
                );

            elemento.classList.remove(
                'seleccionado'
            );

        } else {

            // Agregar el asiento

            asientosSeleccionados.push(
                codigo
            );

            elemento.classList.add(
                'seleccionado'
            );

        }


        // Actualizar el resumen

        actualizarResumenPago();

    }


    // ==============================
    // 10. ACTUALIZAR RESUMEN Y TOTAL
    // ==============================

    function actualizarResumenPago() {

        const cantidad =
            asientosSeleccionados.length;

        const total =
            cantidad * precioUnitario;


        if (cantidad > 0) {

            asientosSeleccionadosTextoEl.textContent =
                [...asientosSeleccionados]
                    .sort()
                    .join(', ');

            totalPagarTextoEl.textContent =
                `$${total.toLocaleString('es-CO')} COP`;

            btnContinuarPago.disabled =
                false;

        } else {

            asientosSeleccionadosTextoEl.textContent =
                'Ninguno';

            totalPagarTextoEl.textContent =
                '$0 COP';

            btnContinuarPago.disabled =
                true;

        }

    }


    // ==============================
    // 11. CONTINUAR A CONFIRMACIÓN
    // ==============================

    if (btnContinuarPago) {

        btnContinuarPago.addEventListener(
            'click',
            () => {

                // Comprobar que haya al menos
                // un asiento seleccionado

                if (
                    asientosSeleccionados.length === 0
                ) {

                    alert(
                        'Selecciona al menos un asiento.'
                    );

                    return;

                }


                // Crear la reserva

                const reservaActual = {

                    movieId: movieId,

                    functionId: functionId,

                    peliculaTitulo:
                        peliculaTitulo,

                    roomId: roomId,

                    fecha: fecha,

                    horario: horario,

                    formato: formato,

                    precioUnitario:
                        precioUnitario,

                    asientos:
                        [...asientosSeleccionados]
                            .sort(),

                    totalPagar:
                        asientosSeleccionados.length *
                        precioUnitario

                };


                // Guardar la reserva temporalmente

                localStorage.setItem(
                    'vanta_reserva_temp',
                    JSON.stringify(
                        reservaActual
                    )
                );


                // Ir a la página de confirmación

                window.location.href =
                    'confirmacion.html';

            }
        );

    }


    // ==============================
    // 12. ESTADO INICIAL
    // ==============================

    actualizarResumenPago();

});
