import { getCategoryName } from "./categories";

export function normalizeSearch(value) {
  return String(value ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

export function matchesText(text, query) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeSearch(text);
  return terms.every(term => haystack.includes(term));
}

export function matchesService(item, query) {
  return matchesText(`${item.name ?? ""} ${item.description ?? ""} ${getCategoryName(item.category)}`, query);
}
