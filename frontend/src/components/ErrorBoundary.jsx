import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Emotify crashed:", error, info);
  }

  handleReload = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: "#0F0F1A",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Inter', sans-serif", padding: "20px",
        }}>
          <div style={{ textAlign: "center", maxWidth: "320px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>😵</div>
            <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>
              An unexpected error occurred. Try reloading the app.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                padding: "11px 24px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg, #6C63FF, #FF6584)",
                color: "#fff", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              Reload Emotify
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}