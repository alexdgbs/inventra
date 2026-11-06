import { Component } from "react";
import PropTypes from "prop-types";

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error, info) { if (import.meta.env.DEV) console.error("UI error", error, info); }
  render() {
    if (this.state.failed) return <div className="not-found"><div><span>Error</span><h1>Algo salió mal.</h1><p>La aplicación encontró un problema inesperado.</p><button className="button button-primary" onClick={() => window.location.assign("/")}>Volver al inicio</button></div></div>;
    return this.props.children;
  }
}

ErrorBoundary.propTypes = { children: PropTypes.node.isRequired };
