export function SongSkeleton({ count = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "10px 12px", borderRadius: "10px",
          background: "rgba(26,26,46,0.8)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div className="shimmer" style={{
            width: "40px", height: "40px", borderRadius: "8px", flexShrink: 0,
          }}/>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="shimmer" style={{ width: "70%", height: "12px", borderRadius: "4px" }}/>
            <div className="shimmer" style={{ width: "40%", height: "10px", borderRadius: "4px" }}/>
          </div>
        </div>
      ))}
      <style>{`
        .shimmer {
          background: linear-gradient(90deg,
            rgba(108,99,255,0.08) 25%,
            rgba(108,99,255,0.18) 50%,
            rgba(108,99,255,0.08) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ textAlign: "center" }}>
        <div className="shimmer" style={{
          width: "84px", height: "84px", borderRadius: "50%",
          margin: "0 auto 12px",
        }}/>
        <div className="shimmer" style={{ width: "120px", height: "16px",
          borderRadius: "4px", margin: "0 auto 6px" }}/>
        <div className="shimmer" style={{ width: "160px", height: "12px",
          borderRadius: "4px", margin: "0 auto" }}/>
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <div className="shimmer" style={{ flex: 1, height: "80px", borderRadius: "14px" }}/>
        <div className="shimmer" style={{ flex: 1, height: "80px", borderRadius: "14px" }}/>
      </div>
      <style>{`
        .shimmer {
          background: linear-gradient(90deg,
            rgba(108,99,255,0.08) 25%,
            rgba(108,99,255,0.18) 50%,
            rgba(108,99,255,0.08) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}