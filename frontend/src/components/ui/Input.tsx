import { InputHTMLAttributes, ReactNode, useState, useRef, useLayoutEffect } from 'react';
import { formatCNPJ, formatCPF, formatPhone, formatCEP, onlyDigits } from '../../utils/validation';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  isPassword?: boolean;
  /** optional mask type: 'cnpj' | 'cpf' | 'telefone' | 'cep' */
  mask?: 'cnpj' | 'cpf' | 'telefone' | 'cep';
}

export function Input({
  leftIcon,
  isPassword = false,
  type = 'text',
  className = '',
  mask,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // store pending desired digit position after formatting
  const pendingDigitsRef = useRef<number | null>(null);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // compute the formatted value from props.value so both render and effects use the same string
  const formattedValue = (() => {
    if (mask && typeof props.value === 'string') {
      switch (mask) {
        case 'cnpj': return formatCNPJ(props.value);
        case 'cpf': return formatCPF(props.value);
        case 'telefone': return formatPhone(props.value);
        case 'cep': return formatCEP(props.value);
      }
    }
    return props.value as any;
  })();

  useLayoutEffect(() => {
    // if there's a pending digit cursor request, place the caret accordingly
    const pending = pendingDigitsRef.current;
    if (pending == null) return;
    const el = inputRef.current;
    if (!el) { pendingDigitsRef.current = null; return; }

    const formatted = String(formattedValue || '');
    // find the position in formatted string that corresponds to `pending` digits to the left
    let digits = 0;
    let pos = 0;
    while (pos < formatted.length && digits < pending) {
      if (/\d/.test(formatted[pos])) digits++;
      pos++;
    }
    // set caret (clamp)
    const setPos = Math.min(pos, formatted.length);
    try { el.setSelectionRange(setPos, setPos); } catch (e) { /* ignore if not supported */ }
    pendingDigitsRef.current = null;
  }, [formattedValue]);

  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {leftIcon}
        </div>
      )}
      <input
        ref={inputRef}
        type={inputType}
        className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all ${
          leftIcon ? 'pl-10' : ''
        } ${isPassword ? 'pr-10' : ''} ${className}`}
        value={formattedValue}
        onChange={(e) => {
          const target = e.target as HTMLInputElement;
          const v = target.value;

          if (mask) {
            // calculate how many digits are to the left of the caret in the raw user input
            const caret = target.selectionStart ?? v.length;
            const digitsToLeft = onlyDigits(v.slice(0, caret)).length;
            pendingDigitsRef.current = digitsToLeft;

            let formatted = v;
            switch (mask) {
              case 'cnpj': formatted = formatCNPJ(v); break;
              case 'cpf': formatted = formatCPF(v); break;
              case 'telefone': formatted = formatPhone(v); break;
              case 'cep': formatted = formatCEP(v); break;
            }

            // forward formatted value to parent
            props.onChange?.({
              ...e,
              target: { ...e.target, value: formatted }
            } as any);
            return;
          }

          props.onChange?.(e as any);
        }}
        {...(mask ? {} : props)}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}
