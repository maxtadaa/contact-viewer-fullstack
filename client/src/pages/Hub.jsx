import React from "react";
import { Users, BookOpen, Contact2, LayoutGrid, ArrowRight, LogOut } from "lucide-react";
import { getUser, clearSession } from "../api";
import { FadeInStagger, FadeInItem } from "../components/FadeIn";

const SECTIONS = [
  {
    key: "dashboard",
    icon: Users,
    title: "รายชื่อลูกค้า",
    subtitle: "Customer Directory",
    description: "ค้นหา ดู และจัดการข้อมูลลูกค้าทั้งหมด",
    enabled: true,
  },
  {
    key: "handbook",
    icon: BookOpen,
    title: "คู่มือการใช้งาน",
    subtitle: "Knowledge Base",
    description: "แนวทาง ทิป และข้อมูลความรู้จากทีมงาน",
    enabled: false,
  },
  {
    key: "staff",
    icon: Contact2,
    title: "ทำเนียบพนักงาน",
    subtitle: "Staff Directory",
    description: "ค้นหาข้อมูลติดต่อพนักงานในองค์กร",
    enabled: false,
  },
  {
    key: "services",
    icon: LayoutGrid,
    title: "บริการอื่นๆ",
    subtitle: "Other Services",
    description: "บริการและเครื่องมือเชื่อมต่ออื่นๆ ขององค์กร",
    enabled: false,
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
          <img src="/logo-tcc-transparent.png" alt="TCC Technology Group — 25th Anniversary" className="h-24 w-auto" />
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
              เลือกข้อมูลที่ต้องการดู
            </h1>
          </FadeInItem>
          <FadeInItem>
            <p className="text-slate-400 text-base mb-12">
              เลือกเมนูด้านล่างเพื่อเข้าสู่ส่วนข้อมูลที่ต้องการ
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
