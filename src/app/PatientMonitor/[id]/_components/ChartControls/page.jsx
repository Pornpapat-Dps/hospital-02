import { Activity, Heart, Thermometer, Battery, User, Calendar, BarChart3 } from 'lucide-react';

export default function ChartControls({ 
  selectedChart, 
  setSelectedChart,
  range,
  customMode,
  startDate,
  endDate,
  onQuickSelect,
  onStartDateChange,
  onEndDateChange,
  onCustomApply,
  onClearCustom,
  historyDataLength
}) {
  
  const chartTypes = [
    { id: 'all', label: 'ทั้งหมด', icon: Activity },
    { id: 'heart_rate', label: 'Heart Rate', icon: Heart },
    { id: 'temperature', label: 'Temperature', icon: Thermometer },
    { id: 'battery', label: 'Battery', icon: Battery },
    { id: 'posture', label: 'Posture', icon: User }
  ];

  // ✅ เพิ่มตัวเลือกระยะยาว
  const timeRanges = [
    { value: '-1h', label: '1 ชั่วโมง', category: 'short' },
    { value: '-6h', label: '6 ชั่วโมง', category: 'short' },
    { value: '-24h', label: '1 วัน', category: 'short' },
    { value: '-7d', label: '1 สัปดาห์', category: 'medium' },
    { value: '-30d', label: '1 เดือน', category: 'medium' },
    { value: '-90d', label: '3 เดือน', category: 'long' },
    { value: '-180d', label: '6 เดือน', category: 'long' },
    { value: '-365d', label: '1 ปี', category: 'long' },
    // { value: '-730d', label: '2 ปี', category: 'long' },
    // { value: '-1825d', label: '5 ปี', category: 'long' },
    // { value: '-3650d', label: '10 ปี', category: 'long' }
  ];

  // จัดกลุ่มตามประเภท
  const shortRanges = timeRanges.filter(r => r.category === 'short');
  const mediumRanges = timeRanges.filter(r => r.category === 'medium');
  const longRanges = timeRanges.filter(r => r.category === 'long');

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">กราฟประวัติสัญญาณชีพ</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงข้อมูล {historyDataLength.toLocaleString()} จุด
              {historyDataLength > 1000 && (
                <span className="ml-2 text-blue-600">
                  (ใช้ Data Sampling เพื่อความรวดเร็ว)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2 ">
        {chartTypes.map((type) => {
          const Icon = type.icon;
          const isActive = selectedChart === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSelectedChart(type.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{type.label}</span>
            </button>
          );
        })}
        
      </div>

      {/* Time Range Section */}
      <div className="space-y-4">
        {/* Short Range (Hours - Days) */}
        <div>
          <div className="flex flex-wrap gap-2">
            {shortRanges.map((r) => (
              <button
                key={r.value}
                onClick={() => onQuickSelect(r.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !customMode && range === r.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {r.label}
                
              </button>
            ))}
            {mediumRanges.map((r) => (
              <button
                key={r.value}
                onClick={() => onQuickSelect(r.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !customMode && range === r.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {r.label}
                
              </button>
            ))}
            {longRanges.map((r) => (
              <button
                key={r.value}
                onClick={() => onQuickSelect(r.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !customMode && range === r.value
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {/* Custom Range */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">กำหนดช่วงเวลาเอง:</span>
            </div>
            
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            
            <span className="text-slate-400">→</span>
            
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
            
            <button
              onClick={onCustomApply}
              disabled={!startDate || !endDate}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                customMode
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ใช้งาน
            </button>
            
            {customMode && (
              <button
                onClick={onClearCustom}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-all"
              >
                ล้าง
              </button>
            )}
          </div>

          {/* Info Display */}
          {customMode && startDate && endDate && (
            <div className="mt-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">
                  {new Date(startDate).toLocaleString('th-TH')}
                </span>
                {' '}→{' '}
                <span className="font-semibold">
                  {new Date(endDate).toLocaleString('th-TH')}
                </span>
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}