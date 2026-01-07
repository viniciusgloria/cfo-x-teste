interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ progress, showLabel = true, className = '' }: ProgressBarProps) {
  const getColor = (value: number) => {
    if (value >= 75) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${getColor(progress)}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {showLabel && <span className="text-sm font-medium text-gray-700 ml-2 min-w-fit">{progress}%</span>}
      </div>
    </div>
  );
}

interface CircularProgressProps {
  progress: number;
  size?: number;
  className?: string;
}

export function CircularProgress({ progress, size = 120, className = '' }: CircularProgressProps) {
  const getColor = (value: number) => {
    if (value >= 75) return '#10B981';
    if (value >= 40) return '#EAB308';
    return '#EF4444';
  };

  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor(progress)}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-800">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
