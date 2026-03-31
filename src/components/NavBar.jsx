
import { NavLink, useNavigate } from "react-router-dom";
import UserDropdown from "./UserDropdown";

export default function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let username = null;
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      username = payload.username;
      isAdmin = payload.username === "Fatigue";
    } catch {}
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    navigate("/auth");
  }

  const links = [
    { to: "/", label: "Home" },
    { to: "/wiki", label: "Wiki" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md z-[9999]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-title text-xl tracking-wide text-cyan-200">Dormancy</p>
          <p className="text-sm text-slate-300">Roblox Game Community Wiki</p>
        </div>

        <nav className="flex gap-2 items-center">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  "rounded-full border px-4 py-1.5 text-sm transition",
                  isActive
                    ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                    : "border-white/20 bg-black/20 text-slate-200 hover:border-cyan-300/60 hover:text-cyan-100",
                ].join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
          {username ? (
            <UserDropdown username={username} onSignOut={handleSignOut} />
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                [
                  "rounded-full border px-4 py-1.5 text-sm transition font-bold font-title",
                  isActive
                    ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                    : "border-cyan-400 bg-cyan-900/40 text-cyan-100 hover:bg-cyan-800/60",
                ].join(" ")
              }
            >
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
