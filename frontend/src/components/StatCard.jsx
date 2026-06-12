export default function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      flex: 1,
      background: "rgba(26,26,46,0.8)",
      border: "1px solid rgba(108,99,255,0.15)",
      borderRadius: "14px",
      padding: "16px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "22px", marginBottom: "6px" }}>{icon}</div>
      <p style={{ color, fontSize: "20px", fontWeight: 700, marginBottom: "2px" }}>
        {value}
      </p>
      <p style={{ color: "#888", fontSize: "11px" }}>{label}</p>
    </div>
  );
}