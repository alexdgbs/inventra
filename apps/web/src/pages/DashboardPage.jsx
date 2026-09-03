import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import CatalogContent from "../components/dashboard/CatalogContent";
import CatalogEditor from "../components/dashboard/CatalogEditor";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import InquiriesPanel from "../components/dashboard/InquiriesPanel";

const emptyItem = { name: "", description: "", price: "", categoryId: "" };

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
  const notificationTimer = useRef(null);
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
  useEffect(() => () => window.clearTimeout(notificationTimer.current), []);
  function notify(text) {
    window.clearTimeout(notificationTimer.current);
    setMessage(text);
    notificationTimer.current = window.setTimeout(() => setMessage(""), 3500);
  }

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
      setItemForm(emptyItem); setEditing(null); setEditorOpen(false);
    } catch { setError("No se pudo guardar el servicio."); }
    finally { setSaving(false); }
  }

  async function saveCategory(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (editing?.type === "category") {
        const { data } = await api.put(`/api/categories/${editing.id}`, { name: categoryForm });
        setCategories(categories.map(category => category.id === editing.id ? data : category));
        setItems(items.map(item => item.categoryId === editing.id ? { ...item, category: data } : item));
        notify("Categoría actualizada");
      } else {
        const { data } = await api.post("/api/categories", { name: categoryForm });
        setCategories([...categories, data]); notify("Categoría creada");
      }
      setCategoryForm(""); setEditing(null); setEditorOpen(false);
    } catch { setError("No se pudo guardar la categoría."); }
    finally { setSaving(false); }
  }

  async function remove(type, value) {
    try {
      await api.delete(`/api/${type === "item" ? "items" : "categories"}/${value.id}`);
      if (type === "item") setItems(items.filter(item => item.id !== value.id));
      else setCategories(categories.filter(category => category.id !== value.id));
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
    if (!inquiries.some(entry => entry.status === "CLOSED")) return;
    setError("");
    try {
      const { data } = await api.delete("/api/inquiries/closed");
      setInquiries(inquiries.filter(entry => entry.status !== "CLOSED"));
      notify(`${data.deleted} ${data.deleted === 1 ? "solicitud eliminada" : "solicitudes eliminadas"}`);
    } catch { setError("No se pudieron eliminar las solicitudes cerradas."); }
  }

  function cancel() { setEditing(null); setEditorOpen(false); setItemForm(emptyItem); setCategoryForm(""); }
  function changeTab(nextTab) { setTab(nextTab); cancel(); }
  function editItem(item) { setError(""); setTab("items"); setEditorOpen(true); setEditing({ type: "item", id: item.id }); setItemForm({ name: item.name || "", description: item.description || "", price: item.price ?? "", categoryId: item.categoryId || "" }); }
  function editCategory(category) { setError(""); setTab("categories"); setEditorOpen(true); setEditing({ type: "category", id: category.id }); setCategoryForm(category.name); }
  function askToRemove(type, value) { setConfirmation({ title: type === "item" ? "Eliminar servicio" : "Eliminar categoría", description: `Se eliminará ${type === "item" ? value.name : `la categoría ${value.name}`}. Esta acción no se puede deshacer.`, confirmLabel: "Eliminar", action: () => remove(type, value) }); }
  function askToRemoveClosed() { const count = inquiries.filter(entry => entry.status === "CLOSED").length; setConfirmation({ title: "Eliminar solicitudes cerradas", description: `${count === 1 ? "Se eliminará" : "Se eliminarán"} ${count} ${count === 1 ? "solicitud cerrada" : "solicitudes cerradas"}. Esta acción no se puede deshacer.`, confirmLabel: "Eliminar cerradas", action: removeClosedInquiries }); }
  async function confirmAction() { const action = confirmation?.action; setConfirmation(null); await action?.(); }

  return <section className="dashboard-page">
    <div className={`toast${message ? " is-visible" : ""}`} role="status" aria-atomic="true">{message}</div>
    <div className="container">
      <DashboardHeader serviceCount={items.length} categoryCount={categories.length} onRefresh={load}/>
      <div className="catalog-controls"><div className="tabs" role="group" aria-label="Tipo de contenido"><button aria-pressed={tab === "items"} className={tab === "items" ? "active" : ""} onClick={() => changeTab("items")}>Servicios</button><button aria-pressed={tab === "categories"} className={tab === "categories" ? "active" : ""} onClick={() => changeTab("categories")}>Categorías</button></div><button className="button button-primary" onClick={() => { setError(""); setEditorOpen(true); }}>{tab === "items" ? "Nuevo servicio" : "Nueva categoría"}</button></div>
      <div className="dashboard-grid">
        {editorOpen && <CatalogEditor tab={tab} editing={editing} itemForm={itemForm} categoryForm={categoryForm} categories={categories} saving={saving} error={error} onItemChange={setItemForm} onCategoryChange={setCategoryForm} onSaveItem={saveItem} onSaveCategory={saveCategory} onCancel={cancel}/>}
        <CatalogContent tab={tab} items={items} categories={categories} query={query} loading={loading} error={error} onQueryChange={setQuery} onEditItem={editItem} onEditCategory={editCategory} onRemove={askToRemove}/>
      </div>
      <InquiriesPanel inquiries={inquiries} onStatusChange={updateInquiry} onRemoveClosed={askToRemoveClosed}/>
      <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.title || "Confirmar acción"} description={confirmation?.description || ""} confirmLabel={confirmation?.confirmLabel || "Confirmar"} onConfirm={confirmAction} onCancel={() => setConfirmation(null)}/>
    </div>
  </section>;
}
