import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../../api/client";
import ServiceDetailsModal from "./ServiceDetailsModal";

vi.mock("../../api/client", () => ({ default: { post: vi.fn() } }));

const service = { id: 7, name: "Consultoría", description: "Diagnóstico profesional para el proyecto.", category: { name: "Estrategia" }, formattedPrice: "$900", currency: "MXN" };

describe("ServiceDetailsModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("oculta la solicitud para administradores", () => {
    render(<ServiceDetailsModal service={service} isAdmin onClose={vi.fn()}/>);
    expect(screen.getByText("Vista administrativa")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enviar solicitud" })).not.toBeInTheDocument();
  });

  it("envía la solicitud de un visitante", async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    render(<ServiceDetailsModal service={service} isAdmin={false} onClose={vi.fn()}/>);
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana López" } });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), { target: { value: "ana@example.com" } });
    fireEvent.change(screen.getByLabelText("Mensaje"), { target: { value: "Necesito información sobre este servicio." } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar solicitud" }));
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/inquiries", { serviceId: 7, name: "Ana López", email: "ana@example.com", message: "Necesito información sobre este servicio." }));
    expect(await screen.findByText("Solicitud recibida")).toBeInTheDocument();
  });
});
