import { describe, expect, it } from "vitest";
import { formatPrice } from "./pricing";

describe("formatPrice", () => {
  it("muestra el precio en MXN sin centavos cuando no los tiene", () => {
    expect(formatPrice(340, "MXN")).toBe("$340");
  });

  it("muestra los centavos en MXN cuando los tiene", () => {
    expect(formatPrice(199.5, "MXN")).toBe("$199.50");
  });

  it("convierte a USD con dos decimales", () => {
    expect(formatPrice(340, "USD")).toBe("$20.00");
  });
});
