import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function Select({
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
  className = '',
  'aria-label': ariaLabel,
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`
        w-full
        px-4 py-2
        border border-gray-300 dark:border-gray-700
        rounded-lg
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-white
        focus:ring-2 focus:ring-emerald-500 focus:border-transparent
        dark:focus:ring-emerald-400
        disabled:opacity-50
        disabled:cursor-not-allowed
        transition-colors
        ${className}
      `.trim()}
      aria-label={ariaLabel}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={`${option.value}`}
          value={option.value}
          className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
