import PropTypes from "prop-types";
import { normalizeSearch } from "../../utils/search";

function DesignIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>;
}

function CodeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>;
}

function MegaphoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 18-5v12L3 13v-2z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>;
}

function ChartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3v18h18"/><path d="M7 15v-4M12 15V7M17 15v-7"/></svg>;
}

function DefaultIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>;
}

export default function CategoryIcon({ name }) {
  const key = normalizeSearch(name);
  if (key === "diseno") return <DesignIcon />;
  if (key === "desarrollo") return <CodeIcon />;
  if (key === "marketing") return <MegaphoneIcon />;
  if (key === "consultoria") return <ChartIcon />;
  return <DefaultIcon />;
}

CategoryIcon.propTypes = { name: PropTypes.string };
