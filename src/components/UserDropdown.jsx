import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserDropdown({ username, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400 bg-cyan-900/40 text-cyan-100 font-bold hover:bg-cyan-800/60 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-title">{username}</span>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/></svg>
      </button>
      {open && (
        <div
          className="absolute left-0 mt-2 w-44 rounded-xl bg-[#10131c] border border-white/10 shadow-lg animate-fade-up z-[9999]"
        >
          <button
            className="block w-full text-left px-4 py-2 text-slate-200 hover:bg-cyan-900/30 rounded-t-xl"
            onClick={() => { setOpen(false); navigate("/settings"); }}
          >
            Settings
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-red-300 hover:bg-red-900/30 rounded-b-xl"
            onClick={() => { setOpen(false); onSignOut(); }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
