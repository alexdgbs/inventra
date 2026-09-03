import CatalogState from "../catalog/CatalogState";
import ExpandableSearch from "../ExpandableSearch";
import PropTypes from "prop-types";
import { getCategoryName } from "../../utils/categories";
import { matchesService, normalizeSearch } from "../../utils/search";

function ActionIcon({ type }) {
  return <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{type === "edit" ? <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></> : <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5"/></>}</svg>;
}

function Empty({ text }) {
  return <div className="state-card compact"><span>＋</span><h3>Empieza a construir tu catálogo</h3><p>{text}</p></div>;
}

export default function CatalogContent({ tab, items, categories, query, loading, error, onQueryChange, onEditItem, onEditCategory, onRemove }) {
  const visibleItems = items.filter(item => matchesService(item, query));
  const visibleCategories = categories.filter(category => normalizeSearch(category.name).includes(normalizeSearch(query)));
  const resultCount = tab === "items" ? visibleItems.length : visibleCategories.length;
  const typeLabel = tab === "items" ? "servicios" : "categorías";
  return <div className="content-panel">
    <div className="content-heading"><div className="directory-heading"><h2>{tab === "items" ? "Servicios" : "Categorías"}</h2><span className="directory-count" aria-live="polite">{!loading && !error && `${resultCount} ${resultCount === 1 ? "resultado" : "resultados"}`}</span></div><ExpandableSearch query={query} onQueryChange={onQueryChange} label={`Buscar ${typeLabel}`}/></div>
    {error && <div className="form-error" role="alert">{error}</div>}
    {loading ? <CatalogState type="loading" layout="list"/> : tab === "items" ? <div className="admin-list">{visibleItems.length ? visibleItems.map(item => <article key={item.id}><div className="list-copy"><span className="category-badge">{getCategoryName(item.category)}</span><h3>{item.name}</h3><p>{item.description}</p></div><strong>${Number(item.price).toLocaleString("es-MX")}<small>MXN por hora</small></strong><div className="row-actions"><button onClick={() => onEditItem(item)} aria-label={`Editar ${item.name}`}><ActionIcon type="edit"/></button><button className="danger" onClick={() => onRemove("item", item)} aria-label={`Eliminar ${item.name}`}><ActionIcon type="delete"/></button></div></article>) : <Empty text={query ? "No hay servicios que coincidan con la búsqueda." : "Aún no hay servicios. Crea el primero desde el formulario."}/>}</div> : <div className="category-list">{visibleCategories.length ? visibleCategories.map(category => <article key={category.id}><div><h3>{category.name}</h3><p>{category._count?.services ?? items.filter(item => item.categoryId === category.id).length} servicios</p></div><div className="row-actions"><button onClick={() => onEditCategory(category)} aria-label={`Editar ${category.name}`}><ActionIcon type="edit"/></button><button className="danger" onClick={() => onRemove("category", category)} aria-label={`Eliminar ${category.name}`}><ActionIcon type="delete"/></button></div></article>) : <Empty text={query ? "No hay categorías que coincidan con la búsqueda." : "Aún no hay categorías. Crea la primera desde el formulario."}/>}</div>}
  </div>;
}

ActionIcon.propTypes = { type: PropTypes.oneOf(["edit", "delete"]).isRequired };
Empty.propTypes = { text: PropTypes.string.isRequired };
CatalogContent.propTypes = { tab: PropTypes.oneOf(["items", "categories"]).isRequired, items: PropTypes.arrayOf(PropTypes.object).isRequired, categories: PropTypes.arrayOf(PropTypes.object).isRequired, query: PropTypes.string.isRequired, loading: PropTypes.bool.isRequired, error: PropTypes.string.isRequired, onQueryChange: PropTypes.func.isRequired, onEditItem: PropTypes.func.isRequired, onEditCategory: PropTypes.func.isRequired, onRemove: PropTypes.func.isRequired };
