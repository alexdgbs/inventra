import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ExpandableSearch from "./ExpandableSearch";

afterEach(() => vi.unstubAllGlobals());

it("bloquea el fondo al escribir en móvil y lo libera al terminar", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  render(<ExpandableSearch query="" onQueryChange={vi.fn()}/>);
  fireEvent.click(screen.getByRole("button", { name: "Buscar servicios" }));
  const input = screen.getByRole("textbox");
  expect(input).toHaveFocus();
  expect(document.body.style.position).toBe("fixed");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(document.body.style.position).toBe("");
});

it("permite desplazar el escritorio y cerrar la búsqueda con Escape", () => {
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  const onQueryChange = vi.fn();
  render(<ExpandableSearch query="" onQueryChange={onQueryChange}/>);
  const trigger = screen.getByRole("button", { name: "Buscar servicios" });
  fireEvent.click(trigger);
  expect(document.body.style.position).toBe("");
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
  expect(onQueryChange).toHaveBeenCalledWith("");
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
});
