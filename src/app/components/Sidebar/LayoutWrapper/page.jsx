"use client";

import { usePathname } from "next/navigation";
import PageWrapper from "../PageWrapper/page";
import Sidebar from "../../../SideBar/page";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // ✅ กำหนดเส้นทางที่ต้องการแสดง Sidebar
//   const showSidebar = pathname === "/" || pathname.startsWith("/PatientMonitor");
  const showSidebar =  pathname.startsWith("/PatientMonitor");

  return (
    <div className="flex min-h-screen">
      {/* ✅ แสดง Sidebar เฉพาะเส้นทางที่กำหนด */}
      {/* {showSidebar && <Sidebar />} */}
      <Sidebar />
      
      {/* ✅ PageWrapper จะปรับตาม Sidebar */}
      <PageWrapper hasSidebar={showSidebar}>
        {children}
      </PageWrapper>
    </div>
  );
}