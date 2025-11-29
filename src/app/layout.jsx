import { Kanit } from "next/font/google"; // 1. import Kanit
import "./globals.css";
// import SlidebarPage from "./Slidebar/page";

// 2. ตั้งค่า Kanit
const kanit = Kanit({
  subsets: ["latin", "thai"], // สำคัญ: ต้องใส่ 'thai' เพื่อให้แสดงผลภาษาไทยได้ถูกต้อง
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // เลือกความหนาที่ต้องการ (หรือใส่ครบก็ได้)
  variable: "--font-kanit", // ตั้งชื่อตัวแปร CSS
});

export const metadata = {
  title: "Hospital Project",
  description: "Hospital Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${kanit.variable} antialiased font-sans`}> 
        {/* 3. เรียกใช้ variable และเพิ่ม class font-sans */}
        {/* <SlidebarPage /> */}
        {children}
      </body>
    </html>
  );
}