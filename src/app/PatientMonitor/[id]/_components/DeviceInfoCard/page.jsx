import { Activity, Smartphone, MapPin, Package } from 'lucide-react';

export default function DeviceInfoCard({ deviceId, deviceInfo }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <Activity className="w-5 h-5 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">ข้อมูลอุปกรณ์</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        
        {/* Device ID */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Device ID</span>
          </div>
          <span className="font-mono font-semibold text-slate-700 text-sm">{deviceId}</span>
        </div>

        {/* Model */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Model</span>
          </div>
          <span className="text-slate-700 font-semibold text-sm">{deviceInfo?.model || '-'}</span>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-slate-600">Location</span>
          </div>
          <span className="text-blue-700 font-semibold text-sm">{deviceInfo?.location || '-'}</span>
        </div>

      </div>
    </div>
  );
}