import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import api from "../api/client";
import { usePreferences } from "../context/PreferencesContext";

const paths = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
};

function Icon({ name, size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const USD_MXN_RATE = Number(import.meta.env.VITE_USD_MXN_RATE) || 17;

function ServiceCard({ item, onView, currency }) {
  const category = typeof item.category === "object" ? item.category?.name : item.category;
  const sourcePrice = Number(item.price || 0);
  const price = currency === "USD" ? sourcePrice / USD_MXN_RATE : sourcePrice;
  const formattedPrice = new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", { style: "currency", currency, maximumFractionDigits: currency === "USD" ? 2 : 0 }).format(price);
  return <article className="service-card">
    <div className="card-top"><span className="category-badge">{category || "General"}</span><span className="availability"><i/> Disponible</span></div>
    <h3>{item.name || "Servicio profesional"}</h3>
    <p>{item.description || "Consulta los detalles de este servicio con nuestro equipo."}</p>
    <div className="card-bottom"><div><small>Desde</small><strong>{formattedPrice} <span>{currency} / hora</span></strong></div><button className="card-action" onClick={() => onView({ ...item, formattedPrice, currency })}>Ver detalles</button></div>
  </article>;
}

export default function HomePage() {
  const { currency } = usePreferences();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);
  const [inquiry, setInquiry] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [inquiryError, setInquiryError] = useState("");
  const [sent, setSent] = useState(false);

  async function loadItems() {
    setLoading(true); setError("");
    try { const { data } = await api.get("/api/items"); setItems(Array.isArray(data) ? data : []); }
    catch { setError("No pudimos cargar los servicios. Revisa tu conexión e inténtalo de nuevo."); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadItems(); }, []);
  const categories = useMemo(() => [...new Set(items.map(i => typeof i.category === "object" ? i.category?.name : i.category).filter(Boolean))], [items]);
  const filtered = useMemo(() => items.filter(item => {
    const itemCategory = typeof item.category === "object" ? item.category?.name : item.category;
    const text = `${item.name || ""} ${item.description || ""}`.toLowerCase();
    return (!category || itemCategory === category) && text.includes(query.trim().toLowerCase());
  }), [items, category, query]);
  useEffect(() => {
    if (!selected) return undefined;
    const previousFocus = document.activeElement;
    const modal = document.querySelector(".service-modal");
    modal?.querySelector("button")?.focus();
    function handleKeys(event) {
      if (event.key === "Escape") closeDetails();
      if (event.key !== "Tab") return;
      const controls = [...modal.querySelectorAll("button,input,textarea,select,a[href]")].filter(element => !element.disabled);
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
    }
    window.addEventListener("keydown", handleKeys);
    return () => { window.removeEventListener("keydown", handleKeys); previousFocus?.focus?.(); };
  }, [selected]);

  function closeDetails() { setSelected(null); setInquiry({ name: "", email: "", message: "" }); setInquiryError(""); setSent(false); }
  async function submitInquiry(event) {
    event.preventDefault(); setSending(true); setInquiryError("");
    try { await api.post("/api/inquiries", { ...inquiry, serviceId: selected.id }); setSent(true); }
    catch (requestError) { setInquiryError(requestError.response?.data?.message || "No pudimos enviar tu solicitud. Intenta de nuevo."); }
    finally { setSending(false); }
  }

  return <>
    <section className="catalog-section" id="catalogo"><div className="container">
      <div className="directory-heading"><div><h1>Servicios</h1><p>Explora la oferta disponible y encuentra una opción para tu proyecto.</p></div><span className="directory-count">{filtered.length} {filtered.length === 1 ? "servicio" : "servicios"}</span></div>
      <div className="catalog-toolbar">
        <label className="catalog-search"><Icon name="search" size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar servicios" aria-label="Buscar servicios"/>{query && <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda">Limpiar</button>}</label>
        <label className="category-filter"><span>Categoría</span><select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filtrar por categoría"><option value="">Todos los servicios</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></label>
      </div>
      {currency === "USD" && <p className="currency-note">Conversión estimada con una tasa configurable de {USD_MXN_RATE} MXN por USD.</p>}
      {loading ? <div className="state-card"><span className="spinner"/><h3>Cargando servicios</h3><p>Esto tomará solo un momento.</p></div> : error ? <div className="state-card error-state"><span>!</span><h3>No pudimos conectar</h3><p>{error}</p><button className="button button-primary" onClick={loadItems}>Intentar de nuevo</button></div> : filtered.length ? <div className="services-grid">{filtered.map(item => <ServiceCard key={item.id} item={item} currency={currency} onView={setSelected}/>)}</div> : <div className="state-card"><Icon name="search" size={26}/><h3>Sin coincidencias</h3><p>Prueba otro término o explora todas las categorías.</p><button className="button button-primary" onClick={() => { setQuery(""); setCategory(""); }}>Limpiar filtros</button></div>}
    </div></section>
    <section className="process-section"><div className="container"><div className="process-intro"><span>Cómo funciona</span><p>Del catálogo al contacto, sin pasos innecesarios.</p></div><ol><li><b>01</b><div><strong>Explora</strong><span>Busca por nombre o categoría.</span></div></li><li><b>02</b><div><strong>Revisa</strong><span>Consulta alcance y tarifa.</span></div></li><li><b>03</b><div><strong>Contacta</strong><span>Envía una solicitud directamente.</span></div></li></ol></div></section>

    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeDetails(); }}><section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-title"><button className="modal-close" onClick={closeDetails} aria-label="Cerrar detalles">×</button><span className="category-badge">{typeof selected.category === "object" ? selected.category?.name : selected.category || "General"}</span><h2 id="service-title">{selected.name}</h2><p>{selected.description}</p><dl><div><dt>Tarifa</dt><dd>{selected.formattedPrice}</dd></div><div><dt>Modalidad</dt><dd>Por hora</dd></div><div><dt>Moneda</dt><dd>{selected.currency}</dd></div></dl>{sent ? <div className="inquiry-success" role="status"><strong>Solicitud recibida</strong><p>Tu mensaje quedó registrado correctamente.</p><button className="button button-primary button-full" onClick={closeDetails}>Cerrar</button></div> : <form className="inquiry-form" onSubmit={submitInquiry}><h3>Contactar por este servicio</h3><div className="inquiry-row"><label>Nombre<input value={inquiry.name} onChange={event => setInquiry({ ...inquiry, name: event.target.value })} minLength="2" maxLength="100" required/></label><label>Correo<input type="email" value={inquiry.email} onChange={event => setInquiry({ ...inquiry, email: event.target.value })} maxLength="254" required/></label></div><label>Mensaje<textarea value={inquiry.message} onChange={event => setInquiry({ ...inquiry, message: event.target.value })} minLength="10" maxLength="1000" placeholder="Cuéntanos brevemente qué necesitas" required/></label>{inquiryError && <div className="form-error" role="alert">{inquiryError}</div>}<button className="button button-primary button-full" disabled={sending}>{sending ? "Enviando..." : "Enviar solicitud"}</button></form>}</section></div>}

  </>;
}

Icon.propTypes = { name: PropTypes.oneOf(Object.keys(paths)).isRequired, size: PropTypes.number };
ServiceCard.propTypes = { item: PropTypes.object.isRequired, onView: PropTypes.func.isRequired, currency: PropTypes.oneOf(["MXN", "USD"]).isRequired };
