import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

process.env.JWT_SECRET = "test-secret-with-at-least-thirty-two-characters";
const prismaMock = vi.hoisted(() => ({ inquiry: { create: vi.fn() }, service: { findUnique: vi.fn() }, user: { findUnique: vi.fn() }, $queryRaw: vi.fn() }));
vi.mock("./lib/prisma.js", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ default: { compare: vi.fn().mockResolvedValue(true) } }));
const { app } = await import("./app.js");

describe("API", () => {
  beforeEach(() => vi.clearAllMocks());
  it("responde 404 con una ruta desconocida", async () => { const response = await request(app).get("/api/no-existe"); expect(response.status).toBe(404); expect(response.body.message).toContain("Ruta no encontrada"); });
  it("rechaza solicitudes de contacto inválidas", async () => { const response = await request(app).post("/api/inquiries").send({ serviceId: 1, name: "A", email: "correo-invalido", message: "corto" }); expect(response.status).toBe(400); expect(response.body.errors).toBeDefined(); });
  it("registra una solicitud válida", async () => { prismaMock.service.findUnique.mockResolvedValue({ id: 1 }); prismaMock.inquiry.create.mockResolvedValue({ id: 8, status: "NEW", createdAt: new Date() }); const response = await request(app).post("/api/inquiries").send({ serviceId: 1, name: "Ana López", email: "ana@example.com", message: "Necesito información sobre el servicio." }); expect(response.status).toBe(201); expect(response.body.status).toBe("NEW"); expect(prismaMock.inquiry.create).toHaveBeenCalledOnce(); });
  it("entrega la sesión en una cookie httpOnly", async () => { prismaMock.user.findUnique.mockResolvedValue({ id: 1, username: "admin", passwordHash: "hash", role: "ADMIN" }); const response = await request(app).post("/api/auth/login").send({ username: "admin", password: "inventra123" }); expect(response.status).toBe(200); expect(response.body.token).toBeUndefined(); expect(response.headers["set-cookie"][0]).toContain("HttpOnly"); });
});
