import PropTypes from "prop-types";
import SearchIcon from "../icons/SearchIcon";

export default function CatalogState({ type, message, onAction, layout = "grid" }) {
  if (type === "loading") return (
    <div role="status" aria-label="Cargando servicios">
      <div className={layout === "list" ? "skeleton-list" : "services-grid"} aria-hidden="true">
        {[0, 1, 2].map(index => <div className="service-card skeleton-card" key={index}>
          <span className="skeleton-line skeleton-category"/>
          <span className="skeleton-line skeleton-title"/>
          <span className="skeleton-line"/>
          <span className="skeleton-line skeleton-description"/>
          <div className="skeleton-footer"><span className="skeleton-line skeleton-price"/><span className="skeleton-line skeleton-button"/></div>
        </div>)}
      </div>
    </div>
  );
  if (type === "error") return <div className="state-card"><span aria-hidden="true">!</span><h3>No pudimos conectar</h3><p>{message}</p><button className="button button-primary" onClick={onAction}>Intentar de nuevo</button></div>;
  return <div className="state-card"><SearchIcon size={26}/><h3>Sin coincidencias</h3><p>Prueba otro término o explora todas las categorías.</p><button className="button button-primary" onClick={onAction}>Limpiar filtros</button></div>;
}

CatalogState.propTypes = { type: PropTypes.oneOf(["loading", "error", "empty"]).isRequired, message: PropTypes.string, onAction: PropTypes.func, layout: PropTypes.oneOf(["grid", "list"]) };
