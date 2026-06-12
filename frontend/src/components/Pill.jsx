export default function Pill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px", borderRadius: "20px",
        border: `1px solid ${active ? "#6C63FF" : "rgba(108,99,255,0.3)"}`,
        background: active ? "rgba(108,99,255,0.25)" : "rgba(108,99,255,0.08)",
        color: active ? "#6C63FF" : "#aaa",
        fontSize: "12px", cursor: onClick ? "pointer" : "default",
        fontFamily: "Inter, sans-serif",
        fontWeight: active ? 600 : 400,
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}