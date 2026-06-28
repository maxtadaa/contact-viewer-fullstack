# Contact Viewer — Backend (Express + MySQL + Microsoft Login)

ระบบเก็บข้อมูลคอนแทคลูกค้าถาวร นำเข้าจากไฟล์ Excel เข้า MySQL พร้อมล็อกอินด้วย Microsoft

## สิ่งที่ต้องมีก่อน
- Node.js 18 ขึ้นไป
- MySQL 8 (ติดตั้งในเครื่อง หรือใช้ผ่าน Docker / XAMPP ก็ได้)
- Azure / Microsoft Entra ID app registration สำหรับ OAuth Client ID

## ขั้นตอนติดตั้ง

### 1. ติดตั้ง dependencies
```bash
cd server
npm install
```

### 2. สร้างฐานข้อมูล
```bash
mysql -u root -p < schema.sql
```

### 3. ตั้งค่า environment
```bash
cp .env.example .env
```
แล้วแก้ค่าใน `.env` ให้ตรงกับเครื่องคุณ (รหัส MySQL, MS_CLIENT_ID, JWT_SECRET)

สุ่ม JWT_SECRET ได้ด้วย:
```bash
openssl rand -hex 32
```

### 4. ตั้งค่า Microsoft / Outlook (Microsoft Entra ID)
1. ไปที่ https://portal.azure.com/ → ค้นหา **Microsoft Entra ID** (เดิมชื่อ Azure AD)
2. เมนู **App registrations → New registration**
3. ตั้งชื่อแอป แล้วที่ **Supported account types** เลือก
   *"Accounts in this organizational directory only"* (จำกัดเฉพาะคนในองค์กร)
4. ที่ **Redirect URI** เลือกชนิด **Single-page application (SPA)** แล้วใส่ `http://localhost:5173`
5. หลังสร้างเสร็จ คัดลอกค่าไปใส่ `.env`:
   - **Application (client) ID** → `MS_CLIENT_ID`
   - **Directory (tenant) ID** → `MS_TENANT_ID`
6. ฝั่ง frontend ใช้ค่า client id และ tenant id เดียวกันนี้ใน MSAL

> การใส่ `MS_TENANT_ID` ทำให้ระบบล็อกอินได้เฉพาะบัญชีในองค์กรเท่านั้น ซึ่งเหมาะกับระบบภายใน

### 5. รันเซิร์ฟเวอร์
```bash
npm run dev     # โหมดพัฒนา (auto-reload)
# หรือ
npm start
```
เซิร์ฟเวอร์จะรันที่ http://localhost:4000

## API ทั้งหมด

| Method | Endpoint | คำอธิบาย | ต้องล็อกอิน |
|--------|----------|----------|:---:|
| GET  | `/api/health` | เช็คสถานะ | - |
| POST | `/api/auth/microsoft` | ส่ง Microsoft id_token → รับ JWT | - |
| POST | `/api/upload` | อัปโหลด Excel (form-data: `file`) | ✓ |
| GET  | `/api/customers` | ดูรายชื่อ (`?search=&company=&page=&perPage=`) | ✓ |
| GET  | `/api/customers/companies` | รายชื่อบริษัทไม่ซ้ำ | ✓ |
| GET  | `/api/customers/:id` | รายละเอียดรายเดียว | ✓ |
| PUT  | `/api/customers/:id` | แก้ไข | ✓ |
| DELETE | `/api/customers/:id` | ลบ | ✓ |

ทุก request ที่ต้องล็อกอิน ให้แนบ header:
```
Authorization: Bearer <JWT ที่ได้จาก /api/auth/microsoft>
```

## โครงสร้างไฟล์
```
server/
├── package.json
├── schema.sql
├── .env.example
└── src/
    ├── index.js              จุดเริ่มเซิร์ฟเวอร์
    ├── config/db.js          เชื่อม MySQL (pool)
    ├── middleware/verifyToken.js   ตรวจ JWT
    └── routes/
        ├── auth.js           ล็อกอิน Microsoft
        ├── upload.js         นำเข้า Excel
        └── customers.js      CRUD ลูกค้า
```

## หมายเหตุ
- ไฟล์ Excel จะถูก "อ่านแล้วเก็บลง MySQL" ไม่ได้บันทึกตัวไฟล์ไว้ ข้อมูลจึงอยู่ถาวรในฐานข้อมูล
- การจับคู่คอลัมน์อัตโนมัติรองรับหัวคอลัมน์ทั้งไทยและอังกฤษ (ชื่อ/บริษัท/เบอร์/อีเมล/ที่อยู่/หมายเหตุ)
- ตอน deploy จริง ควรเปลี่ยน CLIENT_ORIGIN และ redirect URI ใน Azure Portal ให้เป็นโดเมนจริง
