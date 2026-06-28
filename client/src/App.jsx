import React, { useState } from "react";
import Login from "./pages/Login";
import Hub, { SECTIONS } from "./pages/Hub";
import Dashboard from "./pages/Dashboard";
import TopicPage from "./pages/TopicPage";
import { getToken } from "./api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [view, setView] = useState("hub"); // "hub" | "dashboard" | <section key>

  function handleLogout() {
    setLoggedIn(false);
    setView("hub");
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />;
  }

  if (view === "dashboard") {
    return <Dashboard onLogout={handleLogout} onBack={() => setView("hub")} />;
  }

  const section = SECTIONS.find((s) => s.key === view);
  if (section) {
    return <TopicPage section={section} onLogout={handleLogout} onBack={() => setView("hub")} />;
  }

  return <Hub onSelect={setView} onLogout={handleLogout} />;
}
