# Contact Viewer — Frontend (React + Vite)

หน้าเว็บสำหรับดูข้อมูลคอนแทคลูกค้า ล็อกอินด้วย Microsoft (Outlook)
ต่อกับ backend ในโฟลเดอร์ `../server`

## ติดตั้งและรัน

```bash
cd client
npm install
cp .env.example .env      # แล้วแก้ค่าให้ตรงกับ Client ID ของคุณ
npm run dev               # เปิดที่ http://localhost:5173
```

> ต้องรัน backend (โฟลเดอร์ `server`) ควบคู่ไปด้วย ที่ http://localhost:4000

## ค่าใน .env
- `VITE_API_BASE` — ที่อยู่ backend (ค่าเริ่มต้น http://localhost:4000/api)
- `VITE_MS_CLIENT_ID` / `VITE_MS_TENANT_ID` — ตัวเดียวกับฝั่ง server

## ฟีเจอร์
- หน้า Login มีปุ่ม Microsoft
- นำเข้าไฟล์ Excel (.xlsx/.xls/.csv) เข้า MySQL ผ่าน backend
- ค้นหา กรองตามบริษัท แบ่งหน้า
- ดูรายละเอียด แก้ไข ลบ
- ล็อกอินค้างไว้ (เก็บ JWT ใน localStorage) และออกจากระบบได้

## โครงสร้าง
```
client/
├── index.html
├── vite.config.js / tailwind.config.js / postcss.config.js
├── .env.example
└── src/
    ├── main.jsx          จุดเริ่มแอป
    ├── App.jsx           สลับ Login / Dashboard
    ├── api.js            เรียก backend + จัดการ token
    ├── auth/msal.js      ตัวเชื่อม Microsoft (MSAL)
    └── pages/
        ├── Login.jsx
        └── Dashboard.jsx
```
