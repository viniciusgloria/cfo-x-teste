import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'outlineDanger' | 'outlineContrast' | 'intervalStart' | 'intervalEnd';
  children: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  className = '',
  loading = false,
  type = 'button', // default to button to avoid unintended form submissions
  ...props
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-[hsl(var(--primary))]',
    secondary: 'bg-[#1F2937] text-white hover:bg-[#374151] focus-visible:ring-[hsl(var(--primary))]',
    intervalStart: 'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500',
    intervalEnd: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-[hsl(var(--primary))] dark:text-white',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-[hsl(var(--primary))] dark:text-white',
    outlineDanger: 'border-2 border-red-300 text-red-600 hover:bg-red-50 focus-visible:ring-red-300 dark:text-white',
    outlineContrast: 'border-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 focus-visible:ring-[hsl(var(--primary))] dark:bg-transparent dark:border-gray-700 dark:text-white'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className}`}
      disabled={props.disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2" strokeWidth="3" />
            <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="sr-only">Carregando</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
