import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import customerRoutes from "./routes/customers.js";
import topicFilesRoutes from "./routes/topicFiles.js";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// เช็คสถานะเซิร์ฟเวอร์
app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/topics", topicFilesRoutes);

const PORT = process.env.PORT || 4000;

testConnection()
  .then(() => {
    app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ เชื่อมต่อ MySQL ไม่สำเร็จ:", err.message);
    process.exit(1);
  });
