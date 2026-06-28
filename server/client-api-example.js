// ตัวอย่างฟังก์ชันฝั่ง React สำหรับเชื่อมกับ backend
// วางไฟล์นี้ไว้ที่ client/src/api.js

const BASE = "http://localhost:4000/api";

// เก็บ/อ่าน token ไว้ใน memory (production ควรพิจารณา httpOnly cookie)
let token = null;
export function setToken(t) { token = t; }
export function getToken() { return token; }

function authHeaders() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- ล็อกอิน Microsoft (Outlook) ---
// credential = id_token ที่ได้จาก MSAL (ดูตัวอย่าง MSAL ด้านล่างสุดของไฟล์)
export async function loginWithMicrosoft(credential) {
  const res = await fetch(`${BASE}/auth/microsoft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  if (!res.ok) throw new Error("เข้าสู่ระบบไม่สำเร็จ");
  const data = await res.json();
  setToken(data.token);
  return data.user;
}

// --- อัปโหลด Excel ---
export async function uploadExcel(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json(); // { inserted, mappedColumns }
}

// --- ดึงรายชื่อลูกค้า ---
export async function getCustomers({ search = "", company = "", page = 1, perPage = 10 } = {}) {
  const q = new URLSearchParams({ search, company, page, perPage });
  const res = await fetch(`${BASE}/customers?${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");
  return res.json(); // { data, total, page, perPage, totalPages }
}

export async function getCompanies() {
  const res = await fetch(`${BASE}/customers/companies`, { headers: authHeaders() });
  return res.json(); // string[]
}

export async function getCustomer(id) {
  const res = await fetch(`${BASE}/customers/${id}`, { headers: authHeaders() });
  return res.json();
}

export async function updateCustomer(id, body) {
  const res = await fetch(`${BASE}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`${BASE}/customers/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return res.json();
}

/* ============================================================
   ตัวอย่างการดึง id_token จาก Microsoft ด้วย MSAL (ฝั่ง frontend)
   ติดตั้ง:  npm install @azure/msal-browser
   ------------------------------------------------------------
   import { PublicClientApplication } from "@azure/msal-browser";

   const msal = new PublicClientApplication({
     auth: {
       clientId: "MS_CLIENT_ID ของคุณ",
       authority: "https://login.microsoftonline.com/MS_TENANT_ID ของคุณ",
       redirectUri: "http://localhost:5173",
     },
   });
   await msal.initialize();

   async function signInMicrosoft() {
     const result = await msal.loginPopup({ scopes: ["openid", "profile", "email"] });
     // ส่ง idToken ไปให้ backend ตรวจสอบ
     const user = await loginWithMicrosoft(result.idToken);
     return user;
   }
   ============================================================ */
