import React, { useState } from "react";

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleChangePassword(e) {
    e.preventDefault();
    setStatus("");
    if (newPassword !== confirm) {
      setStatus("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setStatus("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-lg mx-auto mt-16 bg-[#10131c] rounded-xl border border-white/10 p-8 shadow animate-fade-up">
      <h1 className="font-title text-2xl text-cyan-200 mb-4">Account Settings</h1>
      <form className="flex flex-col gap-5" onSubmit={handleChangePassword}>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300 font-medium">Current Password</label>
          <input
            type="password"
            className="rounded-md bg-[#181c2a] border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300 font-medium">New Password</label>
          <input
            type="password"
            className="rounded-md bg-[#181c2a] border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300 font-medium">Confirm New Password</label>
          <input
            type="password"
            className="rounded-md bg-[#181c2a] border border-slate-700 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        {status && <div className={status.includes("success") ? "text-green-400" : "text-red-400"}>{status}</div>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-cyan-600 hover:bg-cyan-500 transition text-white font-bold py-2 px-6 shadow disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </section>
  );
}
