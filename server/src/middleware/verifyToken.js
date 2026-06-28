import jwt from "jsonwebtoken";

// ตรวจสอบ JWT ที่ส่งมาใน header: Authorization: Bearer <token>
export default function verifyToken(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "ไม่พบ token กรุณาเข้าสู่ระบบ" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: "token ไม่ถูกต้องหรือหมดอายุ" });
  }
}
