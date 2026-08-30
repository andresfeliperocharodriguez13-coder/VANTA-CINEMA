# VANTA Cinema

## Inicio local

1. Crea un archivo `.env` a partir de `.env.example`.
2. Agrega una clave de TMDB nueva en `TMDB_API_KEY`. La clave anterior debe regenerarse porque estuvo expuesta en el cliente.
3. Ejecuta `npm run server`.
4. Abre `http://localhost:3000`.

El servidor local conserva las compras en `db.json` y evita vender un mismo asiento dos veces para la misma función.

# 🎬 VANTA CINEMA

Sistema web para la gestión y consulta de una cartelera de cine desarrollado con **HTML5, CSS3, JavaScript y Node.js**, utilizando la **API de TMDB** para obtener información de películas.

## 📌 Descripción

VANTA CINEMA permite consultar películas, visualizar funciones, seleccionar asientos y realizar compras de entradas.

La aplicación utiliza un servidor local con **Node.js**, encargado de conectar el proyecto con la API de TMDB y gestionar las funciones, asientos y compras.

---

## 🚀 Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/andresfeliperocharodriguez13-coder/VANTA-CINEMA.git
```

Entrar a la carpeta:

```bash
cd VANTA-CINEMA
```

### 2. Ejecutar el servidor

No es necesario abrir `index.html` directamente.

Desde la carpeta del proyecto ejecuta:

```bash
node server.js
```

También puedes utilizar:

```bash
npm run server
```

### 3. Abrir la página

Después de ejecutar el servidor, aparecerá en la terminal:

```text
VANTA Cinema disponible en http://localhost:3000
```

Copia el enlace y ábrelo en el navegador:

```text
http://localhost:3000
```

🎬 **¡Listo! VANTA CINEMA estará funcionando.**

---

## ⚠️ Importante

La página debe ejecutarse mediante **Node.js**.

### ❌ No abrir directamente

```text
file:///C:/.../VANTA-CINEMA/index.html
```

### ✅ Ejecutar correctamente

```text
node server.js
```

Y después acceder a:

```text
http://localhost:3000
```

Esto es necesario para que la aplicación pueda utilizar correctamente la conexión con TMDB y las funciones del sistema.

---

## 🎟️ Funcionalidades

* 🎬 Visualización de películas mediante TMDB.
* 🔎 Búsqueda de películas.
* 📅 Consulta de funciones.
* 💺 Selección de asientos.
* 🛒 Compra y reserva de entradas.
* 🚫 Control de asientos ocupados.
* 💾 Registro de compras.
* 🖥️ Servidor local con Node.js.
* 📱 Diseño adaptable.

---

## 🛠️ Tecnologías

* **HTML5**
* **CSS3**
* **JavaScript**
* **Node.js**
* **TMDB API**
* **JSON**
* **Git**
* **GitHub**

---

## 📂 Estructura

```text
VANTA-CINEMA/
│
├── .env
├── .env.example
├── .gitignore
├── index.html
├── server.js
├── db.json
├── package.json
│
├── css/
│   └── ...
│
├── js/
│   └── ...
│
├── pages/
│   ├── funciones.html
│   ├── reserva.html
│   ├── compra.html
│   └── perfil.html
│
└── ...
```

---

## 👨‍💻 Autor

**Andrés Felipe Rocha Rodríguez**

🎬 **VANTA CINEMA**

Proyecto académico para la gestión y consulta de una cartelera de cine mediante la API de TMDB.

