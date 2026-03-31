import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const token = localStorage.getItem("token");
  let isAdmin = false;
  let username = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      username = payload.username;
      isAdmin = username === "Fatigue";
    } catch {}
  }
  if (!isAdmin) return <Navigate to="/auth" replace />;
  return children;
}
