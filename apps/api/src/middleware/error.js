import { ZodError } from "zod";

export function notFound(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  void req;
  void next;
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Datos inválidos.", errors: error.flatten().fieldErrors });
  }
  if (error.code === "P2002") return res.status(409).json({ message: "Ya existe un registro con esos datos." });
  if (error.code === "P2003") return res.status(409).json({ message: "El registro todavía tiene elementos relacionados." });
  console.error(error);
  return res.status(500).json({ message: "Ocurrió un error inesperado." });
}
