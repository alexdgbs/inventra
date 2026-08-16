import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();
const idSchema = z.coerce.number().int().positive();
const inquirySchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(1000),
});
const statusSchema = z.object({ status: z.enum(["NEW", "CONTACTED", "CLOSED"]) });
const createLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false, message: { message: "Demasiadas solicitudes. Intenta más tarde." } });

router.post("/", createLimiter, async (req, res) => {
  const data = inquirySchema.parse(req.body);
  const service = await prisma.service.findUnique({ where: { id: data.serviceId }, select: { id: true } });
  if (!service) return res.status(404).json({ message: "Servicio no encontrado." });
  const inquiry = await prisma.inquiry.create({ data, select: { id: true, status: true, createdAt: true } });
  return res.status(201).json(inquiry);
});

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const inquiries = await prisma.inquiry.findMany({ where: { service: { ownerId: Number(req.user.sub) } }, orderBy: { createdAt: "desc" }, include: { service: { select: { id: true, name: true } } } });
  res.json(inquiries);
});

router.delete("/closed", requireAuth, requireAdmin, async (req, res) => {
  const result = await prisma.inquiry.deleteMany({ where: { status: "CLOSED", service: { ownerId: Number(req.user.sub) } } });
  return res.json({ deleted: result.count });
});

router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const { status } = statusSchema.parse(req.body);
  const existing = await prisma.inquiry.findFirst({ where: { id, service: { ownerId: Number(req.user.sub) } } });
  if (!existing) return res.status(404).json({ message: "Solicitud no encontrada." });
  return res.json(await prisma.inquiry.update({ where: { id }, data: { status }, include: { service: { select: { id: true, name: true } } } }));
});

export default router;
