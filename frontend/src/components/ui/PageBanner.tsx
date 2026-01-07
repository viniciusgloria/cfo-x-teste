import { ReactNode, CSSProperties } from 'react';
import { Card } from './Card';

interface PageBannerProps {
  title: string;
  icon?: ReactNode;
  right?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PageBanner({ title, icon, right, className = '', style }: PageBannerProps) {
  return (
    <Card className={`p-4 flex items-center justify-between h-16 ${className}`} style={style}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-emerald-600">{icon}</div>}
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      <div className="flex items-center gap-3">
        {right}
      </div>
    </Card>
  );
}

export default PageBanner;
