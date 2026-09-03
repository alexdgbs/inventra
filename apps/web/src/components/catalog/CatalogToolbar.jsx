import PropTypes from "prop-types";
import ExpandableSearch from "../ExpandableSearch";

export default function CatalogToolbar({ query, category, categories, onQueryChange, onCategoryChange }) {
  return <div className="catalog-toolbar">
    <ExpandableSearch query={query} onQueryChange={onQueryChange}/>
    <div className="category-options" role="group" aria-label="Filtrar por categoría">
      {["", ...categories].map(name => <button key={name} type="button" aria-pressed={category === name} onClick={() => onCategoryChange(name)}>{name || "Todos"}</button>)}
    </div>
  </div>;

}

CatalogToolbar.propTypes = { query: PropTypes.string.isRequired, category: PropTypes.string.isRequired, categories: PropTypes.arrayOf(PropTypes.string).isRequired, onQueryChange: PropTypes.func.isRequired, onCategoryChange: PropTypes.func.isRequired };
