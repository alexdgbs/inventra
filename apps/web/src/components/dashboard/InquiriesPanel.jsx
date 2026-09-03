import PropTypes from "prop-types";

export default function InquiriesPanel({ inquiries, onStatusChange, onRemoveClosed }) {
  const newCount = inquiries.filter(entry => entry.status === "NEW").length;
  return <section className="inquiries-panel">
    <div className="inquiries-heading"><div><h2>Solicitudes recibidas</h2></div><div className="inquiries-summary"><span>{newCount} nuevas</span>{inquiries.some(entry => entry.status === "CLOSED") && <button className="clear-closed" onClick={onRemoveClosed}>Eliminar cerradas</button>}</div></div>
    {inquiries.length ? <div className="inquiries-list">{inquiries.map(entry => <article key={entry.id}><div className="inquiry-main"><h3>{entry.name}</h3><a href={`mailto:${entry.email}`}>{entry.email}</a><p>{entry.message}</p></div><div className="inquiry-meta"><span>{entry.service.name}</span><time dateTime={entry.createdAt}>{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(entry.createdAt))}</time><div className="inquiry-state" role="group" aria-label={`Estado de solicitud de ${entry.name}`}>{[["NEW", "Nueva"], ["CONTACTED", "Contactada"], ["CLOSED", "Cerrada"]].map(([value, label]) => <button key={value} type="button" aria-pressed={entry.status === value} onClick={() => { if (entry.status !== value) onStatusChange(entry.id, value); }}>{label}</button>)}</div></div></article>)}</div> : <div className="empty-inquiries"><p>Aún no se han recibido solicitudes.</p></div>}
  </section>;
}

InquiriesPanel.propTypes = { inquiries: PropTypes.arrayOf(PropTypes.object).isRequired, onStatusChange: PropTypes.func.isRequired, onRemoveClosed: PropTypes.func.isRequired };
