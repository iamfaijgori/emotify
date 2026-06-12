import { useState }          from "react";
import { useNavigate, Link } from "react-router-dom";
import toast                 from "react-hot-toast";
import AuthLayout            from "../components/AuthLayout";
import AuthInput             from "../components/AuthInput";
import AuthButton            from "../components/AuthButton";
import { registerAPI }       from "../api/authAPI";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm]       = useState({
    nickname: "", email: "", phone_number: "",
    password: "", password2: "",
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.nickname)     e.nickname     = "Nickname is required";
    if (!form.email)        e.email        = "Email is required";
    if (!form.phone_number) e.phone_number = "Phone number is required";
    if (!form.password)     e.password     = "Password is required";
    if (form.password !== form.password2)
      e.password2 = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await registerAPI(form);
      toast.success("OTP sent to your email! 📧");
      navigate("/verify-otp", {
        state: { email: form.email, purpose: "register" }
      });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        // Show field level errors from backend
        setErrors(data);
        toast.error("Please fix the errors below");
      } else {
        toast.error("Registration failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 style={{ color: "#fff", fontSize: "22px",
        fontWeight: 700, textAlign: "center", marginBottom: "6px" }}>
        Create Account
      </h2>
      <p style={{ color: "#666", fontSize: "13px",
        textAlign: "center", marginBottom: "24px" }}>
        Join Emotify and feel the music
      </p>

      <AuthInput label="Nickname" icon="😊" placeholder="What should we call you?"
        value={form.nickname}
        onChange={(e) => setForm({ ...form, nickname: e.target.value })}
        error={errors.nickname}
      />
      <AuthInput label="Email" type="email" icon="✉️" placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
      />
      <AuthInput label="Phone Number" icon="📱" placeholder="+919999999999"
        value={form.phone_number}
        onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
        error={errors.phone_number}
      />
      <AuthInput label="Password" type="password" icon="🔒" placeholder="Min 8 characters"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
      />
      <AuthInput label="Confirm Password" type="password" icon="🔒" placeholder="Repeat password"
        value={form.password2}
        onChange={(e) => setForm({ ...form, password2: e.target.value })}
        error={errors.password2}
      />

      <div style={{ marginTop: "4px" }}>
        <AuthButton loading={loading} onClick={handleSubmit}>
          Create Account
        </AuthButton>
      </div>

      <p style={{ color: "#666", fontSize: "13px",
        textAlign: "center", marginTop: "20px" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#6C63FF",
          textDecoration: "none", fontWeight: 600 }}>
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}