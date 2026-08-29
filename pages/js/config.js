const API_BASE_URL = '/api';
const URL_TMDB = `${API_BASE_URL}/tmdb`;
const BASE_URL = URL_TMDB;
const URL_IMAGEN = "https://image.tmdb.org/t/p/w500";
const URL_BACKDROP = "https://image.tmdb.org/t/p/original";
const IMAGE_BASE_URL = URL_IMAGEN;
const JSON_SERVER_URL = API_BASE_URL;

function leerAlmacenamientoJSON(clave, valorPredeterminado) {
  try {
    const valor = localStorage.getItem(clave);
    return valor ? JSON.parse(valor) : valorPredeterminado;
  } catch (error) {
    console.warn(`No se pudo leer ${clave} desde el almacenamiento local.`, error);
    return valorPredeterminado;
  }
}
