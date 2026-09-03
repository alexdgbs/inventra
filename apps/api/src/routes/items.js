import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();
const idSchema = z.coerce.number().int().positive();
const serviceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1000),
  price: z.coerce.number().nonnegative().max(99999999.99),
  categoryId: z.coerce.number().int().positive(),
});
const selection = { id: true, name: true, description: true, price: true, categoryId: true, category: { select: { id: true, name: true } } };
const serialize = item => ({ ...item, price: Number(item.price) });

router.get("/", async (req, res) => {
  const items = await prisma.service.findMany({ orderBy: { createdAt: "desc" }, select: selection });
  res.json(items.map(serialize));
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const data = serviceSchema.parse(req.body);
  const category = await prisma.category.findFirst({ where: { id: data.categoryId, ownerId: Number(req.user.sub) } });
  if (!category) return res.status(400).json({ message: "La categoría seleccionada no existe." });
  const item = await prisma.service.create({ data: { ...data, ownerId: Number(req.user.sub) }, select: selection });
  return res.status(201).json(serialize(item));
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const data = serviceSchema.parse(req.body);
  const category = await prisma.category.findFirst({ where: { id: data.categoryId, ownerId: Number(req.user.sub) } });
  if (!category) return res.status(400).json({ message: "La categoría seleccionada no existe." });
  const existing = await prisma.service.findFirst({ where: { id, ownerId: Number(req.user.sub) } });
  if (!existing) return res.status(404).json({ message: "Servicio no encontrado." });
  const item = await prisma.service.update({ where: { id }, data, select: selection });
  return res.json(serialize(item));
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const result = await prisma.service.deleteMany({ where: { id, ownerId: Number(req.user.sub) } });
  if (!result.count) return res.status(404).json({ message: "Servicio no encontrado." });
  return res.status(204).end();
});

export default router;
