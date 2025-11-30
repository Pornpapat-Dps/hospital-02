// components/PageWrapper.js
"use client"; // 👈 สำคัญมาก! บอกว่าไฟล์นี้ทำงานฝั่ง Client

import { useSidebar } from "../SidebarContext/page"; // 👈 นำเข้า Custom Hook จาก Context

export default function PageWrapper({ children }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div 
      className={`
        flex-1 min-h-screen transition-all duration-300 ease-in-out
        ${isCollapsed ? "ml-20" : "ml-72"} 
      `}
    >
      {children}
    </div>
  );
}