import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const user = await login(form);
      navigate(location.state?.from?.pathname || (user.role === "admin" ? "/dashboard" : "/"), { replace: true });
    } catch (requestError) { setError(requestError.response?.data?.message || "No pudimos iniciar sesión. Verifica tus credenciales."); }
    finally { setLoading(false); }
  }

  return <section className="login-page">
    <div className="login-shell">
      <aside className="login-intro">
        <span className="login-eyebrow">Inventra Admin</span>
        <div><h2>Tu catálogo,<br/>bajo control.</h2><p>Administra servicios, categorías y solicitudes desde un solo lugar.</p></div>
        <ul><li>Gestiona tu oferta</li><li>Revisa nuevos contactos</li><li>Mantén todo actualizado</li></ul>
        <Link className="login-back" to="/">Volver al catálogo</Link>
      </aside>
      <form className="login-form" onSubmit={submit}>
        <header><span className="login-context">Acceso seguro</span><h1>Iniciar sesión</h1><p>Ingresa con tu cuenta de administrador.</p></header>
        <div className="login-field"><label htmlFor="username">Usuario</label><input id="username" autoComplete="username" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} placeholder="Nombre de usuario" required autoFocus/></div>
        <div className="login-field"><label htmlFor="password">Contraseña</label><input id="password" autoComplete="current-password" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Tu contraseña" required/></div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button button-primary button-full" disabled={loading}>{loading ? "Verificando..." : "Continuar"}</button>
        <p className="login-security"><span/> Sesión protegida durante 8 horas</p>
      </form>
    </div>
  </section>;
}
