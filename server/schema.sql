-- รันไฟล์นี้ครั้งเดียวเพื่อสร้างฐานข้อมูลและตาราง
-- วิธีรัน:  mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS contact_viewer
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE contact_viewer;

-- ผู้ใช้ที่ล็อกอินด้วย Microsoft (Outlook)
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  provider     VARCHAR(20)  NOT NULL,           -- 'microsoft'
  provider_id  VARCHAR(255) NOT NULL,           -- id ของผู้ใช้จากผู้ให้บริการนั้น
  email        VARCHAR(255),
  name         VARCHAR(255),
  picture      VARCHAR(500),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_provider_user (provider, provider_id),
  INDEX idx_email (email)
);

-- ข้อมูลลูกค้าที่นำเข้าจาก Excel
CREATE TABLE IF NOT EXISTS customers (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  company      VARCHAR(255),
  phone        VARCHAR(50),
  email        VARCHAR(255),
  address      TEXT,
  note         TEXT,
  imported_by  INT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (imported_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_name (name),
  INDEX idx_company (company)
);

-- ไฟล์ที่อัปโหลดแนบไว้ในแต่ละหน้าหัวข้อ (เก็บไฟล์จริงไว้ที่ server/uploads, เก็บ metadata ไว้ที่นี่)
CREATE TABLE IF NOT EXISTS topic_files (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  topic_key    VARCHAR(50) NOT NULL,
  filename     VARCHAR(255) NOT NULL,
  stored_name  VARCHAR(255) NOT NULL,
  mime_type    VARCHAR(100),
  size         INT,
  uploaded_by  INT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_topic_key (topic_key)
);
