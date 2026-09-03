import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; api.get("/api/auth/me").then(({ data }) => { if (active) setUser(data.user); }).catch(() => {}).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  async function login(credentials) { const { data } = await api.post("/api/auth/login", credentials); setUser(data.user); return data.user; }
  async function logout() { try { await api.post("/api/auth/logout"); } finally { setUser(null); } }
  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider"); return context; }
AuthProvider.propTypes = { children: PropTypes.node.isRequired };
