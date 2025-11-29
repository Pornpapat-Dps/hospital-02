import { NextResponse } from "next/server";
import { queryApi, influxConfig } from "@/lib/influxdb";
import pool from "@/lib/db"; // 4 ระดับ // ตรวจสอบว่า path นี้ตรงกับไฟล์ db.js ของคุณ

/**
 * POST API Route: เพิ่มอุปกรณ์ใหม่
 * 1. ตรวจสอบว่ามีข้อมูลจาก Sensor (Measurement) นี้ใน InfluxDB จริงหรือไม่
 * 2. ถ้ามี -> บันทึก/อัปเดต ลงใน PostgreSQL (NeonDB)
 * 3. ส่งข้อมูลกลับไปให้ Frontend แสดงผล
 */
export async function POST(request) {
  try {
    console.log("--- DEBUG START ---");
    // 1. รับค่าจากหน้าบ้าน (Frontend)
    const { device_id, location, model } = await request.json();
    // 2. ทีนี้ค่อยสั่งปริ้นท์ค่าได้ เพราะตัวแปรมีอยู่จริงแล้ว
    console.log("1. Receiving Device ID:", device_id);
    console.log("2. Using Bucket:", influxConfig.bucket);
    // Validate: ต้องมี device_id ส่งมาเสมอ
    if (!device_id) {
      return NextResponse.json(
        { success: false, error: "device_id is required" },
        { status: 400 }
      );
    }

    // --- ขั้นตอนที่ 1: ตรวจสอบ InfluxDB (Verification) ---
    // ⚠️ จุดที่แก้ไข: ต้องใช้ r._measurement (มี Underscore ข้างหน้า)
    // แก้ไข Query: ใช้ start: 0 (เริ่มตั้งแต่ปี 1970) เพื่อกวาดหาทุกช่วงเวลา
    const measurementQuery = `
            from(bucket: "${influxConfig.bucket}")
                |> range(start: 0) 
                |> filter(fn: (r) => r["_measurement"] == "${device_id}")
                |> limit(n: 1)
        `;

    const measurements = await queryApi.collectRows(measurementQuery);
    console.log("🔎 Found records:", measurements.length); // Debug ดู
    // ถ้า Array ว่างเปล่า = ไม่พบชื่อนี้ใน InfluxDB
    if (measurements.length === 0) {
      console.warn(
        `InfluxDB check failed: Measurement "${device_id}" not found.`
      );
      return NextResponse.json(
        {
          success: false,
          error: `ไม่พบอุปกรณ์ ID "${device_id}" ในระบบ InfluxDB (กรุณาเปิดเครื่อง Sensor ก่อน)`,
        },
        { status: 404 }
      );
    }

    // --- ขั้นตอนที่ 2: บันทึกลง PostgreSQL (NeonDB) ---
    // ใช้ SQL แบบ UPSERT (ถ้าซ้ำให้อัปเดต, ถ้าไม่มีให้สร้างใหม่)

    const query = `
            INSERT INTO device (device_id, location, model) 
            VALUES ($1, $2, $3) 
            ON CONFLICT (device_id) 
            DO UPDATE SET 
                location = EXCLUDED.location, 
                model = EXCLUDED.model 
            RETURNING *;
        `;

    // รับค่า location และ model (ถ้าไม่มีให้เป็น null)
    const values = [device_id, location || null, model || null];

    // รันคำสั่ง SQL จริง
    const result = await pool.query(query, values);

    // ข้อมูลแถวแรกที่ได้จากการบันทึก
    const savedDevice = result.rows[0];

    // --- ขั้นตอนที่ 3: ส่งผลลัพธ์กลับไปหน้าบ้าน ---
    return NextResponse.json({
      success: true,
      message: `เพิ่มอุปกรณ์ ${device_id} สำเร็จ!`,
      data: savedDevice, // ส่งข้อมูลจริงกลับไปแสดงผล
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในระบบ: " + error.message },
      { status: 500 }
    );
  }
}
export async function GET(request) {
    
}