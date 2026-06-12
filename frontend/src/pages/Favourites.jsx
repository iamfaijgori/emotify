import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import usePlayerStore from "../store/playerStore";
import HeartButton, { useFavouritesCache } from "../components/HeartButton";
import NowPlayingBar from "../components/NowPlayingBar";

export default function Favourites() {
  const navigate = useNavigate();
  const favourites = useFavouritesCache();

  const {
    currentSong, currentIndex, isPlaying,
    setQueue, playSong, nextSong, prevSong, togglePlay,
  } = usePlayerStore();

  const handlePlayAll = () => {
    if (favourites.length === 0) {
      toast.error("No favourites yet");
      return;
    }
    setQueue(favourites);
    playSong(favourites[0], 0);
  };

  const handleSongClick = (song, index) => {
    setQueue(favourites);
    playSong(song, index);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0F0F1A",
      fontFamily: "'Inter', sans-serif",
      display: "flex", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{
        position: "fixed", width: "300px", height: "300px",
        background: "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)",
        borderRadius: "50%", top: "-50px", left: "-80px", pointerEvents: "none",
      }}/>
      <div style={{
        position: "fixed", width: "250px", height: "250px",
        background: "radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 70%)",
        borderRadius: "50%", bottom: "100px", right: "-60px", pointerEvents: "none",
      }}/>

      <div style={{
        width: "100%", maxWidth: "430px",
        minHeight: "100vh", display: "flex", flexDirection: "column",
        position: "relative",
      }}>

        {/* Navbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          background: "rgba(26,26,46,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(108,99,255,0.2)",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div
            onClick={() => navigate("/")}
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <span style={{ color: "#6C63FF", fontSize: "18px" }}>←</span>
            <span style={{ color: "#6C63FF", fontWeight: 700, fontSize: "16px", letterSpacing: "1px" }}>
              Favourites
            </span>
          </div>
          <span style={{ color: "#FF6584", fontSize: "18px" }}>❤️</span>
        </div>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto", paddingBottom: currentSong ? "140px" : "40px" }}>

          <div style={{ marginBottom: "20px" }}>
            <h1 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
              Your Favourites
            </h1>
            <p style={{ color: "#888", fontSize: "13px" }}>
              {favourites.length} {favourites.length === 1 ? "song" : "songs"} loved by you
            </p>
          </div>

          {favourites.length > 0 && (
            <button
              onClick={handlePlayAll}
              style={{
                width: "100%", padding: "12px", borderRadius: "10px",
                border: "none", marginBottom: "20px",
                background: "linear-gradient(135deg, #6C63FF, #FF6584)",
                color: "#fff", fontSize: "14px", fontWeight: 600,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 20px rgba(108,99,255,0.35)",
              }}
            >
              ▶ Play All
            </button>
          )}

          {favourites.length === 0 ? (
            <div style={{ textAlign: "center", marginTop: "60px" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🤍</div>
              <p style={{ color: "#888", fontSize: "14px" }}>
                No favourites yet
              </p>
              <p style={{ color: "#555", fontSize: "12px", marginTop: "4px" }}>
                Tap the heart icon on any song to save it here
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {favourites.map((song, index) => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id + index}
                    onClick={() => handleSongClick(song, index)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 12px", borderRadius: "10px",
                      background: isCurrent ? "rgba(108,99,255,0.15)" : "rgba(26,26,46,0.8)",
                      border: `1px solid ${isCurrent ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.05)"}`,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "8px",
                      backgroundImage: `url(${song.thumbnail})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      flexShrink: 0,
                      animation: isCurrent && isPlaying ? "spin 4s linear infinite" : "none",
                    }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: isCurrent ? "#6C63FF" : "#ffffff",
                        fontSize: "13px", fontWeight: 600,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {song.title}
                      </p>
                      <p style={{ color: "#666", fontSize: "11px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {song.artist}
                      </p>
                    </div>
                    <HeartButton song={song} />
                    {isCurrent && (
                      <div style={{ color: "#6C63FF", fontSize: "12px" }}>
                        {isPlaying ? "▶" : "⏸"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {currentSong && (
          <NowPlayingBar
            song={currentSong}
            isPlaying={isPlaying}
            progress={0}
            currentTime={0}
            duration={0}
            onPlayPause={togglePlay}
            onNext={nextSong}
            onPrev={prevSong}
          />
        )}
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