import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "") || "";
const baseURL = import.meta.env.PROD ? "" : configuredApiUrl;

const api = axios.create({ baseURL, timeout: 15000, withCredentials: true });

export default api;
