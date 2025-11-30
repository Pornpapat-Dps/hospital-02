"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Activity, Loader2, WifiOff, AlertCircle, Plus, 
  Search, Filter, Clock, BellRing, LayoutGrid, List
} from "lucide-react";
import SensorCard from "../components/moitor/SensorCard/page.jsx";
import AssignSensorModal from "../components/moitor/AssignSensorModal/page.jsx";

export default function PatientMonitor() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // UX State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, critical, active, available

  // --- 1. Logic & Data Fetching (คงเดิมแต่จัดระเบียบ) ---
  const fetchSensors = useCallback(async () => {
    try {
      // setLoading(true); // ไม่ต้อง set true ทุกครั้งที่ refresh เพื่อไม่ให้จอกระพริบ
      const response = await fetch('/api/assign-device');
      
      if (!response.ok) throw new Error('Failed');

      const result = await response.json();

      if (!result.success || !result.data) {
        setSensors([]);
        setError(true);
        return;
      }

      const formattedSensors = result.data.map((device) => {
        const sensorData = device.sensor_data || {};
        let status = 'available';
        
        if (device.assignment_status === 'active') {
          const heartRate = sensorData.heart_rate || 0;
          if (heartRate === 0) status = 'inactive';
          else if (heartRate > 100 || heartRate < 60) status = 'critical';
          else status = 'active';
        }

        return {
          id: device.device_id,
          status: status,
          patientName: device.patient_name || 'ว่าง',
          hn: device.hn || '-',
          heartRate: sensorData.heart_rate || 0,
          temperature: sensorData.temperature || 0,
          batteryPercent: sensorData.battery_percent || 0,
          posture: sensorData.posture || 0,
          sequence: device.sequence || 0,
          timestamp: sensorData.last_seen || '--:--',
          location: device.location || '-',
          model: device.model || '-',
          gender: device.gender || '-',
          date_of_birth: device.date_of_birth || '-',
          assigned_at: device.assigned_at || null,
        };
      });

      setSensors(formattedSensors);
      setError(false);
    } catch (err) {
      console.error("Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAssign = async (assignData) => {
    // ... (Code เดิมสำหรับการ Assign) ...
    try {
      const response = await fetch('/api/assign-device', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           device_id: assignData.deviceId,
           hn: assignData.hn,
           patient_name: assignData.patientName,
           // ... fields อื่นๆ
        }),
      });
      const result = await response.json();
      if (result.success) {
        // ใช้ Toast notification แทน alert จะดูพรีเมียมกว่า (ถ้ามี lib)
        alert(`✅ ${result.message}`);
        fetchSensors();
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      alert('❌ Connection Error');
    }
  };

  // --- 2. Effects ---
  useEffect(() => {
    fetchSensors();
    const dataInterval = setInterval(fetchSensors, 5000);
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000); // นาฬิกาเดินทุกวินาที
    
    return () => {
      clearInterval(dataInterval);
      clearInterval(clockInterval);
    };
  }, [fetchSensors]);

  // --- 3. Memoized Calculations & Filter ---
  const stats = useMemo(() => {
    return {
      total: sensors.filter(s => s.status !== 'available').length,
      critical: sensors.filter(s => s.status === 'critical').length,
      available: sensors.filter(s => s.status === 'available').length
    };
  }, [sensors]);

  const filteredSensors = useMemo(() => {
    return sensors.filter(sensor => {
      // Filter by Search
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        sensor.patientName.toLowerCase().includes(searchLower) || 
        sensor.hn.includes(searchLower) ||
        sensor.location.toLowerCase().includes(searchLower);

      // Filter by Tab
      let matchTab = true;
      if (activeTab === 'critical') matchTab = sensor.status === 'critical';
      if (activeTab === 'active') matchTab = sensor.status === 'active' || sensor.status === 'critical';
      if (activeTab === 'available') matchTab = sensor.status === 'available';

      return matchSearch && matchTab;
    });
  }, [sensors, searchTerm, activeTab]);

  // --- 4. Render UI ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${error ? 'bg-red-50 text-red-500' : 'bg-blue-600 text-white'}`}>
               {error ? <WifiOff size={24} /> : <Activity size={24} />}
            </div>
            <div>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <h1 className="text-xl font-bold text-slate-900 leading-tight ">Smart Ward Monitor</h1>
              </a>
              <p className="text-xs text-slate-500 font-medium">VIP Ward 8 • Station A</p>
            </div>
          </div>

          {/* Stats Summary Widget */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1">
             <StatBadge label="Monitored" value={stats.total} color="bg-white text-blue-600 shadow-sm" />
             <StatBadge 
                label="Critical" 
                value={stats.critical} 
                color={stats.critical > 0 ? "bg-red-500 text-white animate-pulse" : "text-slate-400"} 
                icon={stats.critical > 0 ? <BellRing size={12} /> : null}
             />
             <StatBadge label="Free" value={stats.available} color="text-slate-500" />
          </div>

          {/* Clock & User */}
          <div className="text-right hidden md:block">
            <div className="flex items-center justify-end gap-2 text-slate-700 font-mono text-xl font-bold">
              <Clock size={20} className="text-blue-500" />
              {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-slate-400">
              {currentTime.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-6 max-w-[1600px] mx-auto">
        
        {/* Controls Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          
          {/* Tabs */}
          <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto w-full md:w-auto">
            <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="All Devices" count={sensors.length} />
            <TabButton active={activeTab === 'critical'} onClick={() => setActiveTab('critical')} label="Critical" count={stats.critical} isDanger />
            <TabButton active={activeTab === 'available'} onClick={() => setActiveTab('available')} label="Available" count={stats.available} />
          </div>

          {/* Search & Actions */}
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search Patient Name, HN..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Device</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {loading && sensors.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-96 text-slate-400">
             <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-500" />
             <p className="font-medium animate-pulse">Synchronizing Vital Signs...</p>
           </div>
        ) : error ? (
           <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
             <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
             <h3 className="text-lg font-bold text-red-600">Connection Lost</h3>
             <p className="text-red-500 mb-6">Unable to retrieve real-time data from the central server.</p>
             <button onClick={fetchSensors} className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-full font-medium transition-colors">
               Try Reconnecting
             </button>
           </div>
        ) : filteredSensors.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
             <Filter className="w-10 h-10 mb-2 opacity-50" />
             <p>No devices match your filter.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
             {filteredSensors.map((sensor) => (
                <div key={sensor.id} className="transition-all duration-300 hover:scale-[1.02]">
                   <SensorCard {...sensor} />
                </div>
             ))}
          </div>
        )}
      </main>

      {/* Modal */}
      <AssignSensorModal
        devices={sensors}
        onAssign={handleAssign}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

// --- Sub Components for cleaner JSX ---

function StatBadge({ label, value, color, icon }) {
  return (
    <div className={`px-4 py-2 rounded-lg flex flex-col items-center min-w-[90px] ${color}`}>
      <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
        {icon} {label}
      </span>
      <span className="text-xl font-bold leading-none mt-1">{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, label, count, isDanger }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap
        ${active 
          ? (isDanger ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700 shadow-sm') 
          : 'text-slate-500 hover:bg-slate-50'
        }
      `}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/50' : 'bg-slate-100'}`}>
        {count}
      </span>
    </button>
  );
}