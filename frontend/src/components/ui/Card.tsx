import { ReactNode, MouseEventHandler, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
}

export function Card({ children, className = '', onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: `hsl(var(--card-bg))`,
        borderColor: `hsl(var(--card-border))`,
        color: `hsl(var(--text))`,
        ...(style || {}),
      }}
      className={`rounded-lg shadow-sm border transition-colors ${className}`}
    >
      {children}
    </div>
  );
}
