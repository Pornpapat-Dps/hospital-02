CREATE TABLE device (
    device_id VARCHAR(100) PRIMARY KEY, -- ID ที่เชื่อมกับ InfluxDB Measurement
    location VARCHAR(100),             -- ตำแหน่งที่ติดตั้ง เช่น "ICU Bed 5"
    model VARCHAR(100),                -- รุ่นของเซนเซอร์ เช่น "SmartPatch S2024"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);