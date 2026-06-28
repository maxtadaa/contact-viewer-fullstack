import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import pool from "../config/db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// เก็บไฟล์ไว้ใน memory ไม่บันทึกลงดิสก์ (จำกัด 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// จับคู่ชื่อคอลัมน์ใน Excel เข้ากับ field ในฐานข้อมูล (รองรับไทย/อังกฤษ)
const HINTS = {
  name: ["name", "fullname", "ชื่อ", "ชื่อลูกค้า", "contact"],
  company: ["company", "บริษัท", "องค์กร", "หน่วยงาน"],
  phone: ["phone", "tel", "mobile", "เบอร์", "โทร"],
  email: ["email", "mail", "อีเมล"],
  address: ["address", "ที่อยู่", "จังหวัด"],
  note: ["note", "หมายเหตุ", "remark"],
};

function detectKey(headers, hints) {
  const lower = headers.map((h) => String(h).toLowerCase().trim());
  for (const hint of hints) {
    const idx = lower.findIndex((h) => h.includes(hint));
    if (idx !== -1) return headers[idx];
  }
  return null;
}

// POST /api/upload  (form-data, field name = "file")
router.post("/", verifyToken, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "ไม่พบไฟล์ที่อัปโหลด" });
  }

  try {
    const wb = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    if (!data.length) {
      return res.status(400).json({ error: "ไฟล์ไม่มีข้อมูล" });
    }

    const headers = Object.keys(data[0]);
    const map = {
      name: detectKey(headers, HINTS.name) || headers[0],
      company: detectKey(headers, HINTS.company),
      phone: detectKey(headers, HINTS.phone),
      email: detectKey(headers, HINTS.email),
      address: detectKey(headers, HINTS.address),
      note: detectKey(headers, HINTS.note),
    };

    // เตรียมข้อมูลสำหรับ bulk insert (ข้ามแถวที่ไม่มีชื่อ)
    const values = data
      .map((row) => [
        String(row[map.name] ?? "").trim(),
        map.company ? String(row[map.company] ?? "").trim() : null,
        map.phone ? String(row[map.phone] ?? "").trim() : null,
        map.email ? String(row[map.email] ?? "").trim() : null,
        map.address ? String(row[map.address] ?? "").trim() : null,
        map.note ? String(row[map.note] ?? "").trim() : null,
        req.user.id,
      ])
      .filter((v) => v[0]); // ต้องมีชื่อ

    if (!values.length) {
      return res.status(400).json({ error: "ไม่พบแถวที่มีชื่อลูกค้า" });
    }

    const [result] = await pool.query(
      `INSERT INTO customers (name, company, phone, email, address, note, imported_by)
       VALUES ?`,
      [values]
    );

    res.json({ inserted: result.affectedRows, mappedColumns: map });
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).json({ error: "ประมวลผลไฟล์ไม่สำเร็จ — รองรับเฉพาะ .xlsx, .xls, .csv" });
  }
});

export default router;
