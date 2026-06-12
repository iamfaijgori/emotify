import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ProfileSkeleton } from "../components/Skeleton";
import useAuthStore from "../store/authStore";
import StatCard     from "../components/StatCard";
import Pill         from "../components/Pill";
import AuthInput    from "../components/AuthInput";
import AuthButton   from "../components/AuthButton";

import {
  getHistoryAPI, getFavouritesAPI, updateProfileAPI,
} from "../api/musicAPI";
import { logoutAPI, changePasswordAPI } from "../api/authAPI";

const LANGUAGES = [
  { value: "hindi",    label: "Hindi" },
  { value: "english",  label: "English" },
  { value: "punjabi",  label: "Punjabi" },
  { value: "tamil",    label: "Tamil" },
  { value: "telugu",   label: "Telugu" },
  { value: "bengali",  label: "Bengali" },
  { value: "marathi",  label: "Marathi" },
];

const GENRES = [
  { value: "bollywood",  label: "Bollywood" },
  { value: "pop",        label: "Pop" },
  { value: "rock",       label: "Rock" },
  { value: "classical",  label: "Classical" },
  { value: "jazz",       label: "Jazz" },
  { value: "hip_hop",    label: "Hip Hop" },
  { value: "devotional", label: "Devotional" },
  { value: "romantic",   label: "Romantic" },
  { value: "party",      label: "Party" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuthStore();

  const [history,    setHistory]    = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Preferences (editable)
  const [language, setLanguage] = useState(user?.profile?.preferred_language || "hindi");
  const [genre,    setGenre]    = useState(user?.profile?.preferred_genre || "bollywood");
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Change password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    Promise.all([getHistoryAPI(), getFavouritesAPI()])
      .then(([histRes, favRes]) => {
        setHistory(histRes.data);
        setFavourites(favRes.data.favourites || []);
      })
      .catch(() => toast.error("Failed to load profile data"))
      .finally(() => setLoadingData(false));
  }, []);

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    try {
      const res = await updateProfileAPI({
        preferred_language: language,
        preferred_genre:    genre,
      });
      setUser({ ...user, profile: { ...user.profile, ...res.data.data } });
      toast.success("Preferences updated!");
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.old_password || !pwForm.new_password) {
      toast.error("Fill all fields"); return;
    }
    if (pwForm.new_password !== pwForm.confirm) {
      toast.error("Passwords do not match"); return;
    }
    setPwLoading(true);
    try {
      await changePasswordAPI({
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      toast.success("Password changed successfully!");
      setShowPasswordForm(false);
      setPwForm({ old_password: "", new_password: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      await logoutAPI({ refresh });
    } catch {}
    logout();
    toast.success("Logged out");
    navigate("/login");
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
              Profile
            </span>
          </div>
        </div>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto", paddingBottom: "40px" }}>

          {loadingData && <ProfileSkeleton />}

          {!loadingData && (
          <>
          {/* Avatar + name */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{
              width: "84px", height: "84px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6C63FF, #FF6584)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "36px", margin: "0 auto 12px",
              boxShadow: "0 0 30px rgba(108,99,255,0.4)",
            }}>
              👤
            </div>
            <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, marginBottom: "2px" }}>
              {user?.nickname || "User"}
            </h2>
            <p style={{ color: "#888", fontSize: "13px" }}>{user?.email}</p>
            {user?.phone_number && (
              <p style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>
                {user.phone_number}
              </p>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <StatCard icon="🎵" label="Songs Played" value={loadingData ? "—" : history.length} color="#6C63FF" />
            <StatCard icon="❤️" label="Favourites"   value={loadingData ? "—" : favourites.length} color="#FF6584" />
          </div>

          {/* Preferences */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#888", fontSize: "11px", fontWeight: 600,
              letterSpacing: "1px", marginBottom: "10px" }}>
              PREFERRED LANGUAGE
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {LANGUAGES.map((l) => (
                <Pill key={l.value} active={language === l.value} onClick={() => setLanguage(l.value)}>
                  {l.label}
                </Pill>
              ))}
            </div>

            <p style={{ color: "#888", fontSize: "11px", fontWeight: 600,
              letterSpacing: "1px", marginBottom: "10px" }}>
              PREFERRED GENRE
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {GENRES.map((g) => (
                <Pill key={g.value} active={genre === g.value} onClick={() => setGenre(g.value)}>
                  {g.label}
                </Pill>
              ))}
            </div>

            <button
              onClick={handleSavePrefs}
              disabled={savingPrefs}
              style={{
                padding: "9px 20px", borderRadius: "10px", border: "none",
                background: "linear-gradient(135deg, #6C63FF, #FF6584)",
                color: "#fff", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
                opacity: savingPrefs ? 0.7 : 1,
              }}
            >
              {savingPrefs ? "Saving..." : "Save Preferences"}
            </button>
          </div>

          {/* Recent history */}
          <div style={{ marginBottom: "24px" }}>
            <p style={{ color: "#888", fontSize: "11px", fontWeight: 600,
              letterSpacing: "1px", marginBottom: "10px" }}>
              RECENT HISTORY
            </p>
            {loadingData ? (
              <p style={{ color: "#666", fontSize: "13px" }}>Loading...</p>
            ) : history.length === 0 ? (
              <p style={{ color: "#666", fontSize: "13px" }}>No songs played yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {history.slice(0, 8).map((song) => (
                  <div key={song.id} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 12px", borderRadius: "10px",
                    background: "rgba(26,26,46,0.8)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "8px",
                      backgroundImage: `url(${song.thumbnail})`,
                      backgroundSize: "cover", backgroundPosition: "center",
                      flexShrink: 0,
                      background: song.thumbnail ? undefined : "linear-gradient(135deg, #6C63FF, #FF6584)",
                    }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        color: "#fff", fontSize: "13px", fontWeight: 600,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {song.song_title}
                      </p>
                      <p style={{ color: "#666", fontSize: "11px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {song.artist}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Change password */}
          <div style={{ marginBottom: "24px" }}>
            <div
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px", borderRadius: "10px",
                background: "rgba(26,26,46,0.8)",
                border: "1px solid rgba(108,99,255,0.15)",
                cursor: "pointer",
              }}
            >
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>
                🔑 Change Password
              </span>
              <span style={{ color: "#6C63FF", fontSize: "13px" }}>
                {showPasswordForm ? "−" : "+"}
              </span>
            </div>

            {showPasswordForm && (
              <div style={{ marginTop: "12px" }}>
                <AuthInput
                  label="Old Password" type="password" icon="🔒"
                  placeholder="Current password"
                  value={pwForm.old_password}
                  onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                />
                <AuthInput
                  label="New Password" type="password" icon="🔒"
                  placeholder="New password"
                  value={pwForm.new_password}
                  onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                />
                <AuthInput
                  label="Confirm New Password" type="password" icon="🔒"
                  placeholder="Repeat new password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                />
                <AuthButton loading={pwLoading} onClick={handleChangePassword}>
                  Update Password
                </AuthButton>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: "100%", padding: "13px", borderRadius: "10px",
              border: "1px solid #FF6584",
              background: "rgba(255,101,132,0.1)",
              color: "#FF6584", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", fontFamily: "Inter, sans-serif",
            }}
          >
            Logout
          </button>
          </>
          )}
        </div>
      </div>
    </div>
  );
}