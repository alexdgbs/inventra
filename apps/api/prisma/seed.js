import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const catalog = [
  { category: "Diseño", name: "Diseño de identidad", description: "Sistema visual, logotipo y lineamientos esenciales para construir una marca consistente.", price: 204 },
  { category: "Diseño", name: "Auditoría de experiencia UX", description: "Revisión de flujos, jerarquía y usabilidad con hallazgos priorizados y recomendaciones accionables.", price: 306 },
  { category: "Desarrollo", name: "Sitio web profesional", description: "Desarrollo de un sitio responsive, accesible y optimizado para presentar tu negocio o producto.", price: 340 },
  { category: "Desarrollo", name: "Automatización de procesos", description: "Integración de herramientas y automatización de tareas repetitivas para reducir trabajo manual.", price: 306 },
  { category: "Marketing", name: "Estrategia de contenido", description: "Plan editorial basado en objetivos, audiencias, canales y una guía clara de ejecución.", price: 136 },
  { category: "Consultoría", name: "Diagnóstico digital", description: "Evaluación de presencia, procesos y oportunidades digitales con un plan de mejora priorizado.", price: 255 },
];

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  let admin = await prisma.user.findUnique({ where: { username } });
  if (admin && admin.role !== Role.ADMIN) throw new Error("ADMIN_USERNAME debe corresponder a una cuenta administradora.");
  if (!admin) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) throw new Error("Configura ADMIN_PASSWORD antes de crear el administrador inicial.");
    const passwordHash = await bcrypt.hash(password, 12);
    admin = await prisma.user.create({ data: { username, passwordHash, role: Role.ADMIN } });
  }

  for (const entry of catalog) {
    const category = await prisma.category.upsert({ where: { ownerId_name: { ownerId: admin.id, name: entry.category } }, update: {}, create: { name: entry.category, ownerId: admin.id } });
    const existing = await prisma.service.findFirst({ where: { ownerId: admin.id, name: entry.name } });
    if (existing) await prisma.service.update({ where: { id: existing.id }, data: { description: entry.description, price: entry.price, categoryId: category.id } });
    else await prisma.service.create({ data: { name: entry.name, description: entry.description, price: entry.price, categoryId: category.id, ownerId: admin.id } });
  }

  console.log(`Catálogo inicial listo. Usuario administrador: ${username}`);
}

main().finally(() => prisma.$disconnect());
