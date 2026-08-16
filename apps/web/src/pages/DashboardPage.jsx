import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import api from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";

const emptyItem = { name: "", description: "", price: "", categoryId: "" };
const categoryName = value => typeof value === "object" ? value?.name || "" : value || "";

function ActionIcon({ type }) {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{type === "edit" ? <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></> : <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></>}</svg>;
}

export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [tab, setTab] = useState("items");
  const [itemForm, setItemForm] = useState(emptyItem);
  const [categoryForm, setCategoryForm] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const [itemsResponse, categoriesResponse, inquiriesResponse] = await Promise.all([api.get("/api/items"), api.get("/api/categories"), api.get("/api/inquiries")]);
      setItems(Array.isArray(itemsResponse.data) ? itemsResponse.data : []);
      setCategories(Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
      setInquiries(Array.isArray(inquiriesResponse.data) ? inquiriesResponse.data : []);
    } catch { setError("No fue posible cargar el panel."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  function notify(text) { setMessage(text); window.setTimeout(() => setMessage(""), 3000); }

  async function saveItem(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (editing?.type === "item") {
        const { data } = await api.put(`/api/items/${editing.id}`, itemForm);
        setItems(items.map(item => item.id === editing.id ? data : item));
        notify("Servicio actualizado");
      } else {
        const { data } = await api.post("/api/items", itemForm);
        setItems([...items, data]); notify("Servicio creado");
      }
      setItemForm(emptyItem); setEditing(null);
    } catch { setError("No se pudo guardar el servicio."); }
    finally { setSaving(false); }
  }

  async function saveCategory(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (editing?.type === "category") {
        const { data } = await api.put(`/api/categories/${editing.id}`, { name: categoryForm });
        setCategories(categories.map(cat => cat.id === editing.id ? data : cat));
        setItems(items.map(item => item.categoryId === editing.id ? { ...item, category: data } : item));
        notify("Categoría actualizada");
      } else {
        const { data } = await api.post("/api/categories", { name: categoryForm });
        setCategories([...categories, data]); notify("Categoría creada");
      }
      setCategoryForm(""); setEditing(null);
    } catch { setError("No se pudo guardar la categoría."); }
    finally { setSaving(false); }
  }

  async function remove(type, value) {
    try {
      await api.delete(`/api/${type === "item" ? "items" : "categories"}/${value.id}`);
      if (type === "item") setItems(items.filter(item => item.id !== value.id));
      else setCategories(categories.filter(cat => cat.id !== value.id));
      notify("Elemento eliminado");
    } catch (requestError) { setError(requestError.response?.data?.message || "No se pudo eliminar el elemento."); }
  }

  async function updateInquiry(id, status) {
    setError("");
    try {
      const { data } = await api.patch(`/api/inquiries/${id}/status`, { status });
      setInquiries(inquiries.map(entry => entry.id === id ? data : entry));
      notify("Estado actualizado");
    } catch { setError("No se pudo actualizar la solicitud."); }
  }

  async function removeClosedInquiries() {
    const closedCount = inquiries.filter(entry => entry.status === "CLOSED").length;
    if (!closedCount) return;
    setError("");
    try {
      const { data } = await api.delete("/api/inquiries/closed");
      setInquiries(inquiries.filter(entry => entry.status !== "CLOSED"));
      notify(`${data.deleted} ${data.deleted === 1 ? "solicitud eliminada" : "solicitudes eliminadas"}`);
    } catch { setError("No se pudieron eliminar las solicitudes cerradas."); }
  }

  function editItem(item) { setTab("items"); setEditorOpen(true); setEditing({ type: "item", id: item.id }); setItemForm({ name: item.name || "", description: item.description || "", price: item.price || "", categoryId: item.categoryId || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function editCategory(cat) { setTab("categories"); setEditorOpen(true); setEditing({ type: "category", id: cat.id }); setCategoryForm(cat.name); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function cancel() { setEditing(null); setEditorOpen(false); setItemForm(emptyItem); setCategoryForm(""); }

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = items.filter(item => `${item.name} ${item.description} ${categoryName(item.category)}`.toLowerCase().includes(normalizedQuery));
  const visibleCategories = categories.filter(cat => cat.name.toLowerCase().includes(normalizedQuery));
  function askToRemove(type, value) { setConfirmation({ title: type === "item" ? "Eliminar servicio" : "Eliminar categoría", description: `Se eliminará ${type === "item" ? value.name : `la categoría ${value.name}`}. Esta acción no se puede deshacer.`, confirmLabel: "Eliminar", action: () => remove(type, value) }); }
  function askToRemoveClosed() { const count = inquiries.filter(entry => entry.status === "CLOSED").length; setConfirmation({ title: "Eliminar solicitudes cerradas", description: `Se eliminarán ${count} ${count === 1 ? "solicitud cerrada" : "solicitudes cerradas"}. Esta acción no se puede deshacer.`, confirmLabel: "Eliminar cerradas", action: removeClosedInquiries }); }
  async function confirmAction() { const action = confirmation?.action; setConfirmation(null); await action?.(); }

  return (
    <section className="dashboard-page">
      {message && <div className="toast" role="status"><span>✓</span>{message}</div>}
      <div className="container">
        <div className="dashboard-header"><div><span className="eyebrow eyebrow-dark">Panel de control</span><h1>Gestiona tu catálogo</h1><p>Mantén tus servicios actualizados y listos para tus clientes.</p></div><button className="button button-ghost" onClick={load}>Actualizar</button></div>
        <div className="stats-grid"><div><span>Servicios publicados</span><strong>{items.length}</strong><small>Disponibles en el catálogo</small></div><div><span>Categorías activas</span><strong>{categories.length}</strong><small>Para organizar tu oferta</small></div><div><span>Estado del catálogo</span><strong className="status-text"><i /> En línea</strong><small>Visible para tus clientes</small></div></div>
        <div className="dashboard-grid">
          <aside className={`editor-panel ${editing ? "is-editing" : ""} ${editorOpen || editing ? "is-open" : ""}`}>
            <div className="tabs"><button className={tab === "items" ? "active" : ""} onClick={() => { setTab("items"); cancel(); }}>Servicios</button><button className={tab === "categories" ? "active" : ""} onClick={() => { setTab("categories"); cancel(); }}>Categorías</button></div>
            <button className="mobile-editor-toggle" onClick={() => setEditorOpen(value => !value)}>{editorOpen ? "Cerrar editor" : tab === "items" ? "Nuevo servicio" : "Nueva categoría"}</button>
            {editing && <div className="editing-context"><span>Editando ahora</span><strong>{editing.type === "item" ? itemForm.name : categoryForm}</strong><button onClick={cancel}>Cancelar</button></div>}
            {tab === "items" ? <form onSubmit={saveItem}><div className="panel-title"><span>{editing ? "Editar servicio" : "Nuevo servicio"}</span><small>{editing ? "Actualiza la información" : "Completa todos los campos"}</small></div><label>Nombre<input value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Ej. Diseño de identidad" required /></label><label>Descripción<textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Describe qué incluye el servicio" required /></label><div className="form-row"><label>Precio por hora<input type="number" min="0" step="0.01" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="$ 0.00" required /></label><label>Categoría<select value={itemForm.categoryId} onChange={e => setItemForm({ ...itemForm, categoryId: e.target.value })} required><option value="">Selecciona</option>{categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label></div><button className="button button-primary button-full" disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Publicar servicio"}</button>{editing && <button type="button" className="text-button" onClick={cancel}>Cancelar edición</button>}</form> : <form onSubmit={saveCategory}><div className="panel-title"><span>{editing ? "Editar categoría" : "Nueva categoría"}</span><small>Organiza mejor tus servicios</small></div><label>Nombre<input value={categoryForm} onChange={e => setCategoryForm(e.target.value)} placeholder="Ej. Diseño" required /></label><button className="button button-primary button-full" disabled={saving}>{saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear categoría"}</button>{editing && <button type="button" className="text-button" onClick={cancel}>Cancelar edición</button>}</form>}
          </aside>
          <div className="content-panel">
            <div className="content-heading"><div><h2>{tab === "items" ? "Servicios" : "Categorías"}</h2><p>{tab === "items" ? `${visibleItems.length} de ${items.length}` : `${visibleCategories.length} de ${categories.length}`}</p></div><label className="admin-search"><span aria-hidden="true">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Buscar ${tab === "items" ? "servicios" : "categorías"}`} aria-label={`Buscar ${tab === "items" ? "servicios" : "categorías"}`}/>{query && <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda">×</button>}</label></div>
            {error && <div className="form-error">{error}</div>}
            {loading ? <div className="state-card compact"><span className="spinner" /><p>Cargando información…</p></div> : tab === "items" ? <div className="admin-list">{visibleItems.length ? visibleItems.map(item => <article key={item.id}><div className="list-icon">{(item.name || "S")[0]}</div><div className="list-copy"><span className="category-badge">{categoryName(item.category) || "Sin categoría"}</span><h3>{item.name}</h3><p>{item.description}</p></div><strong>${Number(item.price || 0).toLocaleString("es-MX")}<small>/hora</small></strong><div className="row-actions"><button onClick={() => editItem(item)} aria-label={`Editar ${item.name}`}><ActionIcon type="edit"/></button><button className="danger" onClick={() => askToRemove("item", item)} aria-label={`Eliminar ${item.name}`}><ActionIcon type="delete"/></button></div></article>) : <Empty text={query ? "No hay servicios que coincidan con la búsqueda." : "Aún no hay servicios. Crea el primero desde el formulario."} />}</div> : <div className="category-list">{visibleCategories.length ? visibleCategories.map(cat => <article key={cat.id}><div className="list-icon">{cat.name[0]}</div><div><h3>{cat.name}</h3><p>{cat._count?.services ?? items.filter(item => item.categoryId === cat.id).length} servicios</p></div><div className="row-actions"><button onClick={() => editCategory(cat)} aria-label={`Editar ${cat.name}`}><ActionIcon type="edit"/></button><button className="danger" onClick={() => askToRemove("category", cat)} aria-label={`Eliminar ${cat.name}`}><ActionIcon type="delete"/></button></div></article>) : <Empty text={query ? "No hay categorías que coincidan con la búsqueda." : "Aún no hay categorías. Crea la primera desde el formulario."} />}</div>}
          </div>
        </div>
        <section className="inquiries-panel">
          <div className="inquiries-heading"><div><span className="section-kicker">Contacto</span><h2>Solicitudes recibidas</h2></div><div className="inquiries-summary"><span>{inquiries.filter(entry => entry.status === "NEW").length} nuevas</span>{inquiries.some(entry => entry.status === "CLOSED") && <button className="clear-closed" onClick={askToRemoveClosed}>Eliminar cerradas</button>}</div></div>
          {inquiries.length ? <div className="inquiries-list">{inquiries.map(entry => <article key={entry.id}><div className="inquiry-main"><span className={`inquiry-status status-${entry.status.toLowerCase()}`}>{entry.status === "NEW" ? "Nueva" : entry.status === "CONTACTED" ? "Contactada" : "Cerrada"}</span><h3>{entry.name}</h3><a href={`mailto:${entry.email}`}>{entry.email}</a><p>{entry.message}</p></div><div className="inquiry-meta"><span>{entry.service.name}</span><time dateTime={entry.createdAt}>{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(new Date(entry.createdAt))}</time><select value={entry.status} onChange={event => updateInquiry(entry.id, event.target.value)} aria-label={`Estado de solicitud de ${entry.name}`}><option value="NEW">Nueva</option><option value="CONTACTED">Contactada</option><option value="CLOSED">Cerrada</option></select></div></article>)}</div> : <div className="empty-inquiries"><p>Aún no se han recibido solicitudes.</p></div>}
        </section>
        <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.title || "Confirmar acción"} description={confirmation?.description || ""} confirmLabel={confirmation?.confirmLabel || "Confirmar"} onConfirm={confirmAction} onCancel={() => setConfirmation(null)}/>
      </div>
    </section>
  );
}

function Empty({ text }) { return <div className="state-card compact"><span>＋</span><h3>Empieza a construir tu catálogo</h3><p>{text}</p></div>; }
Empty.propTypes = { text: PropTypes.string.isRequired };
ActionIcon.propTypes = { type: PropTypes.oneOf(["edit", "delete"]).isRequired };
