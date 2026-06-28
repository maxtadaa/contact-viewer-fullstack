import React, { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { getToken } from "./api";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;
  return <Dashboard onLogout={() => setLoggedIn(false)} />;
}
