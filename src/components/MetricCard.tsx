interface MetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export default function MetricCard({
  label,
  value,
  change,
  changeType = 'neutral',
  icon
}: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  }[changeType];

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {change && (
        <div className={`text-sm ${changeColor}`}>
          {change}
        </div>
      )}
    </div>
  );
}
