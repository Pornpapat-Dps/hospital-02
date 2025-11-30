"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { use } from 'react';
import { ArrowLeft, Activity, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import Link from 'next/link';

// Components
import PatientInfoCard from './_components/PatientInfoCard/page';
import DeviceInfoCard from './_components/DeviceInfoCard/page';
import VitalStatsCards from './_components/VitalStatsCards/page';
import ChartControls from './_components/ChartControls/page';
import MonitorCharts from './_components/MonitorCharts/page';
import ExportDataCard from './_components/ExportDataCard/page';

export default function ViewDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const deviceId = unwrappedParams.id;

  // States
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('-1h');
  const [selectedChart, setSelectedChart] = useState('all');
  const [customMode, setCustomMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // ✅ Downsampling Function
  const downsampleData = useCallback((data, maxPoints = 100) => {
    if (data.length <= maxPoints) return data;
    
    const interval = Math.ceil(data.length / maxPoints);
    const sampled = [];
    
    sampled.push(data[0]);
    
    for (let i = interval; i < data.length - interval; i += interval) {
      let maxDiff = 0;
      let selectedPoint = data[i];
      
      for (let j = i; j < Math.min(i + interval, data.length); j++) {
        const hrDiff = Math.abs(
          (data[j].heart_rate || 0) - (data[i - 1]?.heart_rate || 0)
        );
        const tempDiff = Math.abs(
          (data[j].temperature || 0) - (data[i - 1]?.temperature || 0)
        ) * 10;
        const batteryDiff = Math.abs(
          (data[j].BatteryPercent || 0) - (data[i - 1]?.BatteryPercent || 0)
        ) * 0.5;
        const postureDiff = Math.abs(
          (data[j].posture || 0) - (data[i - 1]?.posture || 0)
        ) * 20;
        
        const totalDiff = hrDiff + tempDiff + batteryDiff + postureDiff;
        
        if (totalDiff > maxDiff) {
          maxDiff = totalDiff;
          selectedPoint = data[j];
        }
      }
      
      sampled.push(selectedPoint);
    }
    
    sampled.push(data[data.length - 1]);
    
    return sampled;
  }, []);

  // ✅ คำนวณข้อมูลที่จะแสดงผล
  const displayData = useMemo(() => {
    setIsProcessing(true);
    
    if (historyData.length === 0) {
      setIsProcessing(false);
      return [];
    }
    
    let maxPoints = 100;
    
    if (customMode && startDate && endDate) {
      const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 1) maxPoints = 200;
      else if (daysDiff <= 7) maxPoints = 300;
      else if (daysDiff <= 30) maxPoints = 400;
      else if (daysDiff <= 90) maxPoints = 500;
      else if (daysDiff <= 365) maxPoints = 600;
      else maxPoints = 800;
      
    } else {
      const rangeMaxPoints = {
        '-1h': 60,
        '-6h': 100,
        '-24h': 200,
        '-7d': 300,
        '-30d': 400,
        '-90d': 500,
        '-180d': 600,
        '-365d': 700,
        '-730d': 750,
        '-1825d': 800,
        '-3650d': 800
      };
      maxPoints = rangeMaxPoints[range] || 100;
    }
    
    const result = downsampleData(historyData, maxPoints);
    
    setTimeout(() => setIsProcessing(false), 300);
    
    return result;
  }, [historyData, customMode, startDate, endDate, range, downsampleData]);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      let apiUrl = `/api/assign-device?device_id=${deviceId}`;
      
      if (customMode && startDate && endDate) {
        const start = new Date(startDate).toISOString();
        const end = new Date(endDate).toISOString();
        apiUrl += `&start=${start}&end=${end}`;
      } else {
        apiUrl += `&range=${range}`;
      }

      const res = await fetch(apiUrl);
      const json = await res.json();

      if (json.success) {
        setDeviceInfo(json.info);
        
        if (Array.isArray(json.sensor_data)) {
          const sortedData = [...json.sensor_data].sort(
            (a, b) => new Date(a._time) - new Date(b._time)
          );
          setHistoryData(sortedData);
          setLastUpdate(new Date());
        }
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  }, [deviceId, range, customMode, startDate, endDate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Format Time
  const formatTime = useCallback((timeStr) => {
    const date = new Date(timeStr);
    
    if (historyData.length === 0) {
      return date.toLocaleDateString('th-TH');
    }
    
    const startTime = new Date(historyData[0]._time);
    const endTime = new Date(historyData[historyData.length - 1]._time);
    const daysDiff = (endTime - startTime) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 0.25) {
      return date.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    if (daysDiff <= 2) {
      return date.toLocaleString('th-TH', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    if (daysDiff <= 30) {
      return date.toLocaleDateString('th-TH', { 
        day: 'numeric', 
        month: 'short'
      });
    }
    
    if (daysDiff <= 365) {
      return date.toLocaleDateString('th-TH', { 
        month: 'short',
        year: '2-digit'
      });
    }
    
    return date.toLocaleDateString('th-TH', { 
      month: 'short',
      year: 'numeric'
    });
  }, [historyData]);

  // Y-Axis Domain Calculator
  const getYAxisDomain = useCallback((dataKey) => {
    if (displayData.length === 0) return ['auto', 'auto'];

    const values = displayData.map(d => d[dataKey]).filter(v => v && v > 0);
    if (values.length === 0) return ['auto', 'auto'];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 5;

    switch(dataKey) {
      case 'heart_rate':
        return [
          Math.max(40, Math.floor(min - padding)), 
          Math.min(160, Math.ceil(max + padding))
        ];
      case 'temperature':
        return [
          Math.max(30, (min - padding).toFixed(1)), 
          Math.min(42, (max + padding).toFixed(1))
        ];
      case 'BatteryPercent':
        return [0, 100];
      case 'posture':
        return [0, 3];
      default:
        return ['auto', 'auto'];
    }
  }, [displayData]);

  // Event Handlers
  const handleQuickSelect = useCallback((rangeValue) => {
    setCustomMode(false);
    setRange(rangeValue);
    setStartDate('');
    setEndDate('');
  }, []);

  const handleCustomDateApply = useCallback(() => {
    if (startDate && endDate) {
      setCustomMode(true);
      fetchData();
    } else {
      alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
    }
  }, [startDate, endDate, fetchData]);

  const handleClearCustom = useCallback(() => {
    setCustomMode(false);
    setStartDate('');
    setEndDate('');
    setRange('-1h');
  }, []);

  // Loading State
  if (loading && !deviceInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <Activity className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-6 text-slate-700 font-semibold text-lg">กำลังโหลดข้อมูลผู้ป่วย...</p>
        <p className="text-slate-500 text-sm mt-1">กรุณารอสักครู่</p>
      </div>
    );
  }

  // Not Found State
  if (!deviceInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 p-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-12 max-w-md text-center">
          <div className="inline-flex p-4 bg-red-100 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            ไม่พบอุปกรณ์
          </h2>
          <p className="text-slate-600 mb-6">
            ไม่พบอุปกรณ์หมายเลข <span className="font-mono font-semibold text-slate-900">{deviceId}</span>
          </p>
          <Link 
            href="/PatientMonitor" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate Critical Status
  const latestVal = historyData.length > 0 ? historyData[historyData.length - 1] : {};
  const isCritical = (latestVal.heart_rate > 100 || latestVal.heart_rate < 60) && latestVal.heart_rate > 0;

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      
      {/* ✨ Enhanced Header Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left: Back Button + Patient Name */}
            <div className="flex items-center gap-4">
              <Link 
                href="/PatientMonitor" 
                className="group flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 hover:border-blue-300"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
                <span className="font-semibold text-slate-700 group-hover:text-blue-600 text-sm">
                  กลับหน้าหลัก
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">
                    {deviceInfo?.patient_name || 'ไม่ระบุชื่อ'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    HN: {deviceInfo?.hn || '-'} • Device: {deviceId}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Status + Last Update */}
            <div className="flex items-center gap-3">
              
              {/* Last Update Time */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <RefreshCw className="w-3.5 h-3.5 text-slate-600 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs text-slate-600 font-medium">
                  อัพเดท: {lastUpdate.toLocaleTimeString('th-TH')}
                </span>
              </div>

              {/* Status Badge */}
              <div className={`
                px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide
                flex items-center gap-2 shadow-lg transition-all duration-300
                ${isCritical 
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white animate-pulse' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                }
              `}>
                {isCritical ? (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Critical</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Normal</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✨ Main Content */}
      <div className="max-w-[1920px] mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* ✨ Left Sidebar - Info Cards (Sticky) */}
          <div className="xl:col-span-3 space-y-6">
            <div className="xl:sticky xl:top-24 space-y-6">
              <PatientInfoCard deviceInfo={deviceInfo} />
              <DeviceInfoCard deviceId={deviceId} deviceInfo={deviceInfo} />
              <ExportDataCard deviceInfo={deviceInfo} deviceId={deviceId} />
            </div>
          </div>

          {/* ✨ Right Content - Vitals & Charts */}
          <div className="xl:col-span-9 space-y-6">
            
            {/* Vital Stats Cards */}
            <VitalStatsCards latestVal={latestVal} isCritical={isCritical} />
            
            {/* Chart Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              
              {/* Chart Controls */}
              <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
                <ChartControls 
                  selectedChart={selectedChart}
                  setSelectedChart={setSelectedChart}
                  range={range}
                  customMode={customMode}
                  startDate={startDate}
                  endDate={endDate}
                  onQuickSelect={handleQuickSelect}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  onCustomApply={handleCustomDateApply}
                  onClearCustom={handleClearCustom}
                  historyDataLength={historyData.length}
                />
              </div>
              
              {/* Chart Container */}
              <div className="p-6 relative bg-gradient-to-br from-white to-slate-50/30">
                
                {/* Loading Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 animate-pulse"></div>
                        <div className="relative animate-spin rounded-full h-10 w-10 border-b-3 border-blue-600"></div>
                      </div>
                      <p className="text-sm text-slate-700 font-semibold">กำลังประมวลผลข้อมูล...</p>
                      <p className="text-xs text-slate-500">
                        {historyData.length.toLocaleString()} data points
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Chart */}
                <MonitorCharts 
                  historyData={displayData}
                  selectedChart={selectedChart}
                  getYAxisDomain={getYAxisDomain}
                  formatTime={formatTime}
                />
                
                {/* Data Info Badge */}
                {!isProcessing && displayData.length > 0 && (
                  <div className="absolute bottom-8 right-8 px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm text-white text-xs font-medium rounded-lg shadow-lg">
                    แสดง {displayData.length.toLocaleString()} / {historyData.length.toLocaleString()} จุดข้อมูล
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}