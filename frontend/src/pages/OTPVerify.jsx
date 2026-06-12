import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast                from "react-hot-toast";
import AuthLayout           from "../components/AuthLayout";
import AuthButton           from "../components/AuthButton";
import { verifyOTPAPI, resendOTPAPI, getMeAPI } from "../api/authAPI";
import useAuthStore         from "../store/authStore";

export default function OTPVerify() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const setUser   = useAuthStore((s) => s.setUser);

  const { email, purpose } = location.state || {};

  const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      const res = await verifyOTPAPI({ email, otp_code: code, purpose });

      if (purpose === "register") {
        localStorage.setItem("access_token",  res.data.tokens.access);
        localStorage.setItem("refresh_token", res.data.tokens.refresh);
        const me = await getMeAPI();
        setUser(me.data);
        toast.success("Email verified! Welcome to Emotify 🎵");
        navigate("/");
      } else {
        toast.success("OTP verified!");
        navigate("/reset-password", { state: { email } });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTPAPI({ email, purpose });
      setCountdown(300);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast.success("New OTP sent to your email!");
    } catch {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>✉️</div>
        <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 700, marginBottom: "6px" }}>
          Verify Your Email
        </h2>
        <p style={{ color: "#666", fontSize: "13px" }}>
          Enter the 6-digit code sent to
        </p>
        <p style={{ color: "#6C63FF", fontSize: "13px", fontWeight: 600 }}>
          {email}
        </p>
      </div>

      {/* OTP boxes */}
      <div style={{ display: "flex", gap: "10px",
        justifyContent: "center", marginBottom: "28px" }}
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              width: "44px", height: "52px",
              textAlign: "center", fontSize: "20px", fontWeight: 700,
              background: "#0F0F1A",
              border: `2px solid ${digit ? "#6C63FF" : "rgba(108,99,255,0.25)"}`,
              borderRadius: "10px", color: "#ffffff",
              outline: "none", fontFamily: "'Inter', sans-serif",
              boxShadow: digit ? "0 0 10px rgba(108,99,255,0.3)" : "none",
              transition: "all 0.15s ease",
            }}
          />
        ))}
      </div>

      <AuthButton loading={loading} onClick={handleVerify}>
        Verify OTP
      </AuthButton>

      {/* Countdown + resend */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {countdown > 0 ? (
          <p style={{ color: "#666", fontSize: "13px" }}>
            Resend OTP in{" "}
            <span style={{ color: "#6C63FF", fontWeight: 600 }}>
              {formatTime(countdown)}
            </span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            style={{
              background: "none", border: "none",
              color: "#6C63FF", fontSize: "13px",
              cursor: "pointer", fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>

      <p style={{ color: "#666", fontSize: "13px",
        textAlign: "center", marginTop: "16px" }}>
        <Link to="/login" style={{ color: "#888", textDecoration: "none" }}>
          ← Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}