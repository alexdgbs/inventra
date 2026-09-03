import { getCategoryName } from "./categories";

export function normalizeSearch(value) {
  return String(value ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function matchesService(item, query) {
  const text = normalizeSearch(`${item.name ?? ""} ${item.description ?? ""} ${getCategoryName(item.category)}`);
  return normalizeSearch(query).split(/\s+/).every(term => text.includes(term));
}
