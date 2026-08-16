import "dotenv/config";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

const port = Number(process.env.PORT) || 4000;

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET || !process.env.CORS_ORIGIN) {
  throw new Error("DATABASE_URL, JWT_SECRET y CORS_ORIGIN son obligatorias.");
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET debe contener al menos 32 caracteres.");
}

const server = app.listen(port, () => console.log(`Inventra API disponible en http://localhost:${port}`));

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
