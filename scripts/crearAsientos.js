const fs = require("fs");

const filasSala1 = ["A", "B", "C", "D", "E"];
const filasSala2 = ["A", "B", "C", "D"];
const filasSala3 = ["A", "B", "C", "D", "E", "F"];

let seats = [];
let id = 1;

// Sala 1 - 50 asientos
for (let fila of filasSala1) {
    for (let numero = 1; numero <= 10; numero++) {
        seats.push({
            id: id,
            roomId: 1,
            row: fila,
            number: numero
        });

        id++;
    }
}

// Sala 2 - 40 asientos
for (let fila of filasSala2) {
    for (let numero = 1; numero <= 10; numero++) {
        seats.push({
            id: id,
            roomId: 2,
            row: fila,
            number: numero
        });

        id++;
    }
}

// Sala 3 - 60 asientos
for (let fila of filasSala3) {
    for (let numero = 1; numero <= 10; numero++) {
        seats.push({
            id: id,
            roomId: 3,
            row: fila,
            number: numero
        });

        id++;
    }
}

// Leer db.json
const db = JSON.parse(fs.readFileSync("db.json", "utf8"));

// Reemplazar los asientos
db.seats = seats;

// Guardar db.json
fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

console.log("Asientos guardados:", seats.length);
let functionSeats = [];

for (let funcion of db.functions) {

    for (let asiento of seats) {

        if (asiento.roomId === funcion.roomId) {

            functionSeats.push({
                id: functionSeats.length + 1,
                functionId: funcion.id,
                seatId: asiento.id,
                status: "available"
            });

        }
    }
}

db.functionSeats = functionSeats;

fs.writeFileSync("db.json", JSON.stringify(db, null, 2));

console.log("FunctionSeats creados:", functionSeats.length);