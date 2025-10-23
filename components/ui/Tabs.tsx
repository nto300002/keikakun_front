'use client';

import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="border-b border-[#2a3441]">
        <div className="flex gap-2 overflow-x-auto hidden-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap
                border-b-2 -mb-px
                ${
                  activeTab === tab.id
                    ? 'text-[#10b981] border-[#10b981]'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
