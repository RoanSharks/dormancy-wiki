import React, { useState } from "react";

export default function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      onRegister(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 bg-[#10131c] rounded-xl shadow-lg p-8 border border-white/10 animate-fade-up"
      style={{ minWidth: 320 }}
    >
      <h2 className="text-2xl font-title text-cyan-200 mb-2 text-center tracking-wide">Register</h2>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-300 font-medium">Username</label>
        <input
          className="rounded-md bg-[#181c2a] border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-300 font-medium">Password</label>
        <input
          type="password"
          className="rounded-md bg-[#181c2a] border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>
      {error && <div className="text-red-400 text-sm text-center">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-cyan-600 hover:bg-cyan-500 transition text-white font-bold py-2 px-6 shadow disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
