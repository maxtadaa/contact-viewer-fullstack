import React, { useState } from "react";
import { loginWithMicrosoft, loginDemo } from "../api";
import { getMicrosoftIdToken } from "../auth/msal";
import { FadeInStagger, FadeInItem } from "../components/FadeIn";

const SHOW_DEMO_LOGIN = import.meta.env.VITE_ENABLE_DEV_LOGIN === "true";

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

  async function handleDemo() {
    setError("");
    setBusy(true);
    try {
      const user = await loginDemo();
      onLogin(user);
    } catch (e) {
      setError(e.message || "เข้าสู่ระบบทดลองไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center p-6 font-sans">
      <FadeInStagger className="w-full max-w-3xl flex flex-col items-center text-center">
        <FadeInItem>
          <img
            src="/logo-tcc-transparent.png"
            alt="TCC Technology Group — 25th Anniversary"
            className="h-40 sm:h-48 md:h-56 w-auto mx-auto mb-10 logo-glow"
          />
        </FadeInItem>

        <FadeInItem>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4 shimmer-text">
            Welcome to the Knowledge Base Servicedesk
          </h1>
        </FadeInItem>

        <FadeInItem>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            <span className="text-slate-300">The central hub for collecting information, exchanging insights, and sharing knowledge</span>
            <span className="text-slate-500"> — </span>
            <span className="text-sky-400/80">empowering the Servicedesk team to learn, develop, and grow together.</span>
          </p>
        </FadeInItem>

        <FadeInItem className="w-full">
          <div className="max-w-xs mx-auto space-y-5">
            <div className="btn-ms-wrap">
              <button onClick={handleMicrosoft} disabled={busy} className="btn-ms-inner">
                <MicrosoftIcon />
                {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Microsoft"}
              </button>
            </div>

            {SHOW_DEMO_LOGIN && (
              <button
                onClick={handleDemo}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 border border-white/15 rounded-xl py-3 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-60 transition-colors"
              >
                เข้าสู่ระบบแบบทดลอง (Demo)
              </button>
            )}

            {error && <p className="text-sm text-rose-400 text-center">{error}</p>}
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            ใช้บัญชี Microsoft 365 ขององค์กรเพื่อเข้าสู่ระบบ
          </p>
        </FadeInItem>
      </FadeInStagger>
    </div>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 23 23" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
      <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}
