// Mensaje de error único para las peticiones a la API: si el servidor
// devolvió un mensaje, se muestra ese; si no, el mensaje genérico que
// recibe cada llamada.
export function getApiErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}
