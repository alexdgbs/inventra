import { describe, expect, it } from "vitest";
import { matchesService } from "./search";

describe("service search", () => {
  const item = { name: "Diagnóstico digital", description: "Revisión de procesos", category: { name: "Consultoría" } };
  it("matches categories without accents and ignores case", () => {
    expect(matchesService(item, "  CONSULTORIA  ")).toBe(true);
    expect(matchesService({ ...item, category: "Marketing" }, "marketing")).toBe(true);
  });
  it("matches words across name, description and category", () => {
    expect(matchesService(item, "consultoria   diagnostico procesos")).toBe(true);
    expect(matchesService(item, "marketing")).toBe(false);
  });
  it("allows an empty query and missing fields", () => {
    expect(matchesService({}, "")).toBe(true);
    expect(matchesService({}, "consultoria")).toBe(false);
  });
});
