import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { applyThemeToDocument, isValidTheme, resolveTheme, THEME_STORAGE_KEY } from "../utils/theme";

const PreferencesContext = createContext(null);

function initialTheme() {
  const applied = document.documentElement.dataset.theme;
  if (isValidTheme(applied)) return applied;
  return resolveTheme(localStorage.getItem(THEME_STORAGE_KEY));
}

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme);
  const [currency, setCurrency] = useState(() => localStorage.getItem("inventra-currency") === "USD" ? "USD" : "MXN");

  useEffect(() => {
    applyThemeToDocument(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
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
