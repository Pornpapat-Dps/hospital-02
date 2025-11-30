"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import  {useSidebar}  from "../components/Sidebar/SidebarContext/page"; // 👈 นำเข้า Context
import { 
  Activity, Users, LayoutDashboard, Settings, LogOut, 
  LifeBuoy, HeartPulse, Stethoscope, ShieldCheck, 
  ChevronLeft, ChevronRight 
} from "lucide-react";

const Sidebar = () => {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar(); // 👈 ดึงค่าจาก Context แทน

  // ... (ส่วนรายการ menuItems และ secondaryItems เหมือนเดิม) ...
  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, color: "slate" },
    { name: "Vital Monitor", path: "/PatientMonitor", icon: Activity, color: "teal" },
    { name: "Diagnosis", path: "/Heart", icon: HeartPulse, color: "rose" },
    { name: "Appointments", path: "/Appointments", icon: Users, color: "indigo" },
  ];
  
  const secondaryItems = [
     { name: "Device Settings", path: "/settings", icon: Settings },
     { name: "Help Center", path: "/support", icon: LifeBuoy },
   ];

  return (
    <aside 
      className={`
        h-screen bg-slate-50/80 border-r border-slate-200/60 flex flex-col fixed left-0 top-0 z-50 backdrop-blur-xl font-sans transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-20" : "w-72"}
      `}
    >
      {/* ปุ่ม Toggle ใช้ toggleSidebar จาก Context */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 p-1 rounded-full shadow-sm z-50 hover:shadow-md transition-all"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* ... (ส่วน Header Logo เหมือนเดิม) ... */}
      <div className={`h-24 flex items-center ${isCollapsed ? "justify-center px-0" : "px-8"} transition-all`}>
         <div className="flex items-center gap-3">
           <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-teal-600 flex-shrink-0">
             <Stethoscope size={22} strokeWidth={2.5} />
           </div>
           <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
             <h1 className="text-lg font-bold text-slate-700 tracking-tight whitespace-nowrap">MedCare</h1>
             <p className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Smart Hospital</p>
           </div>
         </div>
      </div>

      {/* ... (ส่วน Menu เหมือนเดิมเป๊ะ แต่เปลี่ยนตรง class ให้แสดง/ซ่อน text) ... */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto py-4 scrollbar-hide">
         {/* Copy code ส่วน nav เดิมมาวางได้เลยครับ Logic การแสดงผลเหมือนเดิม */}
         <div>
            {!isCollapsed && (
              <p className="px-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3 animate-fade-in">Menu</p>
            )}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const activeIconColors = { slate: "text-slate-700", teal: "text-teal-600", rose: "text-rose-500", indigo: "text-indigo-600" };
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    title={isCollapsed ? item.name : ""}
                    className={`
                      flex items-center gap-3.5 py-3 rounded-xl transition-all duration-300 group relative
                      ${isCollapsed ? "justify-center px-0" : "px-4"}
                      ${isActive ? "bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] text-slate-800 font-medium" : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"}
                    `}
                  >
                    <item.icon size={20} className={`transition-colors duration-300 flex-shrink-0 ${isActive ? activeIconColors[item.color] : "text-slate-400"}`} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
                      {item.name}
                    </span>
                    {isActive && !isCollapsed && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${item.color === 'rose' ? 'bg-rose-400' : 'bg-teal-400'}`} />}
                    {isActive && isCollapsed && <div className={`absolute bottom-2 w-1 h-1 rounded-full ${item.color === 'rose' ? 'bg-rose-400' : 'bg-teal-400'}`} />}
                  </Link>
                );
              })}
            </div>
         </div>
         {/* ... (ส่วน System Group เหมือนเดิม) ... */}
         <div>
             <div className="space-y-1 mt-6">
                {secondaryItems.map((item) => (
                  <Link key={item.path} href={item.path} title={isCollapsed ? item.name : ""} className={`flex items-center gap-3.5 py-2.5 rounded-lg transition-colors ${isCollapsed ? "justify-center px-0" : "px-4"} text-slate-400 hover:text-slate-600 hover:bg-slate-100/30`}>
                     <item.icon size={20} className="flex-shrink-0"/>
                     <span className={`text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>{item.name}</span>
                  </Link>
                ))}
             </div>
         </div>
      </nav>

      {/* ... (ส่วน Footer เหมือนเดิม) ... */}
      <div className={`border-t border-slate-200/60 transition-all ${isCollapsed ? "p-3" : "p-5"}`}>
        <div className={`flex items-center gap-3 group cursor-pointer ${isCollapsed ? "justify-center" : ""}`}>
           <div className="relative flex-shrink-0">
             <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs border-2 border-white shadow-sm">NS</div>
             <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full"></span>
           </div>
           <div className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}>
             <p className="text-sm font-semibold text-slate-700 truncate">Nurse Station</p>
             <p className="text-[10px] text-slate-400 flex items-center gap-1"><ShieldCheck size={10} /> Authorized</p>
           </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;