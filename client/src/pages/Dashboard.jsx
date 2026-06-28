import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, Upload, Phone, Mail, Building2, MapPin, X, Users, LogOut,
  ChevronLeft, ChevronRight, Pencil, Trash2, Loader2,
} from "lucide-react";
import {
  getCustomers, getCompanies, uploadExcel, updateCustomer, deleteCustomer,
  getUser, clearSession,
} from "../api";

const PER_PAGE = 10;
const AVATAR_COLORS = [
  "bg-amber-200 text-amber-900", "bg-sky-200 text-sky-900", "bg-rose-200 text-rose-900",
  "bg-emerald-200 text-emerald-900", "bg-violet-200 text-violet-900", "bg-orange-200 text-orange-900",
];
const initials = (n) => {
  if (!n) return "?";
  const p = String(n).trim().split(/\s+/);
  return (p[0]?.[0] || "") + (p[1]?.[0] || "");
};

export default function Dashboard({ onLogout }) {
  const user = getUser();
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [company, setCompany] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers({ search, company, page, perPage: PER_PAGE });
      setRows(res.data);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total || 0);
    } catch (e) {
      setToast(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, company, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { getCompanies().then(setCompanies).catch(() => {}); }, []);

  function notify(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadExcel(file);
      notify(`นำเข้า ${res.inserted} รายชื่อสำเร็จ`);
      setPage(1);
      load();
      getCompanies().then(setCompanies);
    } catch (err) {
      notify(err.message);
    } finally {
      e.target.value = "";
    }
  }

  async function handleDelete(c) {
    if (!confirm(`ลบ "${c.name}" ?`)) return;
    try {
      await deleteCustomer(c.id);
      notify("ลบแล้ว");
      setSelected(null);
      load();
    } catch (e) { notify(e.message); }
  }

  function doLogout() {
    clearSession();
    onLogout();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* แถบหัว */}
      <header className="hero-bg border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-tcc-transparent.png" alt="TCC Technology Group — 25th Anniversary" className="h-8 w-auto" />
            <div>
              <h1 className="font-bold text-white leading-tight">รายชื่อลูกค้า</h1>
              <p className="text-xs text-slate-400">{total} รายชื่อ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors">
              <Upload className="w-4 h-4" /> <span className="hidden sm:inline">นำเข้า Excel</span>
            </button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
            <div className="flex items-center gap-2 pl-1">
              <span className="text-sm text-slate-300 hidden md:block max-w-[140px] truncate">{user?.name || user?.email}</span>
              <button onClick={doLogout} title="ออกจากระบบ"
                className="text-slate-400 hover:text-white p-1.5"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ค้นหา + กรอง */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); setSelected(null); }}
              placeholder="ค้นหาชื่อ บริษัท เบอร์ อีเมล..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
            />
          </div>
          <select
            value={company}
            onChange={(e) => { setCompany(e.target.value); setPage(1); setSelected(null); }}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 sm:w-56"
          >
            <option value="">ทุกบริษัท</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* รายการ */}
          <div className="lg:col-span-3 space-y-2 min-h-[200px]">
            {loading && (
              <div className="flex justify-center py-16 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {!loading && rows.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">
                {total === 0 ? "ยังไม่มีข้อมูล — กด\"นำเข้า Excel\" เพื่อเริ่มต้น" : "ไม่พบรายชื่อที่ตรงกับการค้นหา"}
              </div>
            )}
            {!loading && rows.map((r, i) => {
              const isActive = selected?.id === r.id;
              return (
                <button key={r.id} onClick={() => setSelected(isActive ? null : r)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isActive ? "border-sky-500 bg-white shadow-sm ring-1 ring-sky-500/20" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 uppercase ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials(r.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-900 truncate">{r.name}</div>
                    {r.company && (
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Building2 className="w-3 h-3 shrink-0" /> {r.company}
                      </div>
                    )}
                  </div>
                  {r.phone && <div className="text-xs text-slate-400 font-mono hidden sm:block shrink-0">{r.phone}</div>}
                </button>
              );
            })}

            {totalPages > 1 && !loading && (
              <div className="flex items-center justify-between pt-3 text-sm">
                <button onClick={() => { setPage((p) => Math.max(1, p - 1)); setSelected(null); }} disabled={page === 1}
                  className="flex items-center gap-1 text-slate-600 disabled:text-slate-300 hover:text-sky-600">
                  <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
                </button>
                <span className="text-slate-400">หน้า {page} / {totalPages}</span>
                <button onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setSelected(null); }} disabled={page === totalPages}
                  className="flex items-center gap-1 text-slate-600 disabled:text-slate-300 hover:text-sky-600">
                  ถัดไป <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* รายละเอียด */}
          <div className="lg:col-span-2">
            {selected ? (
              <Detail row={selected} onClose={() => setSelected(null)}
                onEdit={() => setEditing(selected)} onDelete={() => handleDelete(selected)} />
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-2xl p-10 text-slate-400 h-full min-h-[200px]">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-sm">เลือกรายชื่อเพื่อดูรายละเอียด</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <EditModal row={editing} onClose={() => setEditing(null)}
          onSaved={(updated) => { setEditing(null); setSelected(updated); notify("บันทึกแล้ว"); load(); }} />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-black/30 border border-white/10 z-20">
          {toast}
        </div>
      )}
    </div>
  );
}

function Detail({ row, onClose, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-20">
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold uppercase ${AVATAR_COLORS[0]}`}>
            {initials(row.name)}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg leading-tight">{row.name}</h2>
            {row.company && <p className="text-sm text-slate-500">{row.company}</p>}
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
      </div>

      <div className="space-y-3 mb-5">
        {row.phone && <Field icon={Phone} label="เบอร์โทร" value={row.phone} mono />}
        {row.email && <Field icon={Mail} label="อีเมล" value={row.email} mono />}
        {row.address && <Field icon={MapPin} label="ที่อยู่" value={row.address} />}
        {row.note && <Field icon={null} label="หมายเหตุ" value={row.note} />}
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100">
        <button onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium border border-slate-300 rounded-lg py-2 hover:bg-slate-50">
          <Pencil className="w-3.5 h-3.5" /> แก้ไข
        </button>
        <button onClick={onDelete}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-rose-600 border border-rose-200 rounded-lg py-2 px-4 hover:bg-rose-50">
          <Trash2 className="w-3.5 h-3.5" /> ลบ
        </button>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        {Icon ? <Icon className="w-4 h-4 text-slate-500" /> : <span className="text-slate-400 text-xs">·</span>}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-400">{label}</div>
        <div className={`text-sm text-slate-800 break-words ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

function EditModal({ row, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: row.name || "", company: row.company || "", phone: row.phone || "",
    email: row.email || "", address: row.address || "", note: row.note || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function save() {
    if (!form.name.trim()) { setErr("ต้องระบุชื่อ"); return; }
    setSaving(true);
    try {
      await updateCustomer(row.id, form);
      onSaved({ ...row, ...form });
    } catch (e) { setErr(e.message); setSaving(false); }
  }

  const fields = [
    ["name", "ชื่อ *"], ["company", "บริษัท"], ["phone", "เบอร์โทร"],
    ["email", "อีเมล"], ["address", "ที่อยู่"], ["note", "หมายเหตุ"],
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-30" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900">แก้ไขข้อมูล</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          {fields.map(([k, label]) => (
            <div key={k}>
              <label className="text-xs text-slate-500">{label}</label>
              <input value={form[k]} onChange={set(k)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400" />
            </div>
          ))}
          {err && <p className="text-sm text-rose-600">{err}</p>}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 text-sm font-medium border border-slate-300 rounded-lg py-2.5 hover:bg-slate-50">ยกเลิก</button>
          <button onClick={save} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium bg-sky-500 text-white rounded-lg py-2.5 hover:bg-sky-400 disabled:opacity-60">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
