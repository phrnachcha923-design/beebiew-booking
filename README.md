# BeeBiew Booking Premium V3

เว็บไซต์จองคิวสไตล์ Luxury Pink / Glassmorphism / Rose Gold พร้อมหน้า Landing, About, Booking, Status และ Admin

## เปิดใช้งานทันที
เปิด `index.html` หรือ Deploy โฟลเดอร์นี้บน Vercel / GitHub Pages

## หน้าเว็บ
- `index.html` หน้าแรกและ Dashboard
- `about.html` เรื่องราวแบรนด์และขั้นตอนการจอง
- `booking.html` ฟอร์มจอง จำกัด 2 คิวต่อวัน
- `status.html` ตรวจสอบสถานะด้วยรหัสการจอง + เบอร์โทร
- `admin.html` อนุมัติ/ปฏิเสธ/ค้นหา/ส่งออก CSV

## แอดมิน
PIN เริ่มต้น: `2468`
ควรเปลี่ยนค่า `ADMIN_PIN` ใน `script.js` ก่อนใช้งาน

## ข้อสำคัญเกี่ยวกับข้อมูล
เวอร์ชันนี้ทำงานได้ทันทีด้วย Local Storage ข้อมูลจึงอยู่เฉพาะเบราว์เซอร์และอุปกรณ์ที่ใช้จอง ไม่แชร์ข้ามเครื่อง

สำหรับใช้งานเชิงพาณิชย์จริงแบบหลายอุปกรณ์ ควรเชื่อม Supabase/Firebase และระบบแจ้งเตือน LINE, SMS หรืออีเมล โดยต้องใช้บัญชีและคีย์ของเจ้าของระบบ
