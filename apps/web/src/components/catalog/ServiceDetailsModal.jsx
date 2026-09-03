import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import api from "../../api/client";
import useModalScrollLock from "../../hooks/useModalScrollLock";
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
  const modalRef = useRef(null);
  const [sent, setSent] = useState(false);
  useModalScrollLock(true);
  useEffect(() => {
    const previousFocus = document.activeElement;
    modalRef.current?.querySelector("button")?.focus();
    function handleKeys(event) {
      if (event.key === "Escape") return onClose();
      if (event.key !== "Tab") return;
      const controls = [...modalRef.current.querySelectorAll("button,input,textarea,select,a[href]")].filter(element => !element.disabled);
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
    }
    window.addEventListener("keydown", handleKeys);
    return () => { window.removeEventListener("keydown", handleKeys); previousFocus?.focus?.(); };
  }, [onClose]);
  const category = getCategoryName(service.category);
  return <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section ref={modalRef} className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-title"><button className="modal-close" onClick={onClose} aria-label="Cerrar detalles">×</button><span className="service-category">{category || "Servicio profesional"}</span><h2 id="service-title">{service.name}</h2><p>{service.description}</p><dl><div><dt>Tarifa</dt><dd>{service.formattedPrice}</dd></div><div><dt>Modalidad</dt><dd>Por hora</dd></div><div><dt>Moneda</dt><dd>{service.currency}</dd></div></dl>{isAdmin ? <div className="admin-inquiry-notice" role="note"><strong>Vista administrativa</strong><p>Las solicitudes de servicio se reservan para clientes externos.</p></div> : sent ? <div className="inquiry-success" role="status"><strong>Solicitud recibida</strong><p>Tu mensaje quedó registrado correctamente.</p><button className="button button-primary button-full" onClick={onClose}>Cerrar</button></div> : <InquiryForm serviceId={service.id} onSent={() => setSent(true)}/>}</section></div>;
}

InquiryForm.propTypes = { serviceId: PropTypes.number.isRequired, onSent: PropTypes.func.isRequired };
ServiceDetailsModal.propTypes = { service: PropTypes.object.isRequired, isAdmin: PropTypes.bool.isRequired, onClose: PropTypes.func.isRequired };
