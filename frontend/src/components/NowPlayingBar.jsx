import { useRef } from "react";
import HeartButton from "./HeartButton";

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function NowPlayingBar({
  song, isPlaying, progress, currentTime, duration,
  onPlayPause, onNext, onPrev, onSeek, onExpand,
}) {
  const barRef = useRef(null);

  if (!song) return null;

  const handleSeek = (e) => {
    if (!onSeek || !duration) return;
    const rect = barRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(pct * duration);
  };

  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%",
      transform: "translateX(-50%)",
      width: "100%", maxWidth: "430px",
      background: "rgba(22,22,46,0.95)",
      backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(108,99,255,0.3)",
      padding: "10px 16px 16px",
      zIndex: 20,
    }}>
      {/* Seek bar */}
      <div
        ref={barRef}
        onClick={handleSeek}
        style={{
          width: "100%", height: "6px", padding: "6px 0",
          marginBottom: "4px", cursor: onSeek ? "pointer" : "default",
          display: "flex", alignItems: "center",
        }}
      >
        <div style={{
          width: "100%", height: "3px",
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
              position: "absolute", right: "-5px", top: "-3.5px",
              width: "10px", height: "10px", borderRadius: "50%",
              background: "#ffffff",
              boxShadow: "0 0 6px rgba(108,99,255,0.6)",
            }}/>
          </div>
        </div>
      </div>

      {/* Time labels */}
      {duration > 0 && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          marginBottom: "6px", marginTop: "-2px",
        }}>
          <span style={{ color: "#666", fontSize: "10px" }}>{formatTime(currentTime)}</span>
          <span style={{ color: "#666", fontSize: "10px" }}>{formatTime(duration)}</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Thumbnail + info — click to expand */}
        <div
          onClick={onExpand}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            flex: 1, minWidth: 0, cursor: onExpand ? "pointer" : "default",
          }}
        >
          <div style={{
            width: "44px", height: "44px", borderRadius: "8px",
            backgroundImage: `url(${song.thumbnail})`,
            backgroundSize: "cover", backgroundPosition: "center",
            flexShrink: 0,
            animation: isPlaying ? "spin 4s linear infinite" : "none",
            border: "1px solid rgba(108,99,255,0.3)",
          }}/>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: "#ffffff", fontSize: "13px", fontWeight: 600,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {song.title}
            </p>
            <p style={{ color: "#888", fontSize: "11px",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {song.artist}
            </p>
          </div>
        </div>

        <HeartButton song={song} size={18} />

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button onClick={onPrev} style={{
            background: "none", border: "none", color: "#888",
            fontSize: "18px", cursor: "pointer", padding: "0",
          }}>⏮</button>

          <button onClick={onPlayPause} style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: "linear-gradient(135deg, #6C63FF, #FF6584)",
            border: "none", color: "white", fontSize: "16px",
            cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(108,99,255,0.5)",
          }}>
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button onClick={onNext} style={{
            background: "none", border: "none", color: "#888",
            fontSize: "18px", cursor: "pointer", padding: "0",
          }}>⏭</button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}