import { User } from 'lucide-react';

export default function EmptyState({ deviceId }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p className="text-sm font-semibold">พร้อมใช้งาน</p>
      <p className="text-xs">No Patient Assigned</p>
    </div>
  );
}