// Única fuente de verdad del tema en el bundle de la web.
// El script en línea de index.html es un espejo mínimo de esta lógica:
// corre antes de cargar el bundle para evitar el parpadeo de tema y no
// puede importar este módulo, así que si cambian la clave o los colores,
// hay que actualizar ambos sitios (ver el comentario en index.html).
export const THEME_STORAGE_KEY = "inventra-theme";
export const THEME_LIGHT_BACKGROUND = "#ffffff";
export const THEME_DARK_BACKGROUND = "#111113";

export function isValidTheme(value) {
  return value === "light" || value === "dark";
}

export function resolveTheme(saved) {
  if (isValidTheme(saved)) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function themeBackground(theme) {
  return theme === "dark" ? THEME_DARK_BACKGROUND : THEME_LIGHT_BACKGROUND;
}

export function applyThemeToDocument(theme) {
  const background = themeBackground(theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.style.backgroundColor = background;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", background);
}
