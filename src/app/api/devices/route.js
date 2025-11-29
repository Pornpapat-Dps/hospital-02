import { NextResponse } from 'next/server';
import { queryApi, influxConfig } from '../../../lib/influxdb';

// จะรับค่า device แทน hospital ทุกๆ 1 ชม
// ทดสอบแบบปกติ (ย้อนหลัง 1 ชม) "http://localhost:3000/api/devices?device=Hospital04"
// ทดสอบด้วย range ที่กำหนด "http://localhost:3000/api/devices?device=Hospital04&range=-24h"
// ทดสอบด้วยช่วงเวลาเจาะจง "http://localhost:3000/api/devices?device=Hospital04&start=2023-11-28T00:00:00Z&stop=2023-11-28T23:59:59Z"
// ทดสอบด้วย fields ที่เลือก "http://localhost:3000/api/devices?device=Hospital04&fields=heart_rate,temperature"
// แสดงผลแบบ JSON สวยๆ "http://localhost:3000/api/devices?device=Hospital04"
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. รับค่า Params
    const device_id = searchParams.get('device');
    
    // --- จุดที่แก้ไข: เพิ่ม logic การรับค่าเวลา ---
    const startParam = searchParams.get('start'); // รับค่า start (เช่น 2023-11-28T08:00:00Z)
    const stopParam = searchParams.get('stop');   // รับค่า stop (เช่น 2023-11-28T09:00:00Z)
    const relativeRange = searchParams.get('range'); // รับค่า range แบบเดิม (เช่น -1h)

    let rangeQuery = '';

    // Logic: ถ้ามี start ให้ใช้ start/stop, ถ้าไม่มีให้ใช้ relative range
    if (startParam) {
        // กรณีระบุวันเวลาเจาะจง (Custom Date)
        // ถ้ามี stop ก็ใส่ stop ด้วย, ถ้าไม่มี stop ก็เอา start ถึงปัจจุบัน
        const stopString = stopParam ? `, stop: ${stopParam}` : '';
        rangeQuery = `|> range(start: ${startParam}${stopString})`;
    } else {
        // กรณีใช้ range ย้อนหลังปกติ (Default: -1h)
        const r = relativeRange || '-1h';
        rangeQuery = `|> range(start: ${r})`;
    }
    // ----------------------------------------

    const defaultFields = 'heart_rate,temperature,BatteryPercent,posture,sequence,timestamp';
    const fieldsParam = searchParams.get('fields') || defaultFields;
    
    if (!device_id) {
      return NextResponse.json({ error: 'Device name (measurement) is required' }, { status: 400 });
    }

    // 2. สร้าง Filter Fields
    const fields = fieldsParam.split(',');
    const fieldFilter = fields
        .map(f => `r["_field"] == "${f.trim()}"`)
        .join(' or ');

    // 3. Flux Query
    // --- จุดที่แก้ไข: เอา rangeQuery ที่เราสร้างข้างบนมาแปะตรงนี้ ---
    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        ${rangeQuery}  
        |> filter(fn: (r) => r["_measurement"] == "${device_id}")
        |> filter(fn: (r) => ${fieldFilter})
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> sort(columns: ["_time"], desc: true)
    `;
    // -----------------------------------------------------------

    const data = await queryApi.collectRows(fluxQuery);

    return NextResponse.json({ 
      success: true, 
      device: device_id,
      count: data.length, 
      data: data 
    });

  } catch (error) {
    console.error('InfluxDB Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' }, 
      { status: 500 }
    );
  }
}