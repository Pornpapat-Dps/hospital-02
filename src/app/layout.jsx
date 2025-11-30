import { Kanit } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "./components/Sidebar/SidebarContext/page.jsx";
import LayoutWrapper from "./components/Sidebar/LayoutWrapper/page";

// ================================
// Font Configuration
// ================================

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-kanit",
  display: "swap",
});

// ================================
// Metadata
// ================================

export const metadata = {
  title: "Hospital Monitoring System",
  description: "Real-time Patient Monitoring and Management System",
  keywords: ["hospital", "patient monitoring", "healthcare", "medical"],
};

// ================================
// Root Layout
// ================================

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={kanit.className}>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {/* <SidebarProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </SidebarProvider> */}
        {children}
      </body>
    </html>
  );
}