import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

const TOPIC_KEY_RE = /^[a-z0-9-]{1,50}$/;

function checkKey(req, res, next) {
  if (!TOPIC_KEY_RE.test(req.params.key)) {
    return res.status(400).json({ error: "topic key ไม่ถูกต้อง" });
  }
  next();
}

// multer ส่ง originalname เป็น latin1 — แปลงกลับเป็น utf8
function fixName(name) {
  try {
    return Buffer.from(name, "latin1").toString("utf8");
  } catch {
    return name;
  }
}

function setContentDisposition(res, disposition, filename) {
  const encoded = encodeURIComponent(filename);
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename*=UTF-8''${encoded}; filename="${encoded}"`
  );
}

// POST /api/topics/:key/files
router.post("/:key/files", verifyToken, checkKey, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "ไม่พบไฟล์ที่อัปโหลด" });
  }
  const originalName = fixName(req.file.originalname);
  try {
    const [result] = await pool.query(
      `INSERT INTO topic_files (topic_key, filename, stored_name, mime_type, size, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.key, originalName, req.file.filename, req.file.mimetype, req.file.size, req.user.id]
    );
    res.json({
      id: result.insertId,
      filename: originalName,
      size: req.file.size,
      created_at: new Date().toISOString(),
      uploaded_by_name: req.user.name,
    });
  } catch (err) {
    console.error("Topic file upload error:", err.message);
    res.status(500).json({ error: "อัปโหลดไฟล์ไม่สำเร็จ" });
  }
});

// GET /api/topics/:key/files
router.get("/:key/files", verifyToken, checkKey, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tf.id, tf.filename, tf.mime_type, tf.size, tf.created_at, u.name AS uploaded_by_name
       FROM topic_files tf
       LEFT JOIN users u ON u.id = tf.uploaded_by
       WHERE tf.topic_key = ?
       ORDER BY tf.created_at DESC`,
      [req.params.key]
    );
    res.json(rows);
  } catch (err) {
    console.error("List topic files error:", err.message);
    res.status(500).json({ error: "ดึงรายการไฟล์ไม่สำเร็จ" });
  }
});

// GET /api/topics/:key/files/:id/download
router.get("/:key/files/:id/download", verifyToken, checkKey, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM topic_files WHERE id = ? AND topic_key = ?",
      [req.params.id, req.params.key]
    );
    const file = rows[0];
    if (!file) return res.status(404).json({ error: "ไม่พบไฟล์" });
    setContentDisposition(res, "attachment", file.filename);
    res.setHeader("Content-Type", file.mime_type || "application/octet-stream");
    fs.createReadStream(path.join(UPLOAD_DIR, file.stored_name)).pipe(res);
  } catch (err) {
    console.error("Download topic file error:", err.message);
    res.status(500).json({ error: "ดาวน์โหลดไฟล์ไม่สำเร็จ" });
  }
});

// GET /api/topics/:key/files/:id/view  — เปิดดูใน browser (inline)
router.get("/:key/files/:id/view", verifyToken, checkKey, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM topic_files WHERE id = ? AND topic_key = ?",
      [req.params.id, req.params.key]
    );
    const file = rows[0];
    if (!file) return res.status(404).json({ error: "ไม่พบไฟล์" });
    setContentDisposition(res, "inline", file.filename);
    res.setHeader("Content-Type", file.mime_type || "application/octet-stream");
    fs.createReadStream(path.join(UPLOAD_DIR, file.stored_name)).pipe(res);
  } catch (err) {
    console.error("View topic file error:", err.message);
    res.status(500).json({ error: "เปิดไฟล์ไม่สำเร็จ" });
  }
});

// DELETE /api/topics/:key/files/:id
router.delete("/:key/files/:id", verifyToken, checkKey, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM topic_files WHERE id = ? AND topic_key = ?",
      [req.params.id, req.params.key]
    );
    const file = rows[0];
    if (!file) return res.status(404).json({ error: "ไม่พบไฟล์" });

    const filePath = path.join(UPLOAD_DIR, file.stored_name);
    await pool.query("DELETE FROM topic_files WHERE id = ?", [req.params.id]);
    fs.unlink(filePath, () => {});

    res.json({ ok: true });
  } catch (err) {
    console.error("Delete topic file error:", err.message);
    res.status(500).json({ error: "ลบไฟล์ไม่สำเร็จ" });
  }
});

export default router;
