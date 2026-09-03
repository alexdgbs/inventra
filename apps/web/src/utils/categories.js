export function getCategoryName(value) {
  return typeof value === "object" ? value?.name || "" : value || "";
}
