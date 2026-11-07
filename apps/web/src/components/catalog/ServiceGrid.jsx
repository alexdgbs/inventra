import PropTypes from "prop-types";
import CategoryIcon from "../icons/CategoryIcon";
import { categoryLabel, getCategoryName } from "../../utils/categories";
import { formatPrice } from "../../utils/pricing";

function ServiceCard({ item, onView, currency }) {
  const category = getCategoryName(item.category);
  const formattedPrice = formatPrice(item.price, currency);
  return (
    <article className="service-card">
      <div className="card-visual" aria-hidden="true"><CategoryIcon name={category} /></div>
      <span className="card-category">{categoryLabel(category)}</span>
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
