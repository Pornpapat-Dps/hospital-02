import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import  pool  from "@/lib/db"; // เรียกใช้ตัวเชื่อม DB ที่เราทำไว้

export async function POST(req) {
  try {
    // 1. รับค่าจากหน้าบ้าน
    const body = await req.json();
    const { 
      username, 
      password, 
      first_name, 
      last_name, 
      employee_id, 
      role, 
      ward 
    } = body;

    // 2. Validate: เช็คว่ากรอกข้อมูลสำคัญครบไหม
    if (!username || !password || !first_name) {
      return NextResponse.json(
        { error: "กรุณากรอก Username, Password และชื่อจริง" }, 
        { status: 400 }
      );
    }

    // 3. Check Duplicate: เช็คว่า Username หรือ Employee ID ซ้ำไหม
    // ใช้ SQL OR เพื่อเช็คทั้งคู่ในรอบเดียว
    const checkUser = await pool(
      "SELECT id FROM users WHERE username = $1 OR employee_id = $2", 
      [username, employee_id]
    );

    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { error: "Username หรือรหัสพนักงานนี้ ถูกใช้งานแล้ว" }, 
        { status: 409 } // 409 Conflict
      );
    }

    // 4. Hash Password: เข้ารหัสรหัสผ่าน (ใช้ Salt round = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Insert to Database
    const sql = `
      INSERT INTO users (
        username, 
        password_hash, 
        first_name, 
        last_name, 
        employee_id, 
        role, 
        ward
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, username, role
    `;

    // ค่าที่จะส่งเข้าไป (ถ้าไม่มีให้ส่ง null หรือค่า default)
    const values = [
      username,
      hashedPassword,
      first_name,
      last_name || null,
      employee_id || null, // ถ้าไม่ส่งมาให้เป็น null (เพื่อไม่ให้ error unique constraint)
      role || 'nurse',     // Default เป็น nurse
      ward || null
    ];

    await pool(sql, values);

    // 6. ส่งผลลัพธ์กลับ
    return NextResponse.json(
      { message: "สมัครสมาชิกสำเร็จ", success: true }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์" }, 
      { status: 500 }
    );
  }
}