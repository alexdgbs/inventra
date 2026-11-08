import { z } from "zod";

// Paginación de las listas públicas: por defecto 50 por página, como mucho 100.
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export function parsePagination(query) {
  return paginationSchema.parse(query);
}

export function pageOf(key, list, total, { page, limit }) {
  return { [key]: list, page, limit, total, totalPages: Math.ceil(total / limit) };
}
