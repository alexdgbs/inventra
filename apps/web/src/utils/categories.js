export function getCategoryName(value) {
  return typeof value === "object" ? value?.name || "" : value || "";
}

export const FALLBACK_CATEGORY_LABEL = "Servicio profesional";

export function categoryLabel(value) {
  return getCategoryName(value) || FALLBACK_CATEGORY_LABEL;
}
