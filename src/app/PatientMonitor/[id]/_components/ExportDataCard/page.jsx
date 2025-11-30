"use client";

import { useState } from "react";
import { 
  Download, 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

// --- 1. Constants & Utilities (แยกส่วน Data Logic) ---

const POSTURE_MAP = {
  0: "นอน/นั่ง",
  1: "ยืน/เดิน",
  2: "เดินเร็ว/วิ่ง",
  3: "ล้ม"
};

const QUICK_RANGES = [
  { label: "1 ชั่วโมง", value: "1h", range: "-1h" },
  { label: "6 ชั่วโมง", value: "6h", range: "-6h" },
  { label: "1 วัน", value: "1d", range: "-24h" },
  { label: "1 สัปดาห์", value: "1w", range: "-7d" },
  { label: "1 เดือน", value: "1m", range: "-30d" },
  { label: "3 เดือน", value: "3m", range: "-90d" },
  { label: "6 เดือน", value: "6m", range: "-180d" },
  { label: "1 ปี", value: "1y", range: "-365d" },
];

/**
 * แปลงข้อมูล JSON เป็น CSV String พร้อม BOM สำหรับ Excel
 */
const generateCSVContent = (data, patientName, hn) => {
  if (!data || data.length === 0) return null;

  const headers = [
    "วันที่และเวลา",
    "อัตราการเต้นหัวใจ (bpm)",
    "อุณหภูมิร่างกาย (°C)",
    "แบตเตอรี่ (%)",
    "ท่าทาง",
    "ชื่อผู้ป่วย",
    "HN"
  ];

  const rows = data.map(row => [
    `"${new Date(row._time).toLocaleString('th-TH')}"`, // Wrap quotes กัน format เพี้ยน
    row.heart_rate || 0,
    row.temperature || 0,
    row.BatteryPercent || 0,
    `"${POSTURE_MAP[row.posture] || "-"}"`,
    `"${patientName || "-"}"`,
    `"${hn || "-"}"`
  ]);

  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
};

/**
 * สั่ง Browser ให้ Download File
 */
const triggerFileDownload = (content, filename) => {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- 2. Main Component ---

export default function ExportDataCard({ deviceInfo, deviceId }) {
  // State
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [selectedRange, setSelectedRange] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Helper function: เรียก API
  const fetchExportData = async (params) => {
    const query = new URLSearchParams({ device: deviceId, ...params }).toString();
    const res = await fetch(`/api/devices?${query}`);
    if (!res.ok) throw new Error("API Error");
    const json = await res.json();
    return json.data || [];
  };

  // ✅ Centralized Export Handler (ฟังก์ชันเดียวคุมทั้งหมด)
  const handleExport = async (type, params) => {
    // Validate Custom Range
    if (type === 'custom') {
      if (!dateRange.start || !dateRange.end) return alert("กรุณาระบุวันเวลาให้ครบถ้วน");
      if (new Date(dateRange.start) > new Date(dateRange.end)) return alert("เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด");
    }

    // Confirm for All Data
    if (type === 'all' && !confirm("ยืนยันการดาวน์โหลดข้อมูลทั้งหมด? (อาจใช้เวลานาน)")) return;

    try {
      setStatus("loading");
      setSelectedRange(type === 'quick' ? params.value : type);

      // 1. Fetch Data
      let data = [];
      if (type === 'quick') data = await fetchExportData({ range: params.range });
      else if (type === 'custom') data = await fetchExportData({ start: new Date(dateRange.start).toISOString(), end: new Date(dateRange.end).toISOString() });
      else if (type === 'all') data = await fetchExportData({ range: 'all' });

      if (data.length === 0) {
        alert("⚠️ ไม่พบข้อมูลในช่วงเวลานี้");
        setStatus("idle");
        return;
      }

      // 2. Generate CSV
      const csvContent = generateCSVContent(data, deviceInfo?.patient_name, deviceInfo?.hn);
      
      // 3. Download
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = `Export_${deviceInfo?.hn || deviceId}_${type}_${timestamp}.csv`;
      triggerFileDownload(csvContent, filename);

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setSelectedRange(null);
      }, 3000);

    } catch (error) {
      console.error(error);
      setStatus("error");
      alert("❌ เกิดข้อผิดพลาดในการส่งออกข้อมูล");
    }
  };

  // --- UI Components (Small Parts) ---

  const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 text-slate-800">
      <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
        <Icon size={16} />
      </div>
      <h4 className="text-sm font-bold uppercase tracking-wide">{title}</h4>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden font-sans">
      
      {/* Header: Clean & Minimal */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Export Data
          </h3>
          <p className="text-xs text-slate-500 mt-1">ดาวน์โหลดประวัติสุขภาพผู้ป่วย (CSV)</p>
        </div>
        
        {/* Patient Badge */}
        {deviceInfo && (
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">{deviceInfo.patient_name || "Unknown"}</p>
            <p className="text-[10px] text-slate-400 font-mono">HN: {deviceInfo.hn || "-"}</p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-8">
        
        {/* 1. Quick Export Grid */}
        <section>
          <SectionHeader icon={Clock} title="Quick Range" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK_RANGES.map((item) => (
              <button
                key={item.value}
                onClick={() => handleExport('quick', item)}
                disabled={status === 'loading'}
                className={`
                  px-3 py-2.5 rounded-lg text-xs font-medium transition-all border
                  ${selectedRange === item.value 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Custom Range */}
        <section className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <SectionHeader icon={Calendar} title="Custom Range" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             {['start', 'end'].map((field) => (
               <div key={field}>
                 <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                   {field === 'start' ? 'From' : 'To'}
                 </label>
                 <input
                   type="datetime-local"
                   value={dateRange[field]}
                   onChange={(e) => setDateRange(prev => ({ ...prev, [field]: e.target.value }))}
                   disabled={status === 'loading'}
                   className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                 />
               </div>
             ))}
          </div>
          <button
            onClick={() => handleExport('custom')}
            disabled={status === 'loading' || !dateRange.start || !dateRange.end}
            className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm hover:bg-slate-50 hover:text-blue-700 hover:border-blue-300 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {status === 'loading' && selectedRange === 'custom' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download Custom Range
          </button>
        </section>

        {/* 3. Export All (Danger Zone style but cleaner) */}
        <section>
           <button
             onClick={() => handleExport('all')}
             disabled={status === 'loading'}
             className="w-full group relative overflow-hidden bg-slate-800 hover:bg-slate-900 text-slate-200 px-6 py-3.5 rounded-xl transition-all shadow-sm disabled:opacity-70"
           >
             <div className="flex items-center justify-center gap-2 relative z-10">
               {status === 'loading' && selectedRange === 'all' ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
               <span className="font-semibold text-sm">Download All History</span>
             </div>
           </button>
           <p className="text-center text-[10px] text-slate-400 mt-2">
             ข้อมูลขนาดใหญ่อาจใช้เวลาดาวน์โหลดสักครู่
           </p>
        </section>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 size={18} /> ดาวน์โหลดเสร็จสิ้น
          </div>
        )}
        
        {status === 'error' && (
           <div className="flex items-center justify-center gap-2 p-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 animate-in fade-in">
             <AlertCircle size={18} /> เกิดข้อผิดพลาด
           </div>
        )}

      </div>
    </div>
  );
}