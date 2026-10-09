import React, { useState, useEffect } from 'react';
import { Database, Shield, Building2, Layers, Clock, CheckCircle2 } from 'lucide-react';
import { UserSession } from '../../types/erp';

interface StatusBarProps {
  user: UserSession;
  openTabsCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ user, openTabsCount }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('ar-SA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-[11px] px-3 py-1 flex flex-wrap items-center justify-between select-none shrink-0 z-30">
      <div className="flex items-center gap-4 flex-wrap">
        {/* DB Status */}
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <Database className="w-3.5 h-3.5" />
          <span>dboGTSdb2026 (متصل)</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-1 text-slate-300">
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span>المستخدم: {user.fullName} [{user.userId}]</span>
        </div>

        {/* Branch */}
        <div className="flex items-center gap-1 text-slate-300">
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
          <span>الفرع: {user.branchName}</span>
        </div>

        {/* Group */}
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <span>المجموعة: {user.groupName}</span>
        </div>

        {/* Tabs count */}
        <div className="hidden lg:flex items-center gap-1 text-slate-400">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>الشاشات المفتوحة: {openTabsCount}</span>
        </div>

        {/* Tables */}
        <div className="hidden xl:flex items-center gap-1 text-slate-400">
          <span>180 جدول قاعدة بيانات</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>النظام متصل ومتكامل</span>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{timeStr}</span>
        </div>
      </div>
    </footer>
  );
};
