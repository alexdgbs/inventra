import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// Catálogo de demostración: servicios genéricos de ejemplo, sin clientes,
// reseñas ni proveedores reales. Los precios son MXN por hora.
const catalog = [
  { category: "Diseño", name: "Diseño de identidad", description: "Logotipo en vector, paleta de 3 a 5 colores, tipografías y una guía de uso de una página para aplicarla igual en web, redes y papelería. Para negocios que empiezan y necesitan una imagen coherente desde el primer día.", price: 197 },
  { category: "Diseño", name: "Auditoría de experiencia UX", description: "Revisión de tu sitio o app pantalla por pantalla: dónde se pierde la gente, qué botones no se entienden y qué frena la compra o el registro. Entregable: lista priorizada de 10 a 15 hallazgos con el cambio sugerido en cada uno.", price: 243 },
  { category: "Desarrollo", name: "Sitio web profesional", description: "Sitio de hasta 5 secciones (inicio, servicios, sobre ti, contacto) adaptable a celular, con formulario de contacto y textos revisados. Incluye puesta en línea y una sesión de 30 minutos para enseñarte a actualizarlo.", price: 318 },
  { category: "Desarrollo", name: "Automatización de procesos", description: "Conecto las herramientas que ya usas (hojas de cálculo, correo, CRM) para que los datos se muevan solos: altas de clientes, avisos y reportes semanales sin copiar y pegar. Empieza con un proceso y se amplía después.", price: 296 },
  { category: "Marketing", name: "Estrategia de contenido", description: "Calendario de un mes con 12 publicaciones: tema, formato y texto base para cada una, pensado para el público que quieres atraer. Para negocios que publican cuando se acuerdan y quieren constancia.", price: 129 },
  { category: "Consultoría", name: "Diagnóstico digital", description: "Revisión de tu web, redes y ficha de Google: qué está bien, qué está roto y qué te hace perder clientes. Entregable: informe de 5 páginas con 5 acciones ordenadas por impacto, no una lista genérica.", price: 247 },
  { category: "Diseño", name: "Diseño de presentaciones", description: "Hasta 15 diapositivas con tu contenido y tu marca: portada, gráficos simples y cierre con llamada a la acción. Para ventas, pitches o formación, lista para presentar sin retoques.", price: 175 },
  { category: "Desarrollo", name: "Tienda en línea", description: "Tienda con catálogo de hasta 50 productos, carrito y cobro con tarjeta, más el alta de los primeros 10 productos contigo. Para vender por internet sin depender de redes sociales.", price: 329 },
  { category: "Desarrollo", name: "Mantenimiento y soporte web", description: "Revisión mensual de tu sitio: actualizaciones, copia de seguridad y arreglo de lo que se rompa, con aviso por correo cuando algo necesite tu atención. Sin permanencia, mes a mes.", price: 183 },
  { category: "Marketing", name: "Redacción y corrección de textos", description: "Reescritura de los textos de tu web o folleto (hasta 2.000 palabras) para que se entiendan a la primera y suenen a ti, no a una plantilla. Incluye una ronda de correcciones.", price: 164 },
  { category: "Marketing", name: "Gestión de redes sociales", description: "3 publicaciones por semana en 2 redes (Instagram y Facebook o LinkedIn): texto, imagen y programación, con un reporte mensual de qué funcionó. Tú solo apruebas el contenido.", price: 214 },
  { category: "Marketing", name: "Optimización SEO", description: "Revisión de títulos, descripciones y estructura de hasta 10 páginas para que Google entienda de qué va tu sitio y te muestre en búsquedas locales. Incluye informe de antes y después.", price: 273 },
  { category: "Consultoría", name: "Consultoría de marca personal", description: "2 sesiones de una hora para definir qué te hace distinto, a quién le hablas y qué decir en tu perfil y tu web. Saldrás con un guion corto para presentarte y una lista de 3 temas de los que hablar.", price: 238 },
  { category: "Consultoría", name: "Análisis de datos básicos", description: "Revisión de tus ventas o visitas del último trimestre en una hoja simple: qué se vende, cuándo y de dónde viene la gente. Entregable: 5 conclusiones y 3 acciones concretas para el mes siguiente.", price: 221 },
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
