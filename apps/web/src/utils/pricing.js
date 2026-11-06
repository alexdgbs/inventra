import { USD_MXN_RATE } from "../config/pricing";

// Formato único de precios en toda la web: MXN tal cual, USD con la tasa
// configurable de config/pricing.js (ver README: la conversión es estimada).
export function formatPrice(price, currency) {
  const sourcePrice = Number(price);
  const value = currency === "USD" ? sourcePrice / USD_MXN_RATE : sourcePrice;
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", { style: "currency", currency, maximumFractionDigits: currency === "USD" ? 2 : 0 }).format(value);
}
