import { useState }          from "react";
import { useNavigate, Link } from "react-router-dom";
import toast                 from "react-hot-toast";
import AuthLayout            from "../components/AuthLayout";
import AuthInput             from "../components/AuthInput";
import AuthButton            from "../components/AuthButton";
import { loginAPI, getMeAPI } from "../api/authAPI";
import useAuthStore           from "../store/authStore";

export default function Login() {
  const navigate  = useNavigate();
  const setUser   = useAuthStore((s) => s.setUser);

  const [form, setForm]       = useState({ email: "", password: "" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await loginAPI(form);
      localStorage.setItem("access_token",  res.data.tokens.access);
      localStorage.setItem("refresh_token", res.data.tokens.refresh);

      const me = await getMeAPI();
      setUser(me.data);

      toast.success(`Welcome back, ${res.data.nickname || "friend"}! 🎵`);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed";
      toast.error(msg);
      if (msg.includes("verify")) navigate("/verify-otp",
        { state: { email: form.email, purpose: "register" } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 style={{ color: "#fff", fontSize: "22px",
        fontWeight: 700, textAlign: "center", marginBottom: "6px" }}>
        Welcome Back
      </h2>
      <p style={{ color: "#666", fontSize: "13px",
        textAlign: "center", marginBottom: "28px" }}>
        Sign in to continue listening
      </p>

      <AuthInput
        label="Email"
        type="email"
        icon="✉️"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
      />
      <AuthInput
        label="Password"
        type="password"
        icon="🔒"
        placeholder="Your password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
      />

      <div style={{ textAlign: "right", marginBottom: "20px", marginTop: "-8px" }}>
        <Link to="/forgot-password" style={{
          color: "#6C63FF", fontSize: "12px", textDecoration: "none" }}>
          Forgot Password?
        </Link>
      </div>

      <AuthButton loading={loading} onClick={handleSubmit}>
        Login
      </AuthButton>

      <p style={{ color: "#666", fontSize: "13px",
        textAlign: "center", marginTop: "20px" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#6C63FF",
          textDecoration: "none", fontWeight: 600 }}>
          Register
        </Link>
      </p>
    </AuthLayout>
  );
}