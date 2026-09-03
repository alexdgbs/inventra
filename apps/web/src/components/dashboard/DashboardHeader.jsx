import PropTypes from "prop-types";

export default function DashboardHeader({ serviceCount, categoryCount, onRefresh }) {
  return <div className="dashboard-header"><div><h1>Catálogo</h1><p>{serviceCount} servicios <span aria-hidden="true">·</span> {categoryCount} categorías</p></div><button className="button button-ghost" onClick={onRefresh}>Actualizar</button></div>;

}

DashboardHeader.propTypes = { serviceCount: PropTypes.number.isRequired, categoryCount: PropTypes.number.isRequired, onRefresh: PropTypes.func.isRequired };
