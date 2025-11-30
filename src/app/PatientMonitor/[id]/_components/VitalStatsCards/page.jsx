import { Heart, Thermometer, Battery, User } from 'lucide-react';

const postureMap = {
  0: { text: 'นอนหรือนั่งพัก', color: '#64748b', bg: 'bg-slate-50', border: 'border-slate-200', textColor: 'text-slate-700' },
  1: { text: 'ยืนหรือเดินช้า', color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', textColor: 'text-emerald-700' },
  2: { text: 'เดินเร็วหรือวิ่งเบา', color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', textColor: 'text-amber-700' },
  3: { text: 'ล้ม', color: '#dc2626', bg: 'bg-red-50', border: 'border-red-200', textColor: 'text-red-700' },
};

export default function VitalStatsCards({ latestVal, isCritical }) {
  const postureInfo = postureMap[parseInt(latestVal?.posture) || 0] || postureMap[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Heart Rate */}
      <div className={`relative overflow-hidden rounded-xl border transition-all ${
        isCritical 
          ? 'bg-red-50/50 border-red-200 shadow-sm' 
          : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
      }`}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-lg ${isCritical ? 'bg-red-100' : 'bg-rose-50'}`}>
              <Heart className={`w-4 h-4 ${isCritical ? 'text-red-600' : 'text-rose-500'}`} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Heart Rate</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-semibold ${isCritical ? 'text-red-600' : 'text-slate-800'}`}>
              {latestVal?.heart_rate || '--'}
            </span>
            <span className="text-sm text-slate-400">bpm</span>
          </div>
          {isCritical && (
            <div className="mt-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-600 font-medium">ผิดปกติ</span>
            </div>
          )}
        </div>
      </div>

      {/* Temperature */}
      <div className="relative overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <Thermometer className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Temperature</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold text-slate-800">
              {latestVal?.temperature || '--'}
            </span>
            <span className="text-sm text-slate-400">°C</span>
          </div>
        </div>
      </div>

      {/* Battery */}
      <div className="relative overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Battery className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Battery</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-semibold text-slate-800">
              {latestVal?.BatteryPercent || '--'}
            </span>
            <span className="text-sm text-slate-400">%</span>
          </div>
          {/* Battery Bar */}
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${latestVal?.BatteryPercent || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Posture */}
      <div className={`relative overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-all ${postureInfo.bg} ${postureInfo.border}`}>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${postureInfo.color}15` }}>
              <User className="w-4 h-4" style={{ color: postureInfo.color }} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Posture</span>
          </div>
          <div className={`text-sm font-medium ${postureInfo.textColor}`}>
            {postureInfo.text}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Level {latestVal?.posture || 0}
          </div>
        </div>
      </div>

    </div>
  );
}