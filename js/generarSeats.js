const API_URL = "http://localhost:3000";

async function generarDatosSeats() {
    try {
        const respuesta = await fetch(`${API_URL}/seats`);
        const seats = await respuesta.json();

        for (const seat of seats) {

            const seatCode = `${seat.row}${seat.number}`;

            let location;

            if (seat.row === "A" || seat.row === "B") {
                location = "Frontal";
            } else if (seat.row === "C" || seat.row === "D") {
                location = "Centro";
            } else {
                location = "Posterior";
            }

            const datosActualizados = {
                ...seat,
                roomId: String(seat.roomId),
                seatCode: seatCode,
                location: location,
                type: "standard"
            };

            await fetch(`${API_URL}/seats/${seat.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosActualizados)
            });

            console.log(`Asiento ${seatCode} actualizado`);
        }

        console.log("✅ Todos los asientos fueron actualizados.");

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

generarDatosSeats();