# BeeBiew Booking V4 Commercial

เว็บไซต์ Luxury Pink พร้อมหน้า Landing, About, Booking, Status และ Admin

## เชื่อม Supabase
1. เปิด Supabase > SQL Editor แล้ว Run ไฟล์ `supabase/setup.sql`
2. เปิด `config.js` แล้วแทน `วาง_PUBLISHABLE_KEY_ที่นี่` ด้วย Publishable Key
3. เปิด Supabase > Authentication > Users แล้วสร้างผู้ใช้แอดมิน
4. อัปโหลดไฟล์ทั้งหมดขึ้น GitHub แล้ว Vercel จะ Deploy อัตโนมัติ

> ห้ามใส่ Secret key หรือ service_role key ในไฟล์เว็บไซต์

หากยังไม่ใส่ Key เว็บไซต์จะทำงานโหมดทดลองด้วย Local Storage บนอุปกรณ์นั้น
