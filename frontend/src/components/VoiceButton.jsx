export default function VoiceButton({ isListening, onClick, processing, disabled }) {  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", marginBottom: "10px",
    }}>
      <div style={{
        position: "relative",
        width: "140px", height: "140px",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "absolute",
          width: "140px", height: "140px", borderRadius: "50%",
          border: `1px solid rgba(108,99,255,${isListening ? 0.6 : 0.15})`,
          animation: isListening ? "pulseRing 1.5s ease-out infinite" : "none",
        }}/>
        <div style={{
          position: "absolute",
          width: "110px", height: "110px", borderRadius: "50%",
          border: `1px solid rgba(108,99,255,${isListening ? 0.5 : 0.25})`,
          animation: isListening ? "pulseRing 1.5s ease-out 0.3s infinite" : "none",
        }}/>
        <div style={{
          position: "absolute",
          width: "82px", height: "82px", borderRadius: "50%",
          border: `2px solid rgba(108,99,255,${isListening ? 0.8 : 0.4})`,
        }}/>
        <div
          onClick={disabled ? undefined : onClick}
          style={{
            width: "64px", height: "64px", borderRadius: "50%",
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? "not-allowed" : "pointer",
            background: isListening
              ? "linear-gradient(135deg, #FF6584, #6C63FF)"
              : "linear-gradient(135deg, #6C63FF, #FF6584)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "26px", cursor: "pointer",
            boxShadow: isListening
              ? "0 0 30px rgba(255,101,132,0.6)"
              : "0 0 20px rgba(108,99,255,0.4)",
            transform: isListening ? "scale(1.08)" : "scale(1)",
            transition: "all 0.3s ease", zIndex: 1,
          }}
        >
          {processing ? "⏳" : "🎙️"}
        </div>
      </div>

      {isListening && (
        <div style={{ display: "flex", gap: "4px", alignItems: "center", marginTop: "8px" }}>
          {[1,2,3,4,5,4,3,2,1].map((h, i) => (
            <div key={i} style={{
              width: "3px", borderRadius: "2px",
              background: "linear-gradient(180deg, #6C63FF, #FF6584)",
              height: `${h * 5}px`,
              animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
            }}/>
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes wave {
          0%   { transform: scaleY(1);   }
          100% { transform: scaleY(2.5); }
        }
      `}</style>
    </div>
  );
}