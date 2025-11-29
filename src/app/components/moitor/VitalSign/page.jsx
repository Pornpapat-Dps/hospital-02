export default function VitalSign({ icon: Icon, label, value, unit, colorClass = 'blue' }) {
  const colors = {
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      value: 'text-red-700',
      unit: 'text-red-500'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      value: 'text-green-700',
      unit: 'text-green-500'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      value: 'text-blue-700',
      unit: 'text-blue-500'
    }
  };

  const color = colors[colorClass] || colors.blue;

  return (
    <div className={`rounded-lg p-3 ${color.bg}`}>
      <div className="flex items-center gap-1 mb-1">
        <Icon className={`w-4 h-4 ${color.text}`} />
        <p className={`text-xs font-semibold ${color.text}`}>{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color.value}`}>{value}</p>
      <p className={`text-xs ${color.unit}`}>{unit}</p>
    </div>
  );
}