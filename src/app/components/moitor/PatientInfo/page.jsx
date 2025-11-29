import { User } from 'lucide-react';

export default function PatientInfo({ patientName, hn }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <User className="w-4 h-4 text-gray-500" />
        <p className="text-sm font-semibold text-gray-800 truncate">
          {patientName || 'Unknown'}
        </p>
      </div>
      <p className="text-xs text-gray-500 ml-6">HN: {hn || '-'}</p>
    </div>
  );
}