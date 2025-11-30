-- สร้าง Enum สำหรับ Role เพื่อป้องกันการกรอกผิด
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'staff');

CREATE TABLE users (
    -- 1. Identity
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE, -- ใช้สำหรับ Login (เช่น nurse_ward8)
    password_hash VARCHAR(255) NOT NULL, -- ⚠️ เก็บ Hash เท่านั้น (Bcrypt) ห้ามเก็บ Plain Text
    employee_id VARCHAR(20) UNIQUE, -- รหัสพนักงาน (เช่น 'NS-44021' ตามใน Sidebar)

    -- 2. Profile Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE, -- เผื่อไว้สำหรับการแจ้งเตือน หรือ Reset password

    -- 3. Authorization & Location (สำคัญมากสำหรับ Monitor)
    role user_role NOT NULL DEFAULT 'nurse',
    department VARCHAR(100), -- แผนก เช่น 'IPD', 'ER', 'ICU'
    ward VARCHAR(100),       -- วอร์ด เช่น 'VIP Ward 8'
    station VARCHAR(100),    -- Station เช่น 'Station A'

    -- 4. Status & Audit
    is_active BOOLEAN DEFAULT TRUE, -- ใช้ปิดการใช้งานแทนการลบ (Soft Delete)
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง Index เพื่อให้ Login เร็วขึ้น
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_employee_id ON users(employee_id);