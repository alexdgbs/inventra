import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const credentialsSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(100),
});

router.post("/login", async (req, res) => {
  const credentials = credentialsSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { username: credentials.username } });
  if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
    return res.status(401).json({ message: "Usuario o contraseña incorrectos." });
  }

  const role = user.role.toLowerCase();
  const token = jwt.sign({ sub: user.id, username: user.username, role }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "8h", issuer: "inventra-api", audience: "inventra-web" });
  res.set("Cache-Control", "no-store");
  res.cookie("inventra_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 8 * 60 * 60 * 1000, path: "/" });
  return res.json({ user: { id: user.id, username: user.username, role } });
});

router.get("/me", requireAuth, (req, res) => {
  res.set("Cache-Control", "no-store");
  return res.json({ user: { id: Number(req.user.sub), username: req.user.username, role: req.user.role } });
});

router.post("/logout", (req, res) => {
  res.clearCookie("inventra_session", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/" });
  return res.status(204).end();
});

export default router;
