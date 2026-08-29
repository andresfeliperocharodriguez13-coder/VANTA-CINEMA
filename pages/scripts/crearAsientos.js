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

// La disponibilidad se calcula exclusivamente desde las compras confirmadas.
// functionSeats se elimina para evitar dos fuentes de verdad incompatibles.
delete db.functionSeats;

fs.writeFileSync("db.json", JSON.stringify(db, null, 2));
console.log("Asientos guardados:", seats.length);
