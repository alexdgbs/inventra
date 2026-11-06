import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "") || "";
const baseURL = import.meta.env.PROD ? "" : configuredApiUrl;

// La API vive en Render (plan gratuito) y tarda en despertar: la lista de
// servicios necesita más margen que el resto de las peticiones.
const ITEMS_TIMEOUT = 60000;

const api = axios.create({ baseURL, timeout: 15000, withCredentials: true });

api.interceptors.request.use(config => {
  if (config.method === "get" && config.url === "/api/items") config.timeout = ITEMS_TIMEOUT;
  return config;
});

api.interceptors.response.use(response => response, async error => {
  const config = error.config;
  const isItemsRequest = config && config.method === "get" && config.url === "/api/items";
  const isRetryable = !error.response || [502, 503, 504].includes(error.response.status);
  if (isItemsRequest && isRetryable && !config._itemsRetried) {
    config._itemsRetried = true;
    return api.request(config);
  }
  return Promise.reject(error);
});

export default api;
