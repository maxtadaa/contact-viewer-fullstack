import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

// ---------- helper: บันทึก/อัปเดตผู้ใช้ แล้วออก JWT ----------
async function upsertUserAndIssueToken({ provider, providerId, email, name, picture }) {
  await pool.query(
    `INSERT INTO users (provider, provider_id, email, name, picture)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name), picture = VALUES(picture)`,
    [provider, providerId, email, name, picture]
  );

  const [rows] = await pool.query(
    "SELECT * FROM users WHERE provider = ? AND provider_id = ?",
    [provider, providerId]
  );
  const user = rows[0];

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, provider },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, picture: user.picture, provider },
  };
}

// ==================== Microsoft (Outlook) ====================
// ถ้าตั้ง MS_TENANT_ID = id ของ tenant องค์กร จะตรวจสอบเข้มงวดเฉพาะ tenant นั้น
// ถ้าไม่ตั้ง จะใช้ "common" (รับได้ทุก tenant)
const tenant = process.env.MS_TENANT_ID || "common";
const msJwks = createRemoteJWKSet(
  new URL(`https://login.microsoftonline.com/${tenant}/discovery/v2.0/keys`)
);

// POST /api/auth/microsoft  { credential: <id_token จาก MSAL> }
router.post("/microsoft", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: "ไม่พบ credential" });

    const verifyOpts = { audience: process.env.MS_CLIENT_ID };
    // ถ้าระบุ tenant ชัดเจน ให้ตรวจ issuer ด้วยเพื่อความปลอดภัย
    if (process.env.MS_TENANT_ID) {
      verifyOpts.issuer = `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/v2.0`;
    }

    const { payload: p } = await jwtVerify(credential, msJwks, verifyOpts);

    // oid = id ผู้ใช้ที่คงที่ใน tenant; อีเมลอาจอยู่หลาย claim
    const email = p.email || p.preferred_username || p.upn || null;

    const result = await upsertUserAndIssueToken({
      provider: "microsoft",
      providerId: p.oid || p.sub,
      email,
      name: p.name,
      picture: null,
    });
    res.json(result);
  } catch (err) {
    console.error("Microsoft auth error:", err.message);
    res.status(401).json({ error: "เข้าสู่ระบบด้วย Microsoft ไม่สำเร็จ" });
  }
});

// ==================== Demo / ทดลองดู UI (ไม่ผ่าน Microsoft จริง) ====================
// เปิดใช้ได้เฉพาะตอนตั้ง ENABLE_DEV_LOGIN=true ใน .env (ห้ามเปิดบน production)
router.post("/dev-login", async (req, res) => {
  if (process.env.ENABLE_DEV_LOGIN !== "true") {
    return res.status(403).json({ error: "ปิดการใช้งานโหมดทดลอง" });
  }
  try {
    const result = await upsertUserAndIssueToken({
      provider: "demo",
      providerId: "demo-user",
      email: "demo@example.com",
      name: "ผู้ใช้ทดลอง",
      picture: null,
    });
    res.json(result);
  } catch (err) {
    console.error("Dev login error:", err.message);
    res.status(500).json({ error: "เข้าสู่ระบบทดลองไม่สำเร็จ" });
  }
});

export default router;
