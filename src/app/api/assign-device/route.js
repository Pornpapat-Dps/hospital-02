import { NextResponse } from "next/server";
import { queryApi, influxConfig } from "@/lib/influxdb";
import pool from "@/lib/db";

// ==========================================
// POST: กำหนดเซนเซอร์ให้กับผู้ป่วย
// ==========================================
export async function POST(request) {
  const client = await pool.connect();

  try {
    // 1. รับข้อมูลจาก Frontend
    const {
      device_id,
      location,
      model,
      hn,
      patient_name,
      patient_lastname,
      gender,
      date_of_birth,
    } = await request.json();

    // 2. Validate Required Fields
    if (!device_id) {
      return NextResponse.json(
        { success: false, error: "device_id is required" },
        { status: 400 }
      );
    }

    if (!hn || !patient_name) {
      return NextResponse.json(
        { success: false, error: "hn and patient_name are required" },
        { status: 400 }
      );
    }

    // 3. ตรวจสอบว่า Device มีใน InfluxDB หรือไม่
    const sanitizedDeviceId = device_id.replace(/["\\]/g, "");
    const measurementQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: -30d)
        |> filter(fn: (r) => r["_measurement"] == "${sanitizedDeviceId}")
        |> limit(n: 1)
    `;

    const measurements = await queryApi.collectRows(measurementQuery);
    console.log(`🔎 [${device_id}] InfluxDB Records:`, measurements.length);

    if (measurements.length === 0) {
      console.warn(`❌ Device "${device_id}" not found in InfluxDB`);
      return NextResponse.json(
        {
          success: false,
          error: `ไม่พบอุปกรณ์ "${device_id}" ใน InfluxDB (กรุณาเปิดเซนเซอร์ก่อน)`,
        },
        { status: 404 }
      );
    }

    // 4. เริ่ม Transaction
    await client.query("BEGIN");

    try {
      // 4.1 บันทึก/อัปเดต Patient
      const patientQuery = `
        INSERT INTO patient (hn, name, lastname, gender, date_of_birth)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (hn) 
        DO UPDATE SET 
          name = EXCLUDED.name,
          lastname = EXCLUDED.lastname,
          gender = EXCLUDED.gender,
          date_of_birth = EXCLUDED.date_of_birth
        RETURNING *;
      `;

      const patientResult = await client.query(patientQuery, [
        hn,
        patient_name,
        patient_lastname || null,
        gender || null,
        date_of_birth || null,
      ]);
      console.log(`✅ Patient ${hn} saved`);

      // 4.2 บันทึก/อัปเดต Device
      const deviceQuery = `
        INSERT INTO device (device_id, location, model)
        VALUES ($1, $2, $3)
        ON CONFLICT (device_id) 
        DO UPDATE SET 
          location = EXCLUDED.location,
          model = EXCLUDED.model
        RETURNING *;
      `;

      const deviceResult = await client.query(deviceQuery, [
        device_id,
        location || null,
        model || null,
      ]);
      console.log(`✅ Device ${device_id} saved`);

      // 4.3 ตรวจสอบว่า Device ถูกใช้งานอยู่หรือไม่
      const checkActiveQuery = `
        SELECT * FROM assign_device 
        WHERE device_id = $1 AND status = 'active'
        LIMIT 1;
      `;
      const activeCheck = await client.query(checkActiveQuery, [device_id]);

      if (activeCheck.rows.length > 0) {
        const existing = activeCheck.rows[0];
        throw new Error(
          `เซนเซอร์ ${device_id} กำลังใช้งานกับ ${existing.patient_name} (HN: ${existing.hn})`
        );
      }

      // 4.4 สร้าง Assignment
      const assignQuery = `
        INSERT INTO assign_device (hn, device_id, patient_name, patient_lastname, status)
        VALUES ($1, $2, $3, $4, 'active')
        RETURNING *;
      `;

      const assignResult = await client.query(assignQuery, [
        hn,
        device_id,
        patient_name,
        patient_lastname || null,
      ]);
      console.log(`✅ Assignment: ${device_id} → ${patient_name}`);

      // 5. Commit Transaction
      await client.query("COMMIT");

      // 6. ส่งผลลัพธ์
      return NextResponse.json({
        success: true,
        message: `กำหนด "${patient_name}" (HN: ${hn}) ให้ ${device_id} สำเร็จ!`,
        data: {
          patient: patientResult.rows[0],
          device: deviceResult.rows[0],
          assignment: assignResult.rows[0],
        },
      }, { status: 200 });

    } catch (txError) {
      await client.query("ROLLBACK");
      console.error("❌ Transaction Error:", txError.message);
      throw txError;
    }

  } catch (error) {
    console.error("❌ POST API Error:", error.message);
    const isDev = process.env.NODE_ENV === "development";
    
    return NextResponse.json({
      success: false,
      error: isDev ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่",
    }, { status: 500 });

  } finally {
    client.release();
  }
}

// ==========================================
// GET: ดึงข้อมูลเซนเซอร์
// - ไม่ระบุ device_id = Dashboard (ทั้งหมด)
// - ระบุ device_id = Detail Page (ข้อมูลย้อนหลัง)
// ==========================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const device_id = searchParams.get("device_id");
    const range = searchParams.get("range") || "-1h";
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    // ==========================================
    // Mode 1: Dashboard (ดูทั้งหมด)
    // ==========================================
    if (!device_id) {
      return await getDashboardData();
    }

    // ==========================================
    // Mode 2: Detail Page (ดูข้อมูลเฉพาะตัว)
    // ==========================================
    return await getDeviceDetail(device_id, range, start, end);

  } catch (error) {
    console.error("❌ GET API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ==========================================
// Helper: ดึงข้อมูล Dashboard
// ==========================================
async function getDashboardData() {
  // 1. ดึงข้อมูล Device + Assignment จาก PostgreSQL
  const postgresQuery = `
    SELECT 
      d.*,
      a.id as assignment_id,
      a.hn,
      a.patient_name,
      a.patient_lastname,
      a.status as assignment_status,
      a.assigned_at,
      p.gender,
      p.date_of_birth
    FROM device d
    LEFT JOIN assign_device a ON d.device_id = a.device_id AND a.status = 'active'
    LEFT JOIN patient p ON a.hn = p.hn
    ORDER BY d.device_id ASC;
  `;

  // 2. ดึงค่าล่าสุดจาก InfluxDB
  const fluxQuery = `
    from(bucket: "${influxConfig.bucket}")
      |> range(start: -1h)
      |> filter(fn: (r) => 
        r["_field"] == "heart_rate" or 
        r["_field"] == "temperature" or 
        r["_field"] == "BatteryPercent" or
        r["_field"] == "posture"
      )
      |> last()
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> group(columns: ["_measurement"])
  `;

  const [allDevices, latestReadings] = await Promise.all([
    pool.query(postgresQuery),
    queryApi.collectRows(fluxQuery),
  ]);

  // 3. Merge ข้อมูล
  const readingMap = {};
  latestReadings.forEach((row) => {
    readingMap[row._measurement] = row;
  });

  const mergedData = allDevices.rows.map((device) => {
    const reading = readingMap[device.device_id] || {};
    return {
      ...device,
      sensor_data: {
        heart_rate: reading.heart_rate || 0,
        temperature: reading.temperature || 0,
        battery_percent: reading.BatteryPercent || 0,
        posture: reading.posture || 0,
        last_seen: reading._time || null,
      },
      status: calculateStatus(reading.heart_rate, device.assignment_status),
    };
  });

  return NextResponse.json({
    success: true,
    mode: "overview",
    count: mergedData.length,
    data: mergedData,
  });
}

// ==========================================
// Helper: ดึงข้อมูลเฉพาะ Device
// ==========================================
async function getDeviceDetail(device_id, range, start, end) {
  const sanitizedDeviceId = device_id.replace(/["\\]/g, "");

  // 1. ตรวจสอบว่ามีใน InfluxDB หรือไม่
  const influxCheckQuery = `
    from(bucket: "${influxConfig.bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r["_measurement"] == "${sanitizedDeviceId}")
      |> limit(n: 1)
  `;

  const influxResult = await queryApi.collectRows(influxCheckQuery);

  if (influxResult.length === 0) {
    return NextResponse.json({
      success: false,
      error: `ไม่พบเซนเซอร์ ${device_id} ใน InfluxDB`,
      device_id: device_id,
      exists_in_influxdb: false,
    }, { status: 404 });
  }

  // 2. ดึงข้อมูล Assignment จาก PostgreSQL
  const postgresQuery = `
    SELECT 
      d.*,
      a.id as assignment_id,
      a.hn,
      a.patient_name,
      a.patient_lastname,
      a.status as assignment_status,
      a.assigned_at,
      p.gender,
      p.date_of_birth
    FROM device d
    LEFT JOIN assign_device a ON d.device_id = a.device_id AND a.status = 'active'
    LEFT JOIN patient p ON a.hn = p.hn
    WHERE d.device_id = $1;
  `;

  const postgresResult = await pool.query(postgresQuery, [device_id]);
  const isAssigned =
    postgresResult.rows.length > 0 &&
    postgresResult.rows[0].assignment_status === "active";

  // 3. สร้าง Time Range Query
  let timeRange;
  if (start && end) {
    timeRange = `range(start: ${start}, stop: ${end})`;
    console.log(`📊 Custom Range: ${start} → ${end}`);
  } else {
    timeRange = `range(start: ${range})`;
    console.log(`📊 Quick Range: ${range}`);
  }

  // 4. ดึง Historical Data
  const historicalQuery = `
    from(bucket: "${influxConfig.bucket}")
      |> ${timeRange}
      |> filter(fn: (r) => r["_measurement"] == "${sanitizedDeviceId}")
      |> filter(fn: (r) => 
        r["_field"] == "heart_rate" or 
        r["_field"] == "temperature" or 
        r["_field"] == "BatteryPercent" or
        r["_field"] == "posture"
      )
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"])
  `;

  const historicalData = await queryApi.collectRows(historicalQuery);
  console.log(`✅ Found ${historicalData.length} data points`);

  // 5. ส่ง Response
  return NextResponse.json({
    success: true,
    device_id: device_id,
    exists_in_influxdb: true,
    info: postgresResult.rows.length > 0 ? postgresResult.rows[0] : null,
    is_assigned: isAssigned,
    sensor_data: historicalData.map((row) => ({
      _time: row._time,
      heart_rate: row.heart_rate || 0,
      temperature: row.temperature || 0,
      BatteryPercent: row.BatteryPercent || 0,
      posture: row.posture || 0,
    })),
  });
}

// ==========================================
// Helper: คำนวณ Status
// ==========================================
function calculateStatus(heartRate, assignmentStatus) {
  if (!assignmentStatus || assignmentStatus !== "active") {
    return "available";
  }

  if (!heartRate || heartRate === 0) {
    return "inactive";
  }

  if (heartRate > 100 || heartRate < 60) {
    return "critical";
  }

  return "active";
}