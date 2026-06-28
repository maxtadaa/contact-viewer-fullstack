import express from "express";
import pool from "../config/db.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// ทุก route ในไฟล์นี้ต้องล็อกอินก่อน
router.use(verifyToken);

// GET /api/customers?search=&company=&page=1&perPage=10
// ดูรายชื่อลูกค้า พร้อมค้นหา/กรอง/แบ่งหน้า
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const company = (req.query.company || "").trim();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage) || 10));
    const offset = (page - 1) * perPage;

    const where = [];
    const params = [];

    if (search) {
      where.push("(name LIKE ? OR company LIKE ? OR phone LIKE ? OR email LIKE ?)");
      const like = `%${search}%`;
      params.push(like, like, like, like);
    }
    if (company) {
      where.push("company = ?");
      params.push(company);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // นับจำนวนทั้งหมด (สำหรับ pagination)
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM customers ${whereSql}`,
      params
    );

    // ดึงข้อมูลหน้าปัจจุบัน
    const [rows] = await pool.query(
      `SELECT * FROM customers ${whereSql} ORDER BY name ASC LIMIT ? OFFSET ?`,
      [...params, perPage, offset]
    );

    res.json({ data: rows, total, page, perPage, totalPages: Math.ceil(total / perPage) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "ดึงข้อมูลไม่สำเร็จ" });
  }
});

// GET /api/customers/companies  — รายชื่อบริษัทไม่ซ้ำ (สำหรับ dropdown กรอง)
router.get("/companies", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT DISTINCT company FROM customers WHERE company IS NOT NULL AND company <> '' ORDER BY company"
  );
  res.json(rows.map((r) => r.company));
});

// GET /api/customers/:id  — รายละเอียดลูกค้ารายเดียว
router.get("/:id", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM customers WHERE id = ?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: "ไม่พบลูกค้า" });
  res.json(rows[0]);
});

// PUT /api/customers/:id  — แก้ไขข้อมูล
router.put("/:id", async (req, res) => {
  const { name, company, phone, email, address, note } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "ต้องระบุชื่อ" });
  }
  const [result] = await pool.query(
    `UPDATE customers SET name=?, company=?, phone=?, email=?, address=?, note=? WHERE id=?`,
    [name, company || null, phone || null, email || null, address || null, note || null, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: "ไม่พบลูกค้า" });
  res.json({ updated: true });
});

// DELETE /api/customers/:id  — ลบลูกค้า
router.delete("/:id", async (req, res) => {
  const [result] = await pool.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: "ไม่พบลูกค้า" });
  res.json({ deleted: true });
});

export default router;
