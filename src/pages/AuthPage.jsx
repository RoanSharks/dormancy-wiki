import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";


export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  function handleAuth(token) {
    localStorage.setItem("token", token);
    if (onAuth) onAuth(token);
    navigate("/"); // Redirect to home page after login
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="flex gap-2 mb-6 bg-[#10131c] rounded-full border border-white/10 p-1 shadow">
        <button
          className={`px-6 py-2 rounded-full font-bold transition text-sm tracking-wide font-title ${mode === "login" ? "bg-cyan-600 text-white shadow" : "text-cyan-200 hover:bg-cyan-900/30"}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`px-6 py-2 rounded-full font-bold transition text-sm tracking-wide font-title ${mode === "register" ? "bg-cyan-600 text-white shadow" : "text-cyan-200 hover:bg-cyan-900/30"}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>
      <div className="w-full max-w-md animate-fade-up">
        {mode === "login" ? (
          <LoginForm onLogin={handleAuth} />
        ) : (
          <RegisterForm onRegister={handleAuth} />
        )}
      </div>
    </div>
  );
}
