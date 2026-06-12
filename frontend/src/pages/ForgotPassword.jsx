import { useState }          from "react";
import { useNavigate, Link } from "react-router-dom";
import toast                 from "react-hot-toast";
import AuthLayout            from "../components/AuthLayout";
import AuthInput             from "../components/AuthInput";
import AuthButton            from "../components/AuthButton";
import { forgotPasswordAPI } from "../api/authAPI";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) { toast.error("Enter your email"); return; }
    setLoading(true);
    try {
      await forgotPasswordAPI({ email });
      toast.success("OTP sent if this email exists 📧");
      navigate("/verify-otp", {
        state: { email, purpose: "password_reset" }
      });
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
        <h2 style={{ color: "#fff", fontSize: "22px",
          fontWeight: 700, marginBottom: "6px" }}>
          Forgot Password?
        </h2>
        <p style={{ color: "#666", fontSize: "13px" }}>
          Enter your email and we'll send you an OTP
        </p>
      </div>

      <AuthInput
        label="Email"
        type="email"
        icon="✉️"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div style={{ marginTop: "8px" }}>
        <AuthButton loading={loading} onClick={handleSubmit}>
          Send OTP
        </AuthButton>
      </div>

      <p style={{ color: "#666", fontSize: "13px",
        textAlign: "center", marginTop: "20px" }}>
        <Link to="/login" style={{ color: "#888", textDecoration: "none" }}>
          ← Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}