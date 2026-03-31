import React from "react";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import StarField from "./components/StarField";
import RequireAdmin from "./components/RequireAdmin";
import HomePage from "./pages/HomePage";
import WikiPage from "./pages/WikiPage";
import WikiListPage from "./pages/WikiListPage";
import EditorPage from "./pages/EditorPage";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-[#02040a] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <StarField mode="dark" />
        <div className="absolute -top-24 right-[14%] h-72 w-72 rounded-full bg-slate-100 blur-[130px] opacity-15" />
        <div className="absolute -bottom-28 left-1/4 h-[26rem] w-[26rem] rounded-full bg-blue-950 blur-[150px] opacity-55" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 pb-16 pt-6 sm:px-8">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wiki" element={<WikiListPage />} />
          <Route path="/wiki/:slug" element={<WikiPage />} />
          <Route path="/admin" element={
            <RequireAdmin>
              <EditorPage />
            </RequireAdmin>
          } />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  );
}
