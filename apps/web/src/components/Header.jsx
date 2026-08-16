import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { usePreferences } from "../context/PreferencesContext";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";

function ThemeIcon({ dark }) {
  return dark
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 15.3A8.5 8.5 0 0 1 8.7 3.6 8.5 8.5 0 1 0 20.4 15.3Z"/></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout: endSession } = useAuth();
  const { theme, toggleTheme, currency, setCurrency } = usePreferences();
  const linkClass = ({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`;
  async function logout() { await endSession(); setOpen(false); navigate("/login"); }

  return <header className="site-header"><div className="container header-inner">
    <Link to="/" className="brand wordmark" aria-label="Inventra, ir al inicio">Inventra</Link>
    <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-navigation">{open ? "Cerrar" : "Menú"}</button>
    <nav id="mobile-navigation" className={`main-nav ${open ? "is-open" : ""}`} aria-label="Navegación principal">
      <a href="/#catalogo" className="nav-link" onClick={() => setOpen(false)}>Servicios</a>
      {user?.role === "admin" && <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>Administrar</NavLink>}
      <div className="preferences" aria-label="Preferencias de visualización">
        <div className="currency-switch" role="group" aria-label="Moneda">{["MXN", "USD"].map(option => <button key={option} className={currency === option ? "active" : ""} onClick={() => setCurrency(option)} aria-pressed={currency === option}>{option}</button>)}</div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label={`Activar modo ${theme === "dark" ? "claro" : "oscuro"}`} title={`Modo ${theme === "dark" ? "claro" : "oscuro"}`}><ThemeIcon dark={theme === "dark"}/></button>
      </div>
      {user ? <button className="session-link" onClick={logout}>Cerrar sesión</button> : <Link to="/login" className="session-link" onClick={() => setOpen(false)}>Iniciar sesión</Link>}
    </nav>
  </div></header>;
}

ThemeIcon.propTypes = { dark: PropTypes.bool.isRequired };
