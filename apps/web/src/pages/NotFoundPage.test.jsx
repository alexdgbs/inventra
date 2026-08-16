import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  it("ofrece una ruta de recuperación", () => { render(<MemoryRouter><NotFoundPage/></MemoryRouter>); expect(screen.getByRole("heading", { name: /esta página no existe/i })).toBeInTheDocument(); expect(screen.getByRole("link", { name: /volver al inicio/i })).toHaveAttribute("href", "/"); });
});
