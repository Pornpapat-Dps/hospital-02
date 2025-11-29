import { Activity, AlertTriangle, User } from 'lucide-react';

const statusConfig = {
  critical: { 
    icon: AlertTriangle, 
    badgeClass: 'bg-red-100 text-red-700 border-red-300',
    label: 'Critical'
  },
  active: { 
    icon: Activity, 
    badgeClass: 'bg-green-100 text-green-700 border-green-300',
    label: 'Active'
  },
  available: { 
    icon: User, 
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-300',
    label: 'Available'
  },
};

export default function StatusBadge({ status }) {
  const { icon: Icon, badgeClass, label } = statusConfig[status] || statusConfig.available;
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase border ${badgeClass}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}