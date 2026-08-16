import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ConfirmDialog from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("no renderiza contenido cuando está cerrado", () => { render(<ConfirmDialog open={false} title="Eliminar" description="Detalle" confirmLabel="Eliminar" onConfirm={vi.fn()} onCancel={vi.fn()}/>); expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(); });
  it("permite cancelar con Escape", () => { const onCancel = vi.fn(); render(<ConfirmDialog open title="Eliminar" description="Detalle" confirmLabel="Eliminar" onConfirm={vi.fn()} onCancel={onCancel}/>); fireEvent.keyDown(window, { key: "Escape" }); expect(onCancel).toHaveBeenCalledOnce(); });
});
