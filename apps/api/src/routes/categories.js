import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();
const categorySchema = z.object({ name: z.string().trim().min(2).max(80) });
const idSchema = z.coerce.number().int().positive();

router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { services: true } } },
  });
  res.json(categories);
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const data = categorySchema.parse(req.body);
  const category = await prisma.category.create({ data: { ...data, ownerId: Number(req.user.sub) } });
  res.status(201).json(category);
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const data = categorySchema.parse(req.body);
  const result = await prisma.category.updateMany({ where: { id, ownerId: Number(req.user.sub) }, data });
  if (!result.count) return res.status(404).json({ message: "Categoría no encontrada." });
  return res.json(await prisma.category.findUnique({ where: { id } }));
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const result = await prisma.category.deleteMany({ where: { id, ownerId: Number(req.user.sub), services: { none: {} } } });
  if (!result.count) return res.status(409).json({ message: "Elimina o mueve sus servicios antes de borrar la categoría." });
  return res.status(204).end();
});

export default router;
