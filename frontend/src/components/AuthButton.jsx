export default function AuthButton({ children, onClick, loading, type = "button", variant = "primary" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%", padding: "13px",
        borderRadius: "10px", border: "none",
        background: variant === "primary"
          ? "linear-gradient(135deg, #6C63FF, #FF6584)"
          : "rgba(108,99,255,0.1)",
        color: variant === "primary" ? "#ffffff" : "#6C63FF",
        fontSize: "14px", fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.5px",
        transition: "all 0.2s ease",
        boxShadow: variant === "primary"
          ? "0 4px 20px rgba(108,99,255,0.35)" : "none",
        transform: loading ? "scale(0.98)" : "scale(1)",
      }}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}