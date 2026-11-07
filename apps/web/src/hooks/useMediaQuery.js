import { useEffect, useState } from "react";

// Hook para consultar un media query y reaccionar cuando cambia, en vez
// de llamar a window.matchMedia durante el render (que no se actualiza
// al cambiar el tamaño de la ventana). Tolera entornos sin
// addEventListener en el objeto devuelto (p. ej. los tests).
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const onChange = event => setMatches(event.matches);
    if (typeof media.addEventListener === "function") media.addEventListener("change", onChange);
    else if (typeof media.addListener === "function") media.addListener(onChange);
    return () => {
      if (typeof media.removeEventListener === "function") media.removeEventListener("change", onChange);
      else if (typeof media.removeListener === "function") media.removeListener(onChange);
    };
  }, [query]);
  return matches;
}
