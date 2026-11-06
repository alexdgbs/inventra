import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// Catálogo de demostración: servicios genéricos de ejemplo, sin clientes,
// reseñas ni proveedores reales. Los precios son MXN por hora.
const catalog = [
  { category: "Diseño", name: "Diseño de identidad", description: "Sistema visual, logotipo y lineamientos esenciales para construir una marca consistente.", price: 204 },
  { category: "Diseño", name: "Auditoría de experiencia UX", description: "Revisión de flujos, jerarquía y usabilidad con hallazgos priorizados y recomendaciones accionables.", price: 306 },
  { category: "Desarrollo", name: "Sitio web profesional", description: "Desarrollo de un sitio responsive, accesible y optimizado para presentar tu negocio o producto.", price: 340 },
  { category: "Desarrollo", name: "Automatización de procesos", description: "Integración de herramientas y automatización de tareas repetitivas para reducir trabajo manual.", price: 306 },
  { category: "Marketing", name: "Estrategia de contenido", description: "Plan editorial basado en objetivos, audiencias, canales y una guía clara de ejecución.", price: 136 },
  { category: "Consultoría", name: "Diagnóstico digital", description: "Evaluación de presencia, procesos y oportunidades digitales con un plan de mejora priorizado.", price: 255 },
  { category: "Diseño", name: "Diseño de presentaciones", description: "Presentaciones claras y profesionales para ventas, pitches o formación interna.", price: 180 },
  { category: "Desarrollo", name: "Tienda en línea", description: "Tienda en línea con catálogo, carrito y cobro para vender tus productos por internet.", price: 340 },
  { category: "Desarrollo", name: "Mantenimiento y soporte web", description: "Actualizaciones, copias de seguridad y correcciones para mantener tu sitio funcionando.", price: 190 },
  { category: "Marketing", name: "Redacción y corrección de textos", description: "Textos claros y sin errores para tu sitio, folletos o publicaciones.", price: 170 },
  { category: "Marketing", name: "Gestión de redes sociales", description: "Planificación y publicación de contenido para mantener activas tus redes sociales.", price: 220 },
  { category: "Marketing", name: "Optimización SEO", description: "Mejoras de contenido y estructura para que tu sitio aparezca mejor en buscadores.", price: 280 },
  { category: "Consultoría", name: "Consultoría de marca personal", description: "Definición de tu propuesta de valor y presencia profesional en línea.", price: 250 },
  { category: "Consultoría", name: "Análisis de datos básicos", description: "Lectura de tus datos de ventas o visitas para encontrar qué está funcionando.", price: 230 },
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

  // El seed actualiza o crea cada servicio por nombre, pero no elimina los
  // servicios antiguos de la base de datos: si uno deja de estar en esta
  // lista, sigue en la BD hasta borrarlo a mano desde el panel.
  for (const entry of catalog) {
    const category = await prisma.category.upsert({ where: { ownerId_name: { ownerId: admin.id, name: entry.category } }, update: {}, create: { name: entry.category, ownerId: admin.id } });
    const existing = await prisma.service.findFirst({ where: { ownerId: admin.id, name: entry.name } });
    if (existing) await prisma.service.update({ where: { id: existing.id }, data: { description: entry.description, price: entry.price, categoryId: category.id } });
    else await prisma.service.create({ data: { name: entry.name, description: entry.description, price: entry.price, categoryId: category.id, ownerId: admin.id } });
  }

  console.log(`Catálogo inicial listo. Usuario administrador: ${username}`);
}

main().finally(() => prisma.$disconnect());
