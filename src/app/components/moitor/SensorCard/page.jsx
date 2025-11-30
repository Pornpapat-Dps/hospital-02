import { Heart, Thermometer, User, Activity, Zap, AlertTriangle } from 'lucide-react';
import StatusBadge from '../StatusBadge/page';
import PatientInfo from '../PatientInfo/page';
import VitalSign from '../VitalSign/page';
import EmptyState from '../EmptyState/page';
import BatteryIndicator from '../BatteryIndicator/page';

const statusColorMap = {
  critical: 'bg-red-500',
  active: 'bg-green-500',
  available: 'bg-gray-300',
};

// ✅ เพิ่ม Posture Mapping
const postureMap = {
  0: { text: 'นอนหรือนั่งพัก', icon: User, color: 'text-blue-600' },
  1: { text: 'ยืนหรือเดินช้า', icon: Activity, color: 'text-green-600' },
  2: { text: 'เดินเร็วหรือวิ่งเบา', icon: Zap, color: 'text-orange-600' },
  3: { text: 'ล้ม', icon: AlertTriangle, color: 'text-red-600' },
};

// ✅ Helper function แปลง posture
const getPostureInfo = (posture) => {
  const postureValue = parseInt(posture);
  return postureMap[postureValue] || { 
    text: 'Unknown', 
    icon: User, 
    color: 'text-gray-400' 
  };
};

export default function SensorCard({ 
  id,
  status = 'available',
  patientName,
  hn,
  heartRate = 0,
  temperature = 0,
  batteryPercent = 0,
  posture,
  timestamp
}) {
  const borderColor = statusColorMap[status] || statusColorMap.available;
  const isAvailable = status === 'available';
  const isCritical = status === 'critical';
  
  // ✅ ดึงข้อมูล posture
  const postureInfo = getPostureInfo(posture);
  const PostureIcon = postureInfo.icon;

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
      isAvailable 
        ? 'bg-white border-2 border-dashed border-gray-300' 
        : `bg-white border-l-8 ${borderColor}`
    }`}>
      
      <div className="p-5">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <StatusBadge status={status} />
          {!isAvailable && <BatteryIndicator percent={batteryPercent} />}
        </div>

        {/* Device ID */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{id}</h3>

        {isAvailable ? (
          <EmptyState deviceId={id} />
        ) : (
          <>
            {/* Patient Info */}
            <div className="mb-3">
              <PatientInfo patientName={patientName} hn={hn} />
            </div>

            {/* Vital Signs */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <VitalSign
                icon={Heart}
                label="Heart Rate"
                value={heartRate}
                unit="bpm"
                colorClass={isCritical ? 'red' : 'green'}
              />
              <VitalSign
                icon={Thermometer}
                label="Temp"
                value={temperature}
                unit="°C"
                colorClass="blue"
              />
            </div>

            {/* Footer - แสดง Posture แบบใหม่ */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5">
                <PostureIcon className={`w-4 h-4 ${postureInfo.color}`} />
                <span className="font-medium text-gray-500">Posture:</span>
                <span className={`font-semibold ${postureInfo.color}`}>
                  {postureInfo.text}
                </span>
              </div>
              <span className="text-gray-400">{timestamp || '--:--'}</span>
            </div>

            {/* ⚠️ Alert สำหรับกรณีล้ม (posture = 3) */}
            {parseInt(posture) === 3 && (
              <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
                <span className="text-sm font-bold text-red-700">
                  🚨 ตรวจพบการล้ม! กรุณาตรวจสอบด่วน
                </span>
              </div>
            )}

            {/* Action Button */}
            <a 
              href={`/PatientMonitor/${id}`} 
              className="mt-3 block text-center bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 text-sm font-semibold py-2 rounded-lg transition-colors"
            >
              View Details →
            </a>
          </>
        )}
      </div>
    </div>
  );
}