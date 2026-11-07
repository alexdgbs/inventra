import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../utils/apiError";
import { FORM_LIMITS } from "../utils/formLimits";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const user = await login(form);
      navigate(location.state?.from?.pathname || (user.role === "admin" ? "/dashboard" : "/"), { replace: true });
    } catch (requestError) { setError(getApiErrorMessage(requestError, "No pudimos iniciar sesión. Verifica tus credenciales.")); }
    finally { setLoading(false); }
  }

  return <section className="login-page">
    <div className="login-shell">
      <form className="login-form" onSubmit={submit}>
        <header><h1>Iniciar sesión</h1><p>Accede para administrar tus servicios.</p></header>
        <div className="login-field"><label htmlFor="username">Usuario</label><input id="username" minLength={FORM_LIMITS.login.username.min} maxLength={FORM_LIMITS.login.username.max} autoComplete="username" value={form.username} onChange={event => setForm({ ...form, username: event.target.value })} placeholder="Nombre de usuario" required/></div>
        <div className="login-field">
          <label htmlFor="password">Contraseña</label>
          <div className="password-field">
            <input id="password" minLength={FORM_LIMITS.login.password.min} maxLength={FORM_LIMITS.login.password.max} autoComplete="current-password" type={showPassword ? "text" : "password"} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Tu contraseña" required/>
            <button type="button" className="password-toggle" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-controls="password" onClick={() => setShowPassword(value => !value)}>{showPassword ? "Ocultar" : "Mostrar"}</button>
          </div>
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <button className="button button-primary button-full" disabled={loading}>{loading ? "Verificando..." : "Continuar"}</button>
        <Link className="login-return" to="/">Volver a servicios</Link>
      </form>
    </div>
  </section>;
}
