import { Heart, Thermometer } from 'lucide-react';
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

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span className="font-medium">
                Posture: <span className="text-gray-700">{posture || 'Unknown'}</span>
              </span>
              <span className="text-gray-400">{timestamp || '--:--'}</span>
            </div>

            {/* Action Button */}
            <a 
              href={`/patient/${id}`} 
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