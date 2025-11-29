CREATE TABLE assign_device (
    id SERIAL PRIMARY KEY,
    hn VARCHAR(50) NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    patient_lastname VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    discharged_at TIMESTAMP WITH TIME ZONE,

    -- Foreign Keys เดิม (สมมติว่าตาราง patient และ device ถูกสร้างแล้ว)
    FOREIGN KEY (hn) REFERENCES patient(hn) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (device_id) REFERENCES device(device_id) ON UPDATE CASCADE ON DELETE RESTRICT
);