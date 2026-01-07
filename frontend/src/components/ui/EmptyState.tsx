import { ReactNode } from 'react';
import { Info } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  cta?: ReactNode;
}

export function EmptyState({ title, description, cta }: Props) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center mb-6">
        <Info className="text-gray-400" size={32} />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      {cta}
    </div>
  );
}
