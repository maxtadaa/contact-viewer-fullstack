import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// ใช้ connection pool เพื่อรองรับหลาย request พร้อมกัน
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

// ตรวจสอบการเชื่อมต่อตอนเริ่มเซิร์ฟเวอร์
export async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}

export default pool;
