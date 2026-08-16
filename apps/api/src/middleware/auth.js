import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies?.inventra_session || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Debes iniciar sesión." });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "inventra-api", audience: "inventra-web" });
    return next();
  } catch {
    return res.status(401).json({ message: "La sesión no es válida o expiró." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "No tienes permisos para esta acción." });
  return next();
}
