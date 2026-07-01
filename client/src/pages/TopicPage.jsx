import React, { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, LogOut, Upload, FileText, Download, Loader2 } from "lucide-react";
import { getUser, clearSession, uploadTopicFile, getTopicFiles, downloadTopicFile } from "../api";
import { FadeInStagger, FadeInItem } from "../components/FadeIn";

function formatSize(bytes) {
  if (!bytes) return "-";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TopicPage({ section, onBack, onLogout }) {
  const user = getUser();
  const { key, icon: Icon, title, subtitle, description } = section;
  const fileRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTopicFiles(key);
      setFiles(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => { load(); }, [load]);

  function doLogout() {
    clearSession();
    onLogout();
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await uploadTopicFile(key, file);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDownload(f) {
    try {
      await downloadTopicFile(key, f.id, f.filename);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen hero-bg font-sans">
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} title="กลับไปหน้าเมนู" className="text-slate-400 hover:text-white p-1.5 -ml-1.5">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <img src="/logo-tcc-transparent.png" alt="TCC Technology Group — 25th Anniversary" className="h-24 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300 hidden md:block max-w-[160px] truncate">{user?.name || user?.email}</span>
            <button onClick={doLogout} title="ออกจากระบบ" className="text-slate-400 hover:text-white p-1.5">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <FadeInStagger className="flex flex-col items-center text-center">
          <FadeInItem>
            <div className="w-14 h-14 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center mx-auto mb-6">
              <Icon className="w-7 h-7" />
            </div>
          </FadeInItem>
          <FadeInItem>
            <p className="text-sky-400 text-sm font-medium mb-2">{subtitle}</p>
          </FadeInItem>
          <FadeInItem>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
              {title}
            </h1>
          </FadeInItem>
          <FadeInItem>
            <p className="text-slate-400 text-base mb-10">{description}</p>
          </FadeInItem>

          <FadeInItem className="w-full">
            <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-semibold text-white">ไฟล์แนบ</h2>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  อัปโหลดไฟล์
                </button>
                <input ref={fileRef} type="file" onChange={handleUpload} className="hidden" />
              </div>

              {error && <p className="text-sm text-rose-400 mb-3">{error}</p>}

              {loading && (
                <div className="flex justify-center py-8 text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}

              {!loading && files.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">ยังไม่มีไฟล์แนบสำหรับหัวข้อนี้</p>
              )}

              {!loading && files.length > 0 && (
                <ul className="space-y-2">
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                      <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white truncate">{f.filename}</div>
                        <div className="text-xs text-slate-500">
                          {formatSize(f.size)} · {f.uploaded_by_name || "-"} · {new Date(f.created_at).toLocaleDateString("th-TH")}
                        </div>
                      </div>
                      <button onClick={() => handleDownload(f)} title="ดาวน์โหลด" className="text-slate-400 hover:text-sky-400 p-1.5 shrink-0">
                        <Download className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FadeInItem>
        </FadeInStagger>
      </div>
    </div>
  );
}
