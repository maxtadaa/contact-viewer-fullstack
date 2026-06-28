# ระบบ Share Knowledge Base Servicedesk

นำเข้าข้อมูลลจากไฟล์ Excel word powerpoint เก็บถาวรใน MySQL ดู/ค้นหา/แก้ไขผ่านเว็บ
ล็อกอินด้วย Microsoft (Outlook)

## โครงสร้าง
- `server/` — backend (Express + MySQL + ตรวจสอบ Microsoft token)
- `client/` — frontend (React + Vite)

## เริ่มใช้งาน (สรุป)
1. **Database**: `mysql -u root -p < server/schema.sql`
2. **Backend**: `cd server && npm install && cp .env.example .env` (แก้ค่า) → `npm run dev`
3. **Frontend**: `cd client && npm install && cp .env.example .env` (แก้ค่า) → `npm run dev`
4. เปิด http://localhost:5173

รายละเอียดการตั้งค่า Microsoft OAuth อยู่ใน `server/README.md`
