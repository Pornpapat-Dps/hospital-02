"use client";

import { useState, useEffect, useCallback } from "react";
import { Activity, Loader2, WifiOff, AlertCircle, Plus } from "lucide-react";
import SensorCard from "../components/moitor/SensorCard/page.jsx";
import AssignSensorModal from "../components/moitor/AssignSensorModal/page.jsx";

const DEVICE_LIST = [
  // "Hospital01",
  // "Hospital02",
  "Hospital03",
  // "Hospital04",
  // "Hospital05",
  // "Hospital06",
  // "Hospital07",
  // "Hospital08",
];

export default function PatientMonitor() {
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ใช้ useCallback เพื่อป้องกัน infinite loop
  const fetchSensors = useCallback(async () => {
    try {
      const promises = DEVICE_LIST.map(async (deviceId) => {
        try {
          const res = await fetch(`/api/devices?device=${deviceId}&range=-5m`);

          if (!res.ok) return null;

          const rawData = await res.json();

          // ถ้าไม่มีข้อมูล แสดงว่า device available
          if (!rawData.success || !rawData.data || rawData.data.length === 0) {
            return {
              id: deviceId,
              status: "available",
              patientName: "No Data",
              heartRate: 0,
              temperature: 0,
              batteryPercent: 0,
              posture: "Unknown",
              timestamp: "--:--",
            };
          }

          const latestData = rawData.data[0];

          // กำหนด status ตาม heart rate
          let status = "active";
          if (latestData.heart_rate > 100 || latestData.heart_rate < 60) {
            status = "critical";
          } else if (latestData.heart_rate === 0) {
            status = "available";
          }

          return {
            id: deviceId,
            status: status,
            patientName: latestData.patient_name || "Unknown Patient",
            hn: latestData.hn || "-",
            heartRate: latestData.heart_rate || 0,
            temperature: latestData.temperature || 0,
            batteryPercent: latestData.BatteryPercent || 0,
            posture: latestData.posture || "Unknown",
            sequence: latestData.sequence || 0,
            timestamp: latestData.timestamp || latestData._time || "--:--",
          };
        } catch (innerError) {
          console.warn(`Failed to fetch ${deviceId}:`, innerError);
          return {
            id: deviceId,
            status: "available",
            patientName: "Connection Lost",
            heartRate: 0,
            temperature: 0,
            batteryPercent: 0,
            posture: "Unknown",
            timestamp: "--:--",
          };
        }
      });

      const results = await Promise.all(promises);
      const validResults = results.filter((item) => item !== null);

      setSensors(validResults);
      setError(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []); // ไม่มี dependency

  // Handler สำหรับ Assign Sensor
  const handleAssign = async (deviceId, patientData) => {
    try {
      // TODO: เรียก API เพื่อ assign patient กับ device
      console.log("Assigning device:", deviceId, "to patient:", patientData);
      
      // Refresh ข้อมูลหลัง assign สำเร็จ
      await fetchSensors();
      
      // ปิด modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to assign sensor:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

  // Fetch data เมื่อ component mount และทุก 3 วินาที
  useEffect(() => {
    fetchSensors();
    const interval = setInterval(fetchSensors, 3000);
    return () => clearInterval(interval);
  }, [fetchSensors]);

  // คำนวณสถิติ
  const totalPatients = sensors.filter(
    (s) => s.status === "active" || s.status === "critical"
  ).length;
  const criticalCount = sensors.filter((s) => s.status === "critical").length;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-2 rounded-xl transition-colors ${
                error ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-600"
              }`}
            >
              {error ? (
                <WifiOff className="w-6 h-6" />
              ) : (
                <Activity className="w-6 h-6" />
              )}
            </div>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">
              {error ? "System Offline" : "Live Monitor"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Patient Monitor Station
          </h1>
          <p className="text-slate-500 font-medium">
            Monitoring {DEVICE_LIST.length} Devices
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
            <span className="block text-xs font-bold text-blue-400 uppercase">
              Active
            </span>
            <span className="block text-2xl font-bold text-blue-600">
              {loading ? "-" : totalPatients}
            </span>
          </div>

          {criticalCount > 0 && (
            <div className="bg-white p-3 rounded-xl shadow-sm border border-red-200">
              <span className="block text-xs font-bold text-red-400 uppercase flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Critical
              </span>
              <span className="block text-2xl font-bold text-red-600">
                {criticalCount}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add Sensor Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          เพิ่มเซนเซอร์
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-400" />
          <p>Connecting to Sensors...</p>
        </div>
      ) : (
        /* Sensor Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sensors.map((sensor) => (
            <SensorCard key={sensor.id} {...sensor} />
          ))}
        </div>
      )}

      {/* Assign Sensor Modal */}
      <AssignSensorModal
        devices={sensors}
        onAssign={handleAssign}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}