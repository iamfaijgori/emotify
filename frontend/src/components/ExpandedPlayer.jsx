import { useRef } from "react";
import HeartButton from "./HeartButton";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ExpandedPlayer({
  song, isPlaying, progress, currentTime, duration,
  onPlayPause, onNext, onPrev, onSeek, onClose,
}) {
  const barRef = useRef(null);

  const handleSeek = (e) => {
    if (!onSeek || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(pct * duration);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "#0F0F1A",
      display: "flex", justifyContent: "center",
      animation: "slideUp 0.3s ease-out",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "fixed", width: "350px", height: "350px",
        background: "radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)",
        borderRadius: "50%", top: "-100px", left: "-100px", pointerEvents: "none",
      }}/>
      <div style={{
        position: "fixed", width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(255,101,132,0.12) 0%, transparent 70%)",
        borderRadius: "50%", bottom: "-80px", right: "-80px", pointerEvents: "none",
      }}/>

      <div className="expanded-content" style={{
        width: "100%", maxWidth: "900px",
        display: "flex", flexDirection: "column",
        padding: "20px", position: "relative",
        height: "100%", boxSizing: "border-box",
      }}>

        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "10px", flexShrink: 0 }}>
          <button onClick={onClose} style={{
            background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.3)",
            color: "#6C63FF", width: "36px", height: "36px",
            borderRadius: "50%", fontSize: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            ⌄
          </button>
          <span style={{ color: "#888", fontSize: "12px", fontWeight: 600, letterSpacing: "1px" }}>
            NOW PLAYING
          </span>
          <HeartButton song={song} size={20} />
        </div>

        {/* Main content - row on wide screens, column on narrow */}
        <div className="expanded-main" style={{
          flex: 1, display: "flex",
          alignItems: "center", justifyContent: "center", gap: "40px",
          flexDirection: "column",
        }}>

          {/* Thumbnail */}
          <div style={{
            width: "min(280px, 80vw)", height: "min(280px, 80vw)",
            borderRadius: "20px",
            backgroundImage: `url(${song.thumbnail})`,
            backgroundSize: "cover", backgroundPosition: "center",
            boxShadow: "0 10px 60px rgba(108,99,255,0.35)",
            border: "1px solid rgba(108,99,255,0.2)",
            animation: isPlaying ? "spin 12s linear infinite" : "none",
            flexShrink: 0,
          }}/>

          {/* Info + controls */}
          <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
            <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>
              {song.title}
            </h2>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "28px" }}>
              {song.artist}
            </p>

            {/* Seek bar */}
            <div
              ref={barRef}
              onClick={handleSeek}
              style={{
                width: "100%", padding: "8px 0",
                cursor: onSeek ? "pointer" : "default",
              }}
            >
              <div style={{
                width: "100%", height: "4px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "2px", position: "relative",
              }}>
                <div style={{
                  width: `${progress}%`, height: "100%",
                  background: "linear-gradient(90deg, #6C63FF, #FF6584)",
                  borderRadius: "2px", transition: "width 0.5s linear",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", right: "-6px", top: "-4px",
                    width: "12px", height: "12px", borderRadius: "50%",
                    background: "#ffffff",
                    boxShadow: "0 0 8px rgba(108,99,255,0.6)",
                  }}/>
                </div>
              </div>
            </div>

            {/* Time labels */}
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginTop: "8px", marginBottom: "28px",
            }}>
              <span style={{ color: "#666", fontSize: "12px" }}>{formatTime(currentTime)}</span>
              <span style={{ color: "#666", fontSize: "12px" }}>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center",
              justifyContent: "center", gap: "32px" }}>
              <button onClick={onPrev} style={{
                background: "none", border: "none", color: "#aaa",
                fontSize: "28px", cursor: "pointer", padding: "0",
              }}>⏮</button>

              <button onClick={onPlayPause} style={{
                width: "64px", height: "64px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6C63FF, #FF6584)",
                border: "none", color: "white", fontSize: "24px",
                cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 30px rgba(108,99,255,0.5)",
              }}>
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button onClick={onNext} style={{
                background: "none", border: "none", color: "#aaa",
                fontSize: "28px", cursor: "pointer", padding: "0",
              }}>⏭</button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @media (min-width: 700px) {
          .expanded-main {
            flex-direction: row !important;
            align-items: center !important;
            text-align: left !important;
          }
          .expanded-main h2, .expanded-main p {
            text-align: left !important;
          }
        }
      `}</style>
    </div>
  );
}