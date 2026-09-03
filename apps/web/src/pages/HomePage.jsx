import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import CatalogState from "../components/catalog/CatalogState";
import CatalogToolbar from "../components/catalog/CatalogToolbar";
import ServiceDetailsModal from "../components/catalog/ServiceDetailsModal";
import ServiceGrid from "../components/catalog/ServiceGrid";
import { USD_MXN_RATE } from "../config/pricing";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import { getCategoryName } from "../utils/categories";
import { matchesService } from "../utils/search";

export default function HomePage() {
  const { currency } = usePreferences();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState(null);

  async function loadItems() {
    setLoading(true); setError("");
    try { const { data } = await api.get("/api/items"); setItems(Array.isArray(data) ? data : []); }
    catch { setError("No pudimos cargar los servicios. Revisa tu conexión e inténtalo de nuevo."); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadItems(); }, []);
  const categories = useMemo(() => [...new Set(items.map(item => getCategoryName(item.category)).filter(Boolean))], [items]);
  const filtered = useMemo(() => items.filter(item => {
    return (!category || getCategoryName(item.category) === category) && matchesService(item, query);
  }), [items, category, query]);

  function clearFilters() { setQuery(""); setCategory(""); }

  return <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero-panel">
          <div className="hero-copy">
            <h1 id="hero-title">Encuentra a quien sabe hacerlo.</h1>
            <p>Explora los servicios y cuéntanos qué necesitas.</p>
          </div>
        </div>
      </div>
    </section>
    <section className="catalog-section" id="catalogo"><div className="container">
      <div className="directory-heading"><h2>Servicios</h2><span className="directory-count" aria-live="polite">{!loading && !error && `${filtered.length} ${filtered.length === 1 ? "resultado" : "resultados"}`}</span></div>
      <CatalogToolbar query={query} category={category} categories={categories} onQueryChange={setQuery} onCategoryChange={setCategory}/>
      {currency === "USD" && <p className="currency-note">Conversión estimada con una tasa configurable de {USD_MXN_RATE} MXN por USD.</p>}
      {loading ? <CatalogState type="loading"/> : error ? <CatalogState type="error" message={error} onAction={loadItems}/> : filtered.length ? <ServiceGrid items={filtered} currency={currency} onView={setSelected}/> : <CatalogState type="empty" onAction={clearFilters}/>}
    </div></section>
    {selected && <ServiceDetailsModal service={selected} isAdmin={user?.role === "admin"} onClose={() => setSelected(null)}/>}
  </>;
}
