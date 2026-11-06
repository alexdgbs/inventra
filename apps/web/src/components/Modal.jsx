import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import useModalScrollLock from "../hooks/useModalScrollLock";

// Contenedor compartido para los modales basados en <div> (ConfirmDialog y
// ServiceDetailsModal): fondo, bloqueo de scroll, cierre con Escape o al
// pulsar el fondo, trampa de foco y restauración del foco previo.
// CatalogEditor queda fuera a propósito: usa <dialog> nativo, que ya
// atrapa el foco y gestiona Escape por sí mismo.
export default function Modal({ open, onClose, className, role = "dialog", labelledBy, describedBy, children }) {
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useModalScrollLock(open);
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement;
    const focusables = () => [...containerRef.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(element => !element.disabled);
    focusables()[0]?.focus();
    function handleKeys(event) {
      if (event.key === "Escape") { onCloseRef.current(); return; }
      if (event.key !== "Tab") return;
      const controls = focusables();
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
    }
    window.addEventListener("keydown", handleKeys);
    return () => { window.removeEventListener("keydown", handleKeys); previousFocus?.focus?.(); };
  }, [open]);
  if (!open) return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onCloseRef.current(); }}><section ref={containerRef} className={className} role={role} aria-modal="true" aria-labelledby={labelledBy} aria-describedby={describedBy}>{children}</section></div>;
}

Modal.propTypes = { open: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired, className: PropTypes.string.isRequired, role: PropTypes.string, labelledBy: PropTypes.string, describedBy: PropTypes.string, children: PropTypes.node.isRequired };
