import { z } from "zod";

// Id numérico positivo de la URL (categorías, servicios, solicitudes).
export const idSchema = z.coerce.number().int().positive();
