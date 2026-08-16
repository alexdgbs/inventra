import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  useEffect(() => { if (!open) return undefined; const previous = document.activeElement; cancelRef.current?.focus(); const onKeyDown = event => { if (event.key === "Escape") onCancel(); }; window.addEventListener("keydown", onKeyDown); return () => { window.removeEventListener("keydown", onKeyDown); previous?.focus?.(); }; }, [open, onCancel]);
  if (!open) return null;
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onCancel(); }}><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p><div><button ref={cancelRef} className="button button-ghost" onClick={onCancel}>Cancelar</button><button className="button button-danger" onClick={onConfirm}>{confirmLabel}</button></div></section></div>;
}

ConfirmDialog.propTypes = { open: PropTypes.bool.isRequired, title: PropTypes.string.isRequired, description: PropTypes.string.isRequired, confirmLabel: PropTypes.string.isRequired, onConfirm: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired };
