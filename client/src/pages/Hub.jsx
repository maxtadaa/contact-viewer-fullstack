import React from "react";
import { MonitorCheck, ClipboardList, LifeBuoy, BookOpen, ArrowRight, LogOut } from "lucide-react";
import { getUser, clearSession } from "../api";
import { FadeInStagger, FadeInItem } from "../components/FadeIn";

export const SECTIONS = [
  {
    key: "monitoring",
    icon: MonitorCheck,
    title: "คู่มือเฝ้าระวังระบบ",
    subtitle: "Manual Monitoring",
    description: "คู่มือและขั้นตอนการเฝ้าระวัง ตรวจสอบสถานะระบบทั้งหมด",
    enabled: true,
  },
  {
    key: "sop",
    icon: ClipboardList,
    title: "คู่มือการปฏิบัติงาน",
    subtitle: "Standard Operating Procedure (SOP)",
    description: "คู่มือและขั้นตอนการทำงานมาตรฐานของทีม Servicedesk",
    enabled: true,
  },
  {
    key: "support",
    icon: LifeBuoy,
    title: "คู่มือแก้ปัญหาเบื้องต้น",
    subtitle: "1st Tier Technical Support",
    description: "คู่มือแก้ปัญหาที่พบบ่อย สำหรับช่วยเหลือผู้ใช้งาน",
    enabled: true,
  },
  {
    key: "knowledge-base",
    icon: BookOpen,
    title: "ศูนย์รวมความรู้",
    subtitle: "Knowledge Base",
    description: "รวมบทความ เคล็ดลับ และความรู้ที่แชร์กันภายในองค์กร",
    enabled: true,
  },
];

export default function Hub({ onSelect, onLogout }) {
  const user = getUser();

  function doLogout() {
    clearSession();
    onLogout();
  }

  return (
    <div className="min-h-screen hero-bg font-sans">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <img src="/logo-tcc-transparent.png" alt="TCC Technology Group — 25th Anniversary" className="h-24 w-auto logo-glow" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300 hidden md:block max-w-[160px] truncate">{user?.name || user?.email}</span>
            <button onClick={doLogout} title="ออกจากระบบ" className="text-slate-400 hover:text-white p-1.5">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-14">
        <FadeInStagger className="flex flex-col items-center text-center">
          <FadeInItem>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-widest leading-tight mb-3 uppercase shimmer-text">
              TCC TECHNOLOGY - SERVICEDESK
            </h1>
          </FadeInItem>
          <FadeInItem>
            <p className="text-sky-400 text-base font-semibold tracking-widest mb-12 uppercase">
              OPERATIONS KNOWLEDGE HUB
            </p>
          </FadeInItem>

          <FadeInItem className="w-full">
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              {SECTIONS.map((s) => (
                <SectionCard key={s.key} section={s} onClick={() => s.enabled && onSelect(s.key)} />
              ))}
            </div>
          </FadeInItem>
        </FadeInStagger>
      </div>
    </div>
  );
}

function SectionCard({ section, onClick }) {
  const { icon: Icon, title, subtitle, description, enabled } = section;
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={`group relative flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
        enabled
          ? "border-white/10 bg-white/[0.06] backdrop-blur-xl hover:border-sky-400/50 hover:bg-white/10 cursor-pointer"
          : "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-60"
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${enabled ? "bg-sky-500/15 text-sky-400" : "bg-white/5 text-slate-500"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-white">{title}</h2>
          {!enabled && (
            <span className="text-[10px] font-medium text-slate-400 bg-white/10 px-1.5 py-0.5 rounded-full shrink-0">
              เร็วๆ นี้
            </span>
          )}
        </div>
        <p className="text-xs text-sky-400/80 mb-1">{subtitle}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      {enabled && (
        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      )}
    </button>
  );
}
