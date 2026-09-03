import PropTypes from "prop-types";
import { USD_MXN_RATE } from "../../config/pricing";
import { getCategoryName } from "../../utils/categories";

function ServiceCard({ item, onView, currency }) {
  const category = getCategoryName(item.category);
  const sourcePrice = Number(item.price);
  const price = currency === "USD" ? sourcePrice / USD_MXN_RATE : sourcePrice;
  const formattedPrice = new Intl.NumberFormat(currency === "USD" ? "en-US" : "es-MX", { style: "currency", currency, maximumFractionDigits: currency === "USD" ? 2 : 0 }).format(price);
  return (
    <article className="service-card">
      <span className="card-category">{category || "Servicio profesional"}</span>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
      <div className="card-bottom">
        <div className="card-price">
          <small>Desde</small>
          <strong>{formattedPrice}</strong>
          <span>{currency} por hora</span>
        </div>
        <button
          type="button"
          className="card-action"
          onClick={() => onView({ ...item, formattedPrice, currency })}
          aria-label={`Ver detalles de ${item.name}`}
        >
          Ver servicio
        </button>
      </div>
    </article>
  );
}

export default function ServiceGrid({ items, currency, onView }) {
  return <div className="services-grid">{items.map(item => <ServiceCard key={item.id} item={item} currency={currency} onView={onView}/>)}</div>;
}

ServiceGrid.propTypes = { items: PropTypes.arrayOf(PropTypes.object).isRequired, currency: PropTypes.oneOf(["MXN", "USD"]).isRequired, onView: PropTypes.func.isRequired };
ServiceCard.propTypes = { item: PropTypes.object.isRequired, onView: PropTypes.func.isRequired, currency: PropTypes.oneOf(["MXN", "USD"]).isRequired };
