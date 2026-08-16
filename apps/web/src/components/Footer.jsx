import { Link } from "react-router-dom";

export default function Footer() {
  return <footer className="site-footer compact-footer"><div className="container footer-base"><Link to="/" className="brand footer-brand">Inventra</Link><p>Catálogo de servicios profesionales.</p><nav aria-label="Navegación del pie"><a href="/#catalogo">Servicios</a><Link to="/login">Iniciar sesión</Link></nav><p>© {new Date().getFullYear()}</p></div></footer>;
}
