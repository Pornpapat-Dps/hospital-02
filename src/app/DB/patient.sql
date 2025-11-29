CREATE TABLE patient (
    -- HN เป็น Primary Key (ไม่สร้างอัตโนมัติใน DB แต่ถูกบังคับให้ไม่ซ้ำกัน)
    hn VARCHAR(50) PRIMARY KEY, 
    
    name VARCHAR(255) NOT NULL,
    lastname VARCHAR(255),
    
    -- เพิ่ม: เพศ (แนะนำให้ใช้ ENUM ถ้ามีตัวเลือกจำกัด)
    gender VARCHAR(10), 
    
    -- เพิ่ม: วันเดือนปีเกิด
    date_of_birth DATE, 

    -- ข้อมูล Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);