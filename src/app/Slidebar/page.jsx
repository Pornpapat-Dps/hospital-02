// components/Sidebar.jsx
import { Home, User, LogOut, Bell, Settings } from 'lucide-react';

// กำหนดรายการเมนูนำทาง
const navItems = [
  { href: '/', icon: Home, label: 'Monitor Station' },
  { href: '/admit', icon: User, label: 'Admit Patient' },
  { href: '/logs', icon: Bell, label: 'Logs & History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export default function SlidebarPage() {
  return (
    // <aside> คือแท็กหลักของ Sidebar
    <aside className="w-64 bg-white shadow-xl p-4 flex flex-col">
      {/* 1. Logo/Title */}
      <div className="text-xl font-bold text-blue-600 mb-8">
        Hospital Monitor
      </div>
      
      {/* 2. Navigation Items */}
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                // Tailwind CSS: ทำให้ Link มี Icon, มี Padding, และเปลี่ยนสีเมื่อ Hover
                className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* 3. Footer/Logout Button (อยู่ด้านล่างสุดเสมอ) */}
      <div className="mt-auto pt-4 border-t">
        <button className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}