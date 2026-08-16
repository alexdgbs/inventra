import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const catalog = [
  { category: "Diseño", name: "Diseño de identidad", description: "Sistema visual, logotipo y lineamientos esenciales para construir una marca consistente.", price: 850 },
  { category: "Diseño", name: "Auditoría de experiencia UX", description: "Revisión de flujos, jerarquía y usabilidad con hallazgos priorizados y recomendaciones accionables.", price: 950 },
  { category: "Desarrollo", name: "Sitio web profesional", description: "Desarrollo de un sitio responsive, accesible y optimizado para presentar tu negocio o producto.", price: 1200 },
  { category: "Desarrollo", name: "Automatización de procesos", description: "Integración de herramientas y automatización de tareas repetitivas para reducir trabajo manual.", price: 1100 },
  { category: "Marketing", name: "Estrategia de contenido", description: "Plan editorial basado en objetivos, audiencias, canales y una guía clara de ejecución.", price: 780 },
  { category: "Consultoría", name: "Diagnóstico digital", description: "Evaluación de presencia, procesos y oportunidades digitales con un plan de mejora priorizado.", price: 900 },
];

async function main() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "inventra123";
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({ where: { username }, update: { passwordHash, role: Role.ADMIN }, create: { username, passwordHash, role: Role.ADMIN } });

  for (const entry of catalog) {
    const category = await prisma.category.upsert({ where: { ownerId_name: { ownerId: admin.id, name: entry.category } }, update: {}, create: { name: entry.category, ownerId: admin.id } });
    const existing = await prisma.service.findFirst({ where: { ownerId: admin.id, name: entry.name } });
    if (existing) await prisma.service.update({ where: { id: existing.id }, data: { description: entry.description, price: entry.price, categoryId: category.id } });
    else await prisma.service.create({ data: { name: entry.name, description: entry.description, price: entry.price, categoryId: category.id, ownerId: admin.id } });
  }

  console.log(`Catálogo inicial listo. Usuario administrador: ${username}`);
}

main().finally(() => prisma.$disconnect());
