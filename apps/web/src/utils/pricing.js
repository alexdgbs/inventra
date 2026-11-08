import { USD_MXN_RATE } from "../config/pricing";

// Formato único de precios en toda la web: MXN tal cual, USD con la tasa
// configurable de config/pricing.js (ver README: la conversión es estimada).
export function formatPrice(price, currency) {
  const sourcePrice = Number(price);
  const value = currency === "USD" ? sourcePrice / USD_MXN_RATE : sourcePrice;
  // En MXN se ven los centavos solo cuando el precio los tiene.
  const hasCents = Math.round(value * 100) % 100 !== 0;
  const digits = currency === "USD" || hasCents ? 2 : 0;
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", { style: "currency", currency, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}
