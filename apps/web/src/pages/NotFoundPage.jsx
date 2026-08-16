import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return <section className="not-found"><div><span>404</span><h1>Esta página no existe.</h1><p>La dirección puede ser incorrecta o el contenido cambió de lugar.</p><Link to="/" className="button button-primary">Volver al inicio</Link></div></section>;
}
