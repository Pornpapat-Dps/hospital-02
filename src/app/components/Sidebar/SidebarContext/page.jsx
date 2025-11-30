"use client";

import { createContext, useContext, useState } from "react";

// ✅ 1. สร้าง Context
const SidebarContext = createContext();

// ✅ 2. สร้าง Provider Component
export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// ✅ 3. สร้าง Custom Hook
export function useSidebar() {
  const context = useContext(SidebarContext);
  
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  
  return context;
}