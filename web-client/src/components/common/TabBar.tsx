import React from 'react';
import { X, Layers, Plus } from 'lucide-react';
import { OpenTab } from '../../types/erp';

interface TabBarProps {
  openTabs: OpenTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onOpenQuickLauncher: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  openTabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onOpenQuickLauncher,
}) => {
  return (
    <div className="flex items-center justify-between bg-slate-200 border-b border-slate-300 px-2 py-1 select-none">
      <div className="flex items-center gap-1 overflow-x-auto max-w-[calc(100%-140px)]">
        {openTabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-t text-xs font-medium cursor-pointer border transition shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 border-slate-300 border-b-transparent shadow-xs font-semibold'
                  : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-50'
              }`}
            >
              <span className="truncate max-w-[160px]">{tab.title}</span>
              {openTabs.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-100 transition"
                  title="إغلاق الشاشة"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenQuickLauncher}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-white text-slate-700 text-xs border border-slate-300 transition cursor-pointer"
          title="فتح شاشة جديدة من الدليل"
        >
          <Plus className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">شاشة جديدة</span>
        </button>
      </div>
    </div>
  );
};
