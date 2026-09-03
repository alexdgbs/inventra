import jwt from "jsonwebtoken";
import { sessionCookieName } from "../lib/session.js";

function readToken(req) {
  return req.cookies?.[sessionCookieName] || req.headers.authorization?.replace(/^Bearer\s+/i, "");
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"], issuer: "inventra-api", audience: "inventra-web" });
}

export function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: "Debes iniciar sesión." });

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "La sesión no es válida o expiró." });
  }
}

export function readOptionalAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ message: "La sesión no es válida o expiró." });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "No tienes permisos para esta acción." });
  return next();
}
