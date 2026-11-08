import { useEffect, useRef, useState } from "react";
import api from "../api/client";
import ConfirmDialog from "../components/ConfirmDialog";
import CatalogContent from "../components/dashboard/CatalogContent";
import CatalogEditor from "../components/dashboard/CatalogEditor";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import InquiriesPanel from "../components/dashboard/InquiriesPanel";
import { usePreferences } from "../context/PreferencesContext";
import { getApiErrorMessage } from "../utils/apiError";

const emptyItem = { name: "", description: "", price: "", categoryId: "" };

// Mismo orden que la API (por nombre) para que la lista no se reordene al recargar.
const sortCategories = list => [...list].sort((a, b) => a.name.localeCompare(b.name, "es"));

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
  const { currency } = usePreferences();

  async function load() {
    setLoading(true); setError("");
    try {
      const [itemsResult, categoriesResult, inquiriesResult] = await Promise.allSettled([api.get("/api/items"), api.get("/api/categories"), api.get("/api/inquiries")]);
      if (itemsResult.status === "fulfilled") { const data = itemsResult.value.data; setItems(Array.isArray(data) ? data : data?.items ?? []); }
      if (categoriesResult.status === "fulfilled") { const data = categoriesResult.value.data; setCategories(Array.isArray(data) ? data : data?.categories ?? []); }
      if (inquiriesResult.status === "fulfilled") setInquiries(Array.isArray(inquiriesResult.value.data) ? inquiriesResult.value.data : []);
      const failed = [itemsResult, categoriesResult, inquiriesResult].filter(result => result.status === "rejected").length;
      if (failed === 3) setError("No fue posible cargar el panel.");
      else if (failed > 0) setError("No se pudieron cargar algunas secciones del panel.");
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
        // La API ordena por fecha desc: el nuevo va arriba, donde le toca.
        setItems([data, ...items]); notify("Servicio creado");
      }
      setItemForm(emptyItem); setEditing(null); setEditorOpen(false);
    } catch (requestError) { setError(getApiErrorMessage(requestError, "No se pudo guardar el servicio.")); }
    finally { setSaving(false); }
  }

  async function saveCategory(event) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (editing?.type === "category") {
        const { data } = await api.put(`/api/categories/${editing.id}`, { name: categoryForm });
        setCategories(sortCategories(categories.map(category => category.id === editing.id ? data : category)));
        setItems(items.map(item => item.categoryId === editing.id ? { ...item, category: data } : item));
        notify("Categoría actualizada");
      } else {
        const { data } = await api.post("/api/categories", { name: categoryForm });
        // La API ordena por nombre: la nueva entra en su sitio, no al final.
        setCategories(sortCategories([...categories, data])); notify("Categoría creada");
      }
      setCategoryForm(""); setEditing(null); setEditorOpen(false);
    } catch (requestError) { setError(getApiErrorMessage(requestError, "No se pudo guardar la categoría.")); }
    finally { setSaving(false); }
  }

  async function remove(type, value) {
    try {
      await api.delete(`/api/${type === "item" ? "items" : "categories"}/${value.id}`);
      if (type === "item") {
        setItems(items.filter(item => item.id !== value.id));
        // La BD borra en cascada sus solicitudes: se quitan del panel sin recargar.
        setInquiries(inquiries.filter(entry => entry.service?.id !== value.id && entry.serviceId !== value.id));
      }
      else setCategories(categories.filter(category => category.id !== value.id));
      notify("Elemento eliminado");
    } catch (requestError) { setError(getApiErrorMessage(requestError, "No se pudo eliminar el elemento.")); }
  }

  async function updateInquiry(id, status) {
    setError("");
    try {
      const { data } = await api.patch(`/api/inquiries/${id}/status`, { status });
      setInquiries(inquiries.map(entry => entry.id === id ? data : entry));
      notify("Estado actualizado");
    } catch (requestError) { setError(getApiErrorMessage(requestError, "No se pudo actualizar la solicitud.")); }
  }

  async function removeClosedInquiries() {
    if (!inquiries.some(entry => entry.status === "CLOSED")) return;
    setError("");
    try {
      const { data } = await api.delete("/api/inquiries/closed");
      setInquiries(inquiries.filter(entry => entry.status !== "CLOSED"));
      notify(`${data.deleted} ${data.deleted === 1 ? "solicitud eliminada" : "solicitudes eliminadas"}`);
    } catch (requestError) { setError(getApiErrorMessage(requestError, "No se pudieron eliminar las solicitudes cerradas.")); }
  }

  function cancel() { setEditing(null); setEditorOpen(false); setItemForm(emptyItem); setCategoryForm(""); }
  function isDirty() {
    if (editing) return true;
    return itemForm.name !== "" || itemForm.description !== "" || itemForm.price !== "" || itemForm.categoryId !== "" || categoryForm !== "";
  }
  function changeTab(nextTab) {
    if (nextTab === tab) return;
    if (!isDirty()) { setTab(nextTab); return; }
    // Cambiar de pestaña descarta la edición: se avisa antes de perderla.
    setConfirmation({
      title: "Descartar cambios",
      description: "Tienes cambios sin guardar. Si cambias de pestaña, se pierden.",
      confirmLabel: "Descartar",
      action: () => { setTab(nextTab); cancel(); },
    });
  }
  function editItem(item) {
    setError("");
    setTab("items");
    setEditorOpen(true);
    setEditing({ type: "item", id: item.id });
    setItemForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      categoryId: item.categoryId || "",
    });
  }

  function editCategory(category) {
    setError("");
    setTab("categories");
    setEditorOpen(true);
    setEditing({ type: "category", id: category.id });
    setCategoryForm(category.name);
  }

  function askToRemove(type, value) {
    const isItem = type === "item";
    setConfirmation({
      title: isItem ? "Eliminar servicio" : "Eliminar categoría",
      description: isItem
        ? `Se eliminará ${value.name} y también las solicitudes asociadas a este servicio. Esta acción no se puede deshacer.`
        : `Se eliminará la categoría ${value.name}. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      action: () => remove(type, value),
    });
  }

  function askToRemoveClosed() {
    const count = inquiries.filter(entry => entry.status === "CLOSED").length;
    const one = count === 1;
    setConfirmation({
      title: "Eliminar solicitudes cerradas",
      description: `${one ? "Se eliminará" : "Se eliminarán"} ${count} ${one ? "solicitud cerrada" : "solicitudes cerradas"}. Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar cerradas",
      action: removeClosedInquiries,
    });
  }

  async function confirmAction() {
    const action = confirmation?.action;
    setConfirmation(null);
    await action?.();
  }

  return <section className="dashboard-page">
    <div className={`toast${message ? " is-visible" : ""}`} role="status" aria-atomic="true">{message}</div>
    <div className="container">
      <DashboardHeader serviceCount={items.length} categoryCount={categories.length} onRefresh={load}/>
      <div className="catalog-controls"><div className="tabs" role="group" aria-label="Tipo de contenido"><button aria-pressed={tab === "items"} className={tab === "items" ? "active" : ""} onClick={() => changeTab("items")}>Servicios</button><button aria-pressed={tab === "categories"} className={tab === "categories" ? "active" : ""} onClick={() => changeTab("categories")}>Categorías</button></div><button className="button button-primary" onClick={() => { setError(""); setEditorOpen(true); }}>{tab === "items" ? "Nuevo servicio" : "Nueva categoría"}</button></div>
      <div className="dashboard-grid">
        {editorOpen && <CatalogEditor tab={tab} editing={editing} itemForm={itemForm} categoryForm={categoryForm} categories={categories} saving={saving} error={error} onItemChange={setItemForm} onCategoryChange={setCategoryForm} onSaveItem={saveItem} onSaveCategory={saveCategory} onCancel={cancel}/>}
        <CatalogContent tab={tab} items={items} categories={categories} query={query} loading={loading} error={editorOpen ? "" : error} currency={currency} onQueryChange={setQuery} onEditItem={editItem} onEditCategory={editCategory} onRemove={askToRemove}/>
      </div>
      <InquiriesPanel inquiries={inquiries} onStatusChange={updateInquiry} onRemoveClosed={askToRemoveClosed}/>
      <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.title || "Confirmar acción"} description={confirmation?.description || ""} confirmLabel={confirmation?.confirmLabel || "Confirmar"} onConfirm={confirmAction} onCancel={() => setConfirmation(null)}/>
    </div>
  </section>;
}
