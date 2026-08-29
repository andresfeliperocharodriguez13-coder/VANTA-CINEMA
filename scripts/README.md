# VANTA Cinema

## Inicio local

1. Crea un archivo `.env` a partir de `.env.example`.
2. Agrega una clave de TMDB nueva en `TMDB_API_KEY`. La clave anterior debe regenerarse porque estuvo expuesta en el cliente.
3. Ejecuta `npm run server`.
4. Abre `http://localhost:3000`.

El servidor local conserva las compras en `db.json` y evita vender un mismo asiento dos veces para la misma función.
