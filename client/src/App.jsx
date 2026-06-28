import React, { useState } from "react";
import Login from "./pages/Login";
import Hub from "./pages/Hub";
import Dashboard from "./pages/Dashboard";
import { getToken } from "./api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [view, setView] = useState("hub"); // "hub" | "dashboard"

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

  return <Hub onSelect={setView} onLogout={handleLogout} />;
}
