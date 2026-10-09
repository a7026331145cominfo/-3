import React from 'react';
import { InternalScreenLinksBar } from './InternalScreenLinksBar';
import { RotateCcw } from 'lucide-react';

interface UnifiedScreenHeaderProps {
  title: string;
  screenId?: number;
  category?: string;
  icon?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  onOpenScreen?: (screenId: number, params?: Record<string, any>) => void;
  onRefresh?: () => void;
  badge?: string;
}

export const UnifiedScreenHeader: React.FC<UnifiedScreenHeaderProps> = ({
  title,
  screenId,
  category = 'نظام الصقر ERP',
  icon,
  description,
  actions,
  onOpenScreen,
  onRefresh,
  badge,
}) => {
  return (
    <div className="bg-white border border-[#cbd5e1] shadow-2xs rounded-t-sm mb-2 select-none">
      {/* 1. Main Title Bar */}
      <div className="bg-gradient-to-l from-[#005a9e] to-[#0078d7] text-white px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#004b85]">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <div className="w-7 h-7 rounded-sm bg-white/15 flex items-center justify-center text-white shadow-2xs">
              {icon}
            </div>
          ) : (
            <div className="w-7 h-7 rounded-sm bg-white/15 flex items-center justify-center text-sm shadow-2xs">
              🦅
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide drop-shadow-2xs">{title}</h1>
              {screenId !== undefined && (
                <span className="font-mono text-[11px] bg-black/25 px-1.5 py-0.2 rounded text-blue-100 border border-white/20">
                  #{screenId}
                </span>
              )}
              {badge && (
                <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded font-bold shadow-2xs">
                  {badge}
                </span>
              )}
            </div>
            {description && (
              <p className="text-[11px] text-blue-100/90 font-normal leading-tight mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {category && (
            <span className="text-[11px] bg-white/15 text-white px-2 py-0.5 rounded-xs border border-white/20 font-medium">
              القسم: {category}
            </span>
          )}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              title="تحديث البيانات"
              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {actions}
        </div>
      </div>

      {/* 2. Embedded Universal Internal Links Bar (if onOpenScreen provided) */}
      {onOpenScreen && (
        <InternalScreenLinksBar onOpenScreen={onOpenScreen} currentScreenTitle={title} />
      )}
    </div>
  );
};
