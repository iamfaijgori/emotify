import HeartButton from "../components/HeartButton";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { SongSkeleton } from "../components/Skeleton";
import useAuthStore       from "../store/authStore";
import usePlayerStore      from "../store/playerStore";
import useVoice            from "../hooks/useVoice";
import useSpeak            from "../hooks/useSpeak";
import useYouTubePlayer    from "../hooks/useYouTubePlayer";

import ExpandedPlayer from "../components/ExpandedPlayer";

import VoiceButton    from "../components/VoiceButton";
import NowPlayingBar  from "../components/NowPlayingBar";

import { parseIntentAPI, getMoodSongsAPI, logPlayAPI } from "../api/musicAPI";
import { useNavigate } from "react-router-dom";

const moods = [
  { label: "Happy",    emoji: "😊" },
  { label: "Sad",      emoji: "💔" },
  { label: "Romantic", emoji: "❤️" },
  { label: "Party",    emoji: "💃" },
  { label: "Calm",     emoji: "🌿" },
  { label: "Focused",  emoji: "🎯" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

export default function Home() {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);

  const {
    queue, currentSong, currentIndex, isPlaying,
    setQueue, playSong, nextSong, prevSong, togglePlay,
  } = usePlayerStore();

  const { isListening, transcript, error, startListening, resetTranscript } = useVoice();
  const { speak } = useSpeak();

  const [aiMessage, setAiMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]       = useState(0);
  const [activeMood, setActiveMood] = useState(null);
  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  // YouTube player setup
  const { containerRef, ready, loadVideo, play, pause, seekTo } = useYouTubePlayer(
    () => nextSong(),              // onEnded
    (pct, current, dur) => {       // onProgress
      setProgress(pct);
      setCurrentTime(current);
      setDuration(dur);
    }
  );

  // Load video whenever currentSong changes
  useEffect(() => {
    if (currentSong && ready) {
      loadVideo(currentSong.id);
      logPlayAPI({
        song_title: currentSong.title,
        artist:     currentSong.artist,
        song_id:    currentSong.id,
        thumbnail:  currentSong.thumbnail,
        source:     "youtube",
      }).catch(() => {});
    }
    // eslint-disable-next-line
  }, [currentSong, ready]);

  // Play / pause sync
  useEffect(() => {
    if (!ready) return;
    if (isPlaying) play(); else pause();
  }, [isPlaying, ready, play, pause]);

  // Handle voice error
  useEffect(() => {
    if (error) toast.error("Mic error: " + error);
  }, [error]);

  // When transcript is finalized (listening stops), send to AI
  useEffect(() => {
    if (!isListening && transcript) {
      handleVoiceCommand(transcript);
    }
    // eslint-disable-next-line
  }, [isListening]);

  const handleVoiceCommand = useCallback(async (text) => {
    setProcessing(true);
    setAiMessage("");
    try {
      const res    = await parseIntentAPI(text);
      const { songs, message } = res.data;

      if (!songs || songs.length === 0) {
        toast.error("Couldn't find songs for that. Try again!");
        setProcessing(false);
        return;
      }

      setAiMessage(message);
      speak(message);
      setQueue(songs);
      playSong(songs[0], 0);
      setActiveMood(null);
      toast.success(message);
    } catch (err) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setProcessing(false);
      resetTranscript();
    }
  }, [setQueue, playSong, speak, resetTranscript]);

  const handleMicClick = () => {
    if (isListening) return;
    startListening();
  };

  const handleMoodClick = async (mood) => {
    setActiveMood(mood.label);
    setProcessing(true);
    setAiMessage("");
    try {
      const res = await getMoodSongsAPI(mood.label.toLowerCase());
      const { songs } = res.data;

      if (!songs || songs.length === 0) {
        toast.error("No songs found for this mood");
        return;
      }

      const msg = `Playing ${mood.label.toLowerCase()} songs for you ${mood.emoji}`;
      setAiMessage(msg);
      speak(msg);
      setQueue(songs);
      playSong(songs[0], 0);
    } catch {
      toast.error("Failed to load mood songs");
    } finally {
      setProcessing(false);
    }
  };

  const handleSongClick = (song, index) => {
    playSong(song, index);
  };

  const handlePlayPause = () => togglePlay();

  return (
    <div style={{
      minHeight: "100vh", background: "#0F0F1A",
      fontFamily: "'Inter', sans-serif",
      display: "flex", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* hidden youtube player */}
      <div style={{ position: "absolute", top: "-9999px" }}>
        <div ref={containerRef}></div>
      </div>

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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6C63FF, #FF6584)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px",
            }}>♪</div>
            <span style={{ color: "#6C63FF", fontWeight: 700, fontSize: "18px", letterSpacing: "1px" }}>
              emotify
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              onClick={() => navigate("/favourites")}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(255,101,132,0.15)",
                border: "1px solid rgba(255,101,132,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", cursor: "pointer",
              }}>❤️</div>
            <div
              onClick={() => navigate("/profile")}
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg, #6C63FF, #FF6584)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", cursor: "pointer",
              }}>👤</div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto", paddingBottom: "140px" }}>

          {/* Browser compatibility warning */}
          {!voiceSupported && (
            <div style={{
              background: "rgba(255,101,132,0.1)",
              border: "1px solid rgba(255,101,132,0.3)",
              borderRadius: "10px", padding: "10px 14px",
              marginBottom: "16px",
            }}>
              <p style={{ color: "#FF6584", fontSize: "12px", margin: 0 }}>
                ⚠️ Voice input isn't supported in this browser. Please use Chrome or Edge for the full experience. Mood buttons still work!
              </p>
            </div>
          )}

          {/* Greeting */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}>
              {getGreeting()}, {user?.nickname || "there"}! 👋
            </h1>
            <p style={{ color: "#888", fontSize: "14px" }}>
              What would you like to listen to?
            </p>
          </div>

          {/* Mic */}
          <VoiceButton
            isListening={isListening}
            processing={processing}
            disabled={!voiceSupported}
            onClick={handleMicClick}
          />

          {/* Transcript / AI message */}
          <div style={{ textAlign: "center", minHeight: "40px", marginBottom: "20px" }}>
            {isListening && (
              <p style={{ color: "#6C63FF", fontSize: "13px" }}>Listening...</p>
            )}
            {!isListening && transcript && processing && (
              <p style={{ color: "#aaa", fontSize: "13px", fontStyle: "italic" }}>
                "{transcript}"
              </p>
            )}
            {aiMessage && !processing && (
              <p style={{ color: "#6C63FF", fontSize: "13px", fontWeight: 500 }}>
                {aiMessage}
              </p>
            )}
            {!isListening && !aiMessage && !processing && (
              <p style={{ color: "#666", fontSize: "13px" }}>Tap the mic to speak</p>
            )}
          </div>

          {/* Quick moods */}
          <div style={{ marginBottom: "28px" }}>
            <p style={{ color: "#888", fontSize: "11px", fontWeight: 600,
              letterSpacing: "1px", marginBottom: "10px" }}>
              QUICK MOOD
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {moods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => handleMoodClick(mood)}
                  style={{
                    padding: "7px 14px", borderRadius: "20px",
                    border: `1px solid ${activeMood === mood.label ? "#6C63FF" : "rgba(108,99,255,0.3)"}`,
                    background: activeMood === mood.label
                      ? "rgba(108,99,255,0.25)" : "rgba(108,99,255,0.08)",
                    color: activeMood === mood.label ? "#6C63FF" : "#aaa",
                    fontSize: "12px", cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: activeMood === mood.label ? 600 : 400,
                    transition: "all 0.2s ease",
                  }}
                >
                  {mood.emoji} {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Queue */}
          {processing ? (
            <div>
              <p style={{ color: "#888", fontSize: "11px", fontWeight: 600,
                letterSpacing: "1px", marginBottom: "10px" }}>
                FINDING YOUR MUSIC...
              </p>
              <SongSkeleton count={4} />
            </div>
          ) : queue.length > 0 ? (
            <div>
              <p style={{ color: "#888", fontSize: "11px", fontWeight: 600,
                letterSpacing: "1px", marginBottom: "10px" }}>
                UP NEXT ({queue.length} songs)
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {queue.map((song, index) => (
                  <div
                    key={song.id + index}
                    onClick={() => handleSongClick(song, index)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 12px", borderRadius: "10px",
                      background: currentIndex === index
                        ? "rgba(108,99,255,0.15)" : "rgba(26,26,46,0.8)",
                      border: `1px solid ${currentIndex === index
                        ? "rgba(108,99,255,0.4)" : "rgba(255,255,255,0.05)"}`,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "8px",
                      backgroundImage: `url(${song.thumbnail})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      flexShrink: 0,
                      animation: currentIndex === index && isPlaying
                        ? "spin 4s linear infinite" : "none",
                    }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: currentIndex === index ? "#6C63FF" : "#ffffff",
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
                    {currentIndex === index && (
                      <div style={{ color: "#6C63FF", fontSize: "12px" }}>
                        {isPlaying ? "▶" : "⏸"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px", opacity: 0.5 }}>🎧</div>
              <p style={{ color: "#666", fontSize: "13px" }}>
                Your queue is empty. Speak or pick a mood to get started.
              </p>
            </div>
          )}
        </div>

        {/* Now playing bar */}
        {/* Now playing bar */}
        <NowPlayingBar
          song={currentSong}
          isPlaying={isPlaying}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={handlePlayPause}
          onNext={nextSong}
          onPrev={prevSong}
          onSeek={seekTo}
          onExpand={() => setIsExpanded(true)}
        />

        {isExpanded && currentSong && (
          <ExpandedPlayer
            song={currentSong}
            isPlaying={isPlaying}
            progress={progress}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={handlePlayPause}
            onNext={nextSong}
            onPrev={prevSong}
            onSeek={seekTo}
            onClose={() => setIsExpanded(false)}
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