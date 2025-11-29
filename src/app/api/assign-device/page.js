import { NextResponse } from 'next/server';
import { queryApi, influxConfig } from '../../../../lib/influxdb';

// ⚠️ สำคัญ: คุณต้องมี InfluxDB Client (queryApi) และ PostgreSQL Client (postgresClient)
// ในตัวอย่างนี้จะใช้ชื่อสมมติ: postgresClient
// ******************************************************************************
// สมมติว่าคุณมี utility สำหรับ PostgreSQL client/Prisma client
// import { postgresClient } from '../../../lib/postgres'; 
// ******************************************************************************


/**
 * POST API Route สำหรับการเพิ่มอุปกรณ์ใหม่ พร้อมตรวจสอบ InfluxDB
 * Endpoint: /api/devices/add
 */
export async function POST(request) {
    try {
        const { device_id, location, model } = await request.json();

        if (!device_id) {
            return NextResponse.json(
                { success: false, error: 'device_id is required' }, 
                { status: 400 }
            );
        }

        // --- ขั้นตอนที่ 1: ตรวจสอบ InfluxDB ว่ามี Measurement นี้อยู่จริงหรือไม่ ---
        const measurementQuery = `
            import "influxdata/influxdb/schema"
            schema.measurements(bucket: "${influxConfig.bucket}")
                |> filter(fn: (r) => r.measurement == "${device_id}")
                |> yield(name: "measurements")
        `;

        const measurements = await queryApi.collectRows(measurementQuery);

        // ถ้าไม่พบ _measurement ชื่อตรงกับ device_id ใน InfluxDB
        if (measurements.length === 0) {
            console.warn(`InfluxDB check failed: Measurement "${device_id}" not found.`);
            return NextResponse.json(
                { success: false, error: `Device ID "${device_id}" is not sending data (Measurement not found in InfluxDB).` },
                { status: 404 }
            );
        }

        // --- ขั้นตอนที่ 2: บันทึกลง PostgreSQL (RDBMS) ---
        
        // ⚠️ Logic นี้ใช้สำหรับอ้างอิงเท่านั้น คุณควรใช้ ORM เช่น Prisma แทน
        /*
        const result = await postgresClient.query(
            `INSERT INTO device (device_id, location, model) VALUES ($1, $2, $3) 
             ON CONFLICT (device_id) DO UPDATE SET location = EXCLUDED.location, model = EXCLUDED.model 
             RETURNING *`,
            [device_id, location || null, model || null]
        );
        */
       
        // ****************************************************
        // เนื่องจากไม่มี PostgreSQL Client ให้ใช้ เราจะส่ง Success จำลอง
        // ****************************************************
        const newDevice = { device_id, location, model, created_at: new Date().toISOString() };


        return NextResponse.json({ 
            success: true, 
            message: `Device ${device_id} successfully added and verified with InfluxDB.`,
            data: newDevice
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to add device due to a system error.' }, 
            { status: 500 }
        );
    }
}