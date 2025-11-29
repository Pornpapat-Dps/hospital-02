import { Battery } from 'lucide-react';

export default function BatteryIndicator({ percent }) {
  const getColorClass = () => {
    if (percent > 50) return 'text-green-600';
    if (percent > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${getColorClass()}`}>
      <Battery className="w-4 h-4" />
      <span className="font-semibold">{percent}%</span>
    </div>
  );
}