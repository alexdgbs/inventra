import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const PreferencesContext = createContext(null);

function initialTheme() {
  const applied = document.documentElement.dataset.theme;
  if (applied === "light" || applied === "dark") return applied;
  const saved = localStorage.getItem("inventra-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);
  const [currency, setCurrency] = useState(() => localStorage.getItem("inventra-currency") === "USD" ? "USD" : "MXN");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.backgroundColor = theme === "dark" ? "#111113" : "#ffffff";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#111113" : "#ffffff");
    localStorage.setItem("inventra-theme", theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem("inventra-currency", currency); }, [currency]);

  const value = useMemo(() => ({ theme, currency, toggleTheme: () => setTheme(value => value === "dark" ? "light" : "dark"), setCurrency }), [theme, currency]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("usePreferences debe utilizarse dentro de PreferencesProvider");
  return value;
}

PreferencesProvider.propTypes = { children: PropTypes.node.isRequired };
