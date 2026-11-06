import { useState } from "react";
import PropTypes from "prop-types";
import api from "../../api/client";
import Modal from "../Modal";
import { getCategoryName } from "../../utils/categories";

function InquiryForm({ serviceId, onSent }) {
  const [inquiry, setInquiry] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault(); setSending(true); setError("");
    try { await api.post("/api/inquiries", { ...inquiry, serviceId }); onSent(); }
    catch (requestError) { setError(requestError.response?.data?.message || "No pudimos enviar tu solicitud. Intenta de nuevo."); }
    finally { setSending(false); }
  }
  return <form className="inquiry-form" onSubmit={submit}><h3>Solicitar este servicio</h3><div className="inquiry-row"><label>Nombre<input value={inquiry.name} onChange={event => setInquiry({ ...inquiry, name: event.target.value })} minLength="2" maxLength="100" required/></label><label>Correo electrónico<input type="email" value={inquiry.email} onChange={event => setInquiry({ ...inquiry, email: event.target.value })} maxLength="254" required/></label></div><label>Mensaje<textarea value={inquiry.message} onChange={event => setInquiry({ ...inquiry, message: event.target.value })} minLength="10" maxLength="1000" placeholder="Cuéntanos brevemente qué necesitas" required/></label>{error && <div className="form-error" role="alert">{error}</div>}<button className="button button-primary button-full" disabled={sending}>{sending ? "Enviando…" : "Enviar solicitud"}</button></form>;
}

export default function ServiceDetailsModal({ service, isAdmin, onClose }) {
  const [sent, setSent] = useState(false);
  const category = getCategoryName(service.category);
  return <Modal open className="service-modal" role="dialog" labelledBy="service-title" onClose={onClose}><button className="modal-close" onClick={onClose} aria-label="Cerrar detalles">×</button><span className="service-category">{category || "Servicio profesional"}</span><h2 id="service-title">{service.name}</h2><p>{service.description}</p><dl><div><dt>Tarifa</dt><dd>{service.formattedPrice}</dd></div><div><dt>Modalidad</dt><dd>Por hora</dd></div><div><dt>Moneda</dt><dd>{service.currency}</dd></div></dl>{isAdmin ? <div className="admin-inquiry-notice" role="note"><strong>Vista administrativa</strong><p>Las solicitudes de servicio se reservan para clientes externos.</p></div> : sent ? <div className="inquiry-success" role="status"><strong>Solicitud recibida</strong><p>Tu mensaje quedó registrado correctamente.</p><button className="button button-primary button-full" onClick={onClose}>Cerrar</button></div> : <InquiryForm serviceId={service.id} onSent={() => setSent(true)}/>}</Modal>;
}

InquiryForm.propTypes = { serviceId: PropTypes.number.isRequired, onSent: PropTypes.func.isRequired };
ServiceDetailsModal.propTypes = { service: PropTypes.object.isRequired, isAdmin: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired };
