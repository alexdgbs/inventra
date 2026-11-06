import PropTypes from "prop-types";
import Modal from "./Modal";

export default function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }) {
  return <Modal open={open} onClose={onCancel} className="confirm-dialog" role="alertdialog" labelledBy="confirm-title" describedBy="confirm-description"><h2 id="confirm-title">{title}</h2><p id="confirm-description">{description}</p><div><button className="button button-ghost" onClick={onCancel}>Cancelar</button><button className="button button-danger" onClick={onConfirm}>{confirmLabel}</button></div></Modal>;
}

ConfirmDialog.propTypes = { open: PropTypes.bool.isRequired, title: PropTypes.string.isRequired, description: PropTypes.string.isRequired, confirmLabel: PropTypes.string.isRequired, onConfirm: PropTypes.func.isRequired, onCancel: PropTypes.func.isRequired };
