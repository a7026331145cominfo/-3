import React, { useState } from 'react';
import {
  Building2,
  Database,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck,
  Workflow,
  Sparkles
} from 'lucide-react';
import { UserSession, Branch } from '../../types/erp';
import { erpDb } from '../../services/erpDatabase';

interface HeaderProps {
  user: UserSession;
  branches: Branch[];
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
  onSearchSelect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  branches,
  onOpenScreen,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = parseInt(e.target.value, 10);
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      erpDb.setUser({
        ...user,
        branchId: branch.id,
        branchName: `${branch.name} (${branch.id})`,
      });
    }
  };

  const handleReset = () => {
    erpDb.resetDatabase();
    setShowConfirmReset(false);
    window.location.reload();
  };

  return (
    <header className="bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm sticky top-0 z-40 select-none">
      {/* Top Header Row */}
      <div className="flex items-center justify-between px-4 py-2 text-xs border-b border-slate-800/80 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold tracking-wide text-amber-400 text-sm">
            <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow">
              🦅
            </div>
            <span>الصقر ERP</span>
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
              GTSdb2026 V4
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Database className="w-3.5 h-3.5" />
            <span>قاعدة البيانات: dboGTSdb2026 (متصل)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Action: Full System Link */}
          <button
            onClick={() => onOpenScreen(999)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition cursor-pointer"
            title="ربط وتشغيل كافة شاشات وجداول النظام"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>ربط النظام بالكامل (369 شاشة)</span>
          </button>

          {/* Quick Shortcuts */}
          <button
            onClick={() => onOpenScreen(59)}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-xs transition cursor-pointer"
          >
            <span>+ فاتورة مبيعات</span>
          </button>

          <button
            onClick={() => onOpenScreen(31)}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs transition cursor-pointer"
          >
            <span>+ سند قبض</span>
          </button>

          {/* Reset DB Demo data button */}
          <button
            onClick={() => setShowConfirmReset(true)}
            className="text-slate-400 hover:text-rose-300 flex items-center gap-1 text-[11px] px-2 py-1 rounded hover:bg-rose-950/40 transition cursor-pointer"
            title="إعادة تعيين بيانات القاعدة إلى الحالة الافتراضية"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden lg:inline">استعادة البيانات الافتراضية</span>
          </button>
        </div>
      </div>

      {/* Main Bar: User, Branch, Search */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900">
        <div className="flex items-center gap-3">
          {/* Active User */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-semibold text-slate-200">{user.fullName}</div>
              <div className="text-[10px] text-slate-400">
                المجموعة: {user.groupName} | المستخدم: #{user.userId}
              </div>
            </div>
          </div>

          {/* Branch Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2 py-1 rounded text-xs">
            <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-slate-400 text-[11px] hidden sm:inline">الفرع الحالي:</span>
            <select
              value={user.branchId}
              onChange={handleBranchChange}
              className="bg-transparent text-slate-200 font-medium text-xs focus:outline-none cursor-pointer py-0.5"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                  {b.name} [{b.id}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Global Quick Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحث في الشاشات، الجداول، أو العمليات..."
              onClick={() => onOpenScreen(999)}
              readOnly
              className="w-full bg-slate-950/80 border border-slate-700 text-slate-200 pl-3 pr-8 py-1.5 rounded text-xs focus:outline-none hover:border-amber-500/60 cursor-pointer placeholder:text-slate-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Reset */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-5 text-right shadow-xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-3">
              <RotateCcw className="w-5 h-5" />
              <span>تأكيد إعادة تعيين قاعدة البيانات</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              هل أنت متأكد من رغبتك في إعادة تعيين جميع الجداول والبيانات (الحسابات، الفواتير، السندات، الأصناف) إلى حالتها الأولية الأصلية الخاصة بنظام GTSdb2026؟
            </p>
            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                إلغاء
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium"
              >
                نعم، إعادة التعيين
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
