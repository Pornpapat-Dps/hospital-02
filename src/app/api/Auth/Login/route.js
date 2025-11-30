import { NextResponse } from "next/server";
import { queryApi, influxConfig } from "@/lib/influxdb";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET || "secret_key_change_me"; // ควรใส่ใน .env

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // 1. ค้นหา User
    const result = await pool("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: "ไม่พบชื่อผู้ใช้งาน" }, { status: 401 });
    }

    // 2. ตรวจสอบรหัสผ่าน
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    // 3. สร้าง JWT Token (บัตรผ่าน)
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        ward: user.ward,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: "8h" } // บัตรหมดอายุใน 8 ชั่วโมง
    );

    // 4. ส่ง Token กลับไปหา User (ผ่าน Cookie เพื่อความปลอดภัย)
    const response = NextResponse.json({ 
      message: "เข้าสู่ระบบสำเร็จ",
      user: { // ส่งข้อมูล User กลับไปโชว์หน้าเว็บ (ไม่ส่ง password)
        id: user.id,
        name: user.first_name,
        role: user.role,
        ward: user.ward
      }
    });

    // ฝัง Cookie (HttpOnly)
    response.cookies.set("token", token, {
      httpOnly: true, // JS อ่านไม่ได้ (กัน XSS)
      secure: process.env.NODE_ENV === "production", // ใช้ HTTPS เท่านั้นถ้าขึ้น Production
      sameSite: "strict",
      maxAge: 60 * 60 * 8, // 8 ชั่วโมง
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}