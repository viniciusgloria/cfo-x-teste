import React from 'react';

type Option = { value: string; label: string };

type FilterPillProps = {
  icon?: React.ReactNode;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  className?: string;
  'aria-label'?: string;
};

export function FilterPill({ icon, value, onChange, options, className = '', ['aria-label']: ariaLabel }: FilterPillProps) {
  return (
    <div
      className={`flex items-center gap-2 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-100 border border-gray-200 dark:border-slate-700 p-2 rounded-md ${className}`.trim()}
    >
      {icon && <span className="text-gray-600 dark:text-slate-200">{icon}</span>}
      <select
        value={value}
        onChange={onChange}
        className="bg-transparent dark:bg-transparent appearance-none text-sm outline-none text-gray-700 dark:text-slate-100"
        aria-label={ariaLabel}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-800">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterPill;
