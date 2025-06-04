// pages/login.tsx
import React from "react";

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div style={{ display: "flex", height: "100vh", justifyContent: "center", alignItems: "center" }}>
      <button
        onClick={handleLogin}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#5A67D8",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Login with WorkOS
      </button>
    </div>
  );
}