const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

// เก็บ token ไว้ใน localStorage เพื่อให้ล็อกอินค้างไว้
export function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}
export function getToken() {
  return localStorage.getItem("token");
}
export function getUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function handle(res) {
  if (res.status === 401) {
    clearSession();
    window.location.reload();
    throw new Error("เซสชันหมดอายุ");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "เกิดข้อผิดพลาด");
  }
  return res.json();
}

// ---------- Auth ----------
export async function loginWithMicrosoft(credential) {
  const res = await fetch(`${BASE}/auth/microsoft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  const data = await handle(res);
  setSession(data.token, data.user);
  return data.user;
}

export async function loginDemo() {
  const res = await fetch(`${BASE}/auth/dev-login`, { method: "POST" });
  const data = await handle(res);
  setSession(data.token, data.user);
  return data.user;
}

// ---------- Excel ----------
export async function uploadExcel(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  return handle(res); // { inserted, mappedColumns }
}

// ---------- Customers ----------
export async function getCustomers({ search = "", company = "", page = 1, perPage = 10 } = {}) {
  const q = new URLSearchParams({ search, company, page, perPage });
  const res = await fetch(`${BASE}/customers?${q}`, { headers: authHeaders() });
  return handle(res);
}
export async function getCompanies() {
  const res = await fetch(`${BASE}/customers/companies`, { headers: authHeaders() });
  return handle(res);
}
export async function updateCustomer(id, body) {
  const res = await fetch(`${BASE}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return handle(res);
}
export async function deleteCustomer(id) {
  const res = await fetch(`${BASE}/customers/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(res);
}

// ---------- Topic files ----------
export async function uploadTopicFile(key, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/topics/${key}/files`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  return handle(res);
}

export async function getTopicFiles(key) {
  const res = await fetch(`${BASE}/topics/${key}/files`, { headers: authHeaders() });
  return handle(res);
}

export async function downloadTopicFile(key, id, filename) {
  const res = await fetch(`${BASE}/topics/${key}/files/${id}/download`, { headers: authHeaders() });
  if (!res.ok) throw new Error("ดาวน์โหลดไฟล์ไม่สำเร็จ");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function deleteTopicFile(key, id) {
  const res = await fetch(`${BASE}/topics/${key}/files/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(res);
}

export async function viewTopicFile(key, id) {
  const res = await fetch(`${BASE}/topics/${key}/files/${id}/view`, { headers: authHeaders() });
  if (!res.ok) throw new Error("เปิดไฟล์ไม่สำเร็จ");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
}
