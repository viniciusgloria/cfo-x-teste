import React from 'react';

interface SubtasksProgressProps {
  total: number;
  completas: number;
  percentual: number;
}

export function SubtasksProgress({ total, completas, percentual }: SubtasksProgressProps) {
  if (total === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all"
          style={{ width: `${percentual}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600">
        {completas}/{total}
      </span>
    </div>
  );
}
