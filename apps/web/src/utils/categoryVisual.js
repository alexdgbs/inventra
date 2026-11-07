import { normalizeSearch } from "./search";

// Clase de degradado por categoría para las tarjetas del catálogo.
// Vivía en CategoryIcon.jsx junto al componente y provocaba el aviso de
// ESLint react-refresh/only-export-components; ahora está aquí, en un
// módulo sin componentes.
const VISUAL_CLASSES = {
  "diseno": "card-visual--diseno",
  "desarrollo": "card-visual--desarrollo",
  "marketing": "card-visual--marketing",
  "consultoria": "card-visual--consultoria",
};

export function categoryVisualClass(name) {
  return VISUAL_CLASSES[normalizeSearch(name)] || "card-visual--default";
}
