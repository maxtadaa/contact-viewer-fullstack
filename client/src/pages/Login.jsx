import React, { useState } from "react";
import { loginWithMicrosoft } from "../api";
import { getMicrosoftIdToken } from "../auth/msal";

export default function Login({ onLogin }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleMicrosoft() {
    setError("");
    setBusy(true);
    try {
      const idToken = await getMicrosoftIdToken();
      const user = await loginWithMicrosoft(idToken);
      onLogin(user);
    } catch (e) {
      setError(e.message || "เข้าสู่ระบบด้วย Microsoft ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-3xl text-center">
        <img
          src="/logo-tcc-transparent.png"
          alt="TCC Technology Group — 25th Anniversary"
          className="h-40 sm:h-48 md:h-56 w-auto mx-auto mb-10"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Welcome to the <span className="text-sky-400">Knowledge Base Servicedesk</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10">
          Your central hub to learn, share, and grow together — explore guides, tips, and insights from across the team.
        </p>

        <div className="max-w-sm mx-auto bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl shadow-black/40">
          <button
            onClick={handleMicrosoft}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 bg-white rounded-lg py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-60 transition-colors"
          >
            <MicrosoftIcon />
            {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Microsoft"}
          </button>

          {error && <p className="text-sm text-rose-400 text-center">{error}</p>}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          ใช้บัญชีองค์กรของคุณเพื่อเข้าสู่ระบบ
        </p>
      </div>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
