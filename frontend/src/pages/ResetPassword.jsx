import { useState }          from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast                 from "react-hot-toast";
import AuthLayout            from "../components/AuthLayout";
import AuthInput             from "../components/AuthInput";
import AuthButton            from "../components/AuthButton";
import { resetPasswordAPI }  from "../api/authAPI";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  const [form, setForm]       = useState({
    otp_code: "", new_password: "", confirm: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const validate = () => {
    const e = {};
    if (!form.otp_code)     e.otp_code     = "OTP is required";
    if (!form.new_password) e.new_password = "Password is required";
    if (form.new_password !== form.confirm)
      e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPasswordAPI({
        email,
        otp_code:     form.otp_code,
        new_password: form.new_password,
      });
      setDone(true);
      toast.success("Password reset successfully! 🎉");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <AuthLayout>
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: "60px", marginBottom: "16px" }}>✅</div>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700 }}>
          Password Reset!
        </h2>
        <p style={{ color: "#666", fontSize: "13px", marginTop: "8px" }}>
          Redirecting to login...
        </p>
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔑</div>
        <h2 style={{ color: "#fff", fontSize: "22px",
          fontWeight: 700, marginBottom: "6px" }}>
          Reset Password
        </h2>
        <p style={{ color: "#666", fontSize: "13px" }}>
          Enter the OTP sent to{" "}
          <span style={{ color: "#6C63FF" }}>{email}</span>
        </p>
      </div>

      <AuthInput label="OTP Code" icon="🔢" placeholder="6-digit OTP"
        value={form.otp_code}
        onChange={(e) => setForm({ ...form, otp_code: e.target.value })}
        error={errors.otp_code}
      />
      <AuthInput label="New Password" type="password" icon="🔒"
        placeholder="Min 8 characters"
        value={form.new_password}
        onChange={(e) => setForm({ ...form, new_password: e.target.value })}
        error={errors.new_password}
      />
      <AuthInput label="Confirm Password" type="password" icon="🔒"
        placeholder="Repeat new password"
        value={form.confirm}
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        error={errors.confirm}
      />

      <div style={{ marginTop: "4px" }}>
        <AuthButton loading={loading} onClick={handleSubmit}>
          Reset Password
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