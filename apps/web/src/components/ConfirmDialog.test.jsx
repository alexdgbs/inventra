import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("mantiene el foco dentro del diálogo al navegar con Tab", () => {
    render(<ConfirmDialog open title="Eliminar" description="Detalle" confirmLabel="Eliminar" onConfirm={vi.fn()} onCancel={vi.fn()}/>);
    const cancel = screen.getByRole("button", { name: "Cancelar" });
    const confirm = screen.getByRole("button", { name: "Eliminar" });
    fireEvent.keyDown(cancel, { key: "Tab", shiftKey: true });
    expect(confirm).toHaveFocus();
    fireEvent.keyDown(confirm, { key: "Tab" });
    expect(cancel).toHaveFocus();
  });
  it("no renderiza contenido cuando está cerrado", () => { render(<ConfirmDialog open={false} title="Eliminar" description="Detalle" confirmLabel="Eliminar" onConfirm={vi.fn()} onCancel={vi.fn()}/>); expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(); });
  it("permite cancelar con Escape", () => { const onCancel = vi.fn(); render(<ConfirmDialog open title="Eliminar" description="Detalle" confirmLabel="Eliminar" onConfirm={vi.fn()} onCancel={onCancel}/>); fireEvent.keyDown(window, { key: "Escape" }); expect(onCancel).toHaveBeenCalledOnce(); });
  it("bloquea el desplazamiento del fondo mientras está abierto", () => { const { unmount } = render(<ConfirmDialog open title="Eliminar" description="Detalle" confirmLabel="Eliminar" onConfirm={vi.fn()} onCancel={vi.fn()}/>); expect(document.body.style.position).toBe("fixed"); expect(document.body.style.overflow).toBe("hidden"); unmount(); expect(document.body.style.position).toBe(""); });
});
