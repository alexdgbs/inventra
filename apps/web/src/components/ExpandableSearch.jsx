import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import SearchIcon from "./icons/SearchIcon";
import useModalScrollLock from "../hooks/useModalScrollLock";

export default function ExpandableSearch({ query, onQueryChange, label = "Buscar servicios" }) {
  const [expanded, setExpanded] = useState(Boolean(query));
  const [editing, setEditing] = useState(false);
  useModalScrollLock(editing && window.matchMedia("(max-width: 640px)").matches);
  const inputRef = useRef(null);
  const inputId = useId();
  useEffect(() => { if (expanded) inputRef.current?.focus(); }, [expanded]);
  return (
    <div className={`catalog-search ${expanded || query ? "is-expanded" : ""}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && !query) setExpanded(false); }}>
      <button className="search-trigger" type="button" aria-label={label} aria-expanded={expanded || Boolean(query)} aria-controls={inputId} onClick={() => { setExpanded(true); inputRef.current?.focus(); }}><SearchIcon size={19}/></button>
      <input id={inputId} ref={inputRef} maxLength={200} enterKeyHint="search" onFocus={() => setEditing(true)} onBlur={() => setEditing(false)} tabIndex={expanded || query ? 0 : -1} value={query} onChange={event => onQueryChange(event.target.value)} placeholder={label} aria-label={label} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") { onQueryChange(""); setExpanded(false); event.currentTarget.previousElementSibling.focus(); } }}/>
      {query && <button className="search-clear" type="button" onClick={() => { onQueryChange(""); inputRef.current?.focus(); }} aria-label="Limpiar búsqueda">Limpiar</button>}
    </div>

  );
}
ExpandableSearch.propTypes = { query: PropTypes.string.isRequired, onQueryChange: PropTypes.func.isRequired, label: PropTypes.string };
