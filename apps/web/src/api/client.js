import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "") || "";
const baseURL = import.meta.env.PROD ? "" : configuredApiUrl;

// La API vive en Render (plan gratuito) y tarda en despertar: las lecturas
// y el envío de solicitudes necesitan más margen que el resto.
const SLOW_TIMEOUT = 60000;

const api = axios.create({ baseURL, timeout: 15000, withCredentials: true });

api.interceptors.request.use(config => {
  const slow = config.method === "get" || (config.method === "post" && config.url === "/api/inquiries");
  if (slow) config.timeout = SLOW_TIMEOUT;
  return config;
});

api.interceptors.response.use(response => response, async error => {
  const config = error.config;
  // Solo se reintentan lecturas: reintentar un POST podría duplicar datos.
  const isRetryableGet = config && config.method === "get" && (!error.response || [502, 503, 504].includes(error.response.status));
  if (isRetryableGet && !config._retried) {
    config._retried = true;
    return api.request(config);
  }
  return Promise.reject(error);
});

// Un toque ligero al arrancar para que la API empiece a despertar mientras
// se lee la página; no bloquea nada y los fallos se ignoran.
let warmedUp = false;
export function warmupApi() {
  if (warmedUp) return;
  warmedUp = true;
  api.get("/api/health").catch(() => {});
}

export default api;
