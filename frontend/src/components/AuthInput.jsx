import { useState } from "react";

export default function AuthInput({
  label, type = "text", value, onChange,
  placeholder, icon, error,
}) {
  const [focused,     setFocused]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType  = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: "16px" }}>
      {label && (
        <label style={{ color: "#aaa", fontSize: "12px",
          fontWeight: 500, display: "block", marginBottom: "6px" }}>
          {label}
        </label>
      )}
      <div style={{
        display: "flex", alignItems: "center",
        background: "#0F0F1A",
        border: `1px solid ${error ? "#FF6584" : focused
          ? "#6C63FF" : "rgba(108,99,255,0.2)"}`,
        borderRadius: "10px",
        padding: "0 14px",
        transition: "all 0.2s ease",
        boxShadow: focused ? "0 0 0 3px rgba(108,99,255,0.1)" : "none",
      }}>
        {icon && (
          <span style={{ fontSize: "16px", marginRight: "10px", opacity: 0.6 }}>
            {icon}
          </span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, background: "transparent",
            border: "none", outline: "none",
            color: "#ffffff", fontSize: "16px",
            padding: "13px 0",
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {isPassword && (
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: "pointer", fontSize: "16px", opacity: 0.5 }}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        )}
      </div>
      {error && (
        <p style={{ color: "#FF6584", fontSize: "11px", marginTop: "4px" }}>
          {error}
        </p>
      )}
    </div>
  );
}