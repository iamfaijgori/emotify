export default function AuthLayout({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0F0F1A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "fixed", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)",
        borderRadius: "50%", top: "-100px", left: "-100px", pointerEvents: "none",
      }}/>
      <div style={{
        position: "fixed", width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(255,101,132,0.08) 0%, transparent 70%)",
        borderRadius: "50%", bottom: "0px", right: "-80px", pointerEvents: "none",
      }}/>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: "400px",
        background: "rgba(26,26,46,0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(108,99,255,0.25)",
        borderRadius: "20px",
        padding: "36px 32px",
        boxShadow: "0 8px 40px rgba(108,99,255,0.15)",
        position: "relative", zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "linear-gradient(135deg, #6C63FF, #FF6584)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px", margin: "0 auto 10px",
            boxShadow: "0 0 20px rgba(108,99,255,0.4)",
          }}>♪</div>
          <span style={{ color: "#6C63FF", fontWeight: 700,
            fontSize: "20px", letterSpacing: "2px" }}>
            emotify
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}