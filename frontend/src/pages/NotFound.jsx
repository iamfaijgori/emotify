import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0F0F1A",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", padding: "20px",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "12px" }}>🎵</div>
        <h1 style={{ color: "#6C63FF", fontSize: "32px", fontWeight: 700, marginBottom: "4px" }}>
          404
        </h1>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px" }}>
          This page hit a wrong note.
        </p>
        <Link to="/" style={{
          padding: "11px 24px", borderRadius: "10px",
          background: "linear-gradient(135deg, #6C63FF, #FF6584)",
          color: "#fff", fontSize: "13px", fontWeight: 600,
          textDecoration: "none", display: "inline-block",
        }}>
          Back to Emotify
        </Link>
      </div>
    </div>
  );
}