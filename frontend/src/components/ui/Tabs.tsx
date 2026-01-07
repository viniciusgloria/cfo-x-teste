import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, children, className = '' }: TabsProps) {
  return (
    <div className={className}>
      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab.id
                ? 'text-[#10B981] border-[#10B981]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <span className="ml-2 text-gray-500">({tab.count})</span>}
          </button>
        ))}
      </div>
      <div className="pt-6">
        {children}
      </div>
    </div>
  );
}
