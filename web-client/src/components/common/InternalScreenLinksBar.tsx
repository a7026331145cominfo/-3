import React, { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';

interface InternalScreenLinksBarProps {
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
  currentScreenTitle?: string;
}

export const InternalScreenLinksBar: React.FC<InternalScreenLinksBarProps> = ({
  onOpenScreen,
}) => {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSub = (menu: string) => {
    setOpenSubMenu(openSubMenu === menu ? null : menu);
  };

  return (
    <div
      className="bg-[#f8fafc] border-b border-[#cbd5e1] px-2 py-1 flex items-center text-xs select-none relative z-30"
      onMouseLeave={() => setOpenSubMenu(null)}
    >
      <div className="relative">
        <button
          onClick={() => toggleSub('navigate')}
          className="px-2.5 py-1 hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-transparent rounded-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer transition"
        >
          <span className="w-2 h-2 rounded-full bg-[#005a9e]"></span>
          <span>انتقال داخلي سريع</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
        </button>

        {openSubMenu === 'navigate' && (
          <div className="absolute right-0 top-full mt-0.5 bg-white border border-[#cbd5e1] shadow-lg py-1 w-56 text-xs z-50 rounded-xs">
            {/* Sales submenu */}
            <div className="px-3 py-1 font-bold text-[#005a9e] bg-[#f0f7fc] border-b border-blue-100 flex items-center justify-between">
              <span>المبيعات</span>
              <span className="text-[10px] text-slate-500 font-normal">GTS Sales</span>
            </div>
            <button
              onClick={() => {
                onOpenScreen(59);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>فاتورة مبيعات وكاشير</span>
              <span className="text-[10px] opacity-75 font-mono">#59</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(14);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>مرتجعات المبيعات</span>
              <span className="text-[10px] opacity-75 font-mono">#14</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(60);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>تقرير المبيعات</span>
              <span className="text-[10px] opacity-75 font-mono">#60</span>
            </button>

            <div className="border-t border-slate-200 my-1"></div>

            {/* Purchases submenu */}
            <div className="px-3 py-1 font-bold text-[#005a9e] bg-[#f0f7fc] border-b border-blue-100 flex items-center justify-between">
              <span>المشتريات</span>
              <span className="text-[10px] text-slate-500 font-normal">GTS Purchases</span>
            </div>
            <button
              onClick={() => {
                onOpenScreen(15);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>فاتورة مشتريات</span>
              <span className="text-[10px] opacity-75 font-mono">#15</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(16);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>مرتجعات المشتريات</span>
              <span className="text-[10px] opacity-75 font-mono">#16</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(61);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>تقرير المشتريات</span>
              <span className="text-[10px] opacity-75 font-mono">#61</span>
            </button>

            <div className="border-t border-slate-200 my-1"></div>

            {/* Accounting submenu */}
            <div className="px-3 py-1 font-bold text-[#005a9e] bg-[#f0f7fc] border-b border-blue-100 flex items-center justify-between">
              <span>المحاسبة والمالية</span>
              <span className="text-[10px] text-slate-500 font-normal">GTS Accounting</span>
            </div>
            <button
              onClick={() => {
                onOpenScreen(30);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>دليل الحسابات</span>
              <span className="text-[10px] opacity-75 font-mono">#30</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(31);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>سند قبض</span>
              <span className="text-[10px] opacity-75 font-mono">#31</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(32);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>سند صرف</span>
              <span className="text-[10px] opacity-75 font-mono">#32</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(36);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>القيود اليومية</span>
              <span className="text-[10px] opacity-75 font-mono">#36</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(43);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>دفتر الأستاذ وكشف حساب</span>
              <span className="text-[10px] opacity-75 font-mono">#43</span>
            </button>

            <div className="border-t border-slate-200 my-1"></div>

            {/* Stock submenu */}
            <div className="px-3 py-1 font-bold text-[#005a9e] bg-[#f0f7fc] border-b border-blue-100 flex items-center justify-between">
              <span>المخزون والأصناف</span>
              <span className="text-[10px] text-slate-500 font-normal">GTS Inventory</span>
            </div>
            <button
              onClick={() => {
                onOpenScreen(8);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>دليل وبطاقة الأصناف</span>
              <span className="text-[10px] opacity-75 font-mono">#8</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(51);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>حركة الصنف</span>
              <span className="text-[10px] opacity-75 font-mono">#51</span>
            </button>
            <button
              onClick={() => {
                onOpenScreen(18);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>أرصدة المخزون والافتتاحية</span>
              <span className="text-[10px] opacity-75 font-mono">#18</span>
            </button>

            <div className="border-t border-slate-200 my-1"></div>

            {/* Screen Replacement browser */}
            <button
              onClick={() => {
                onOpenScreen(998);
                setOpenSubMenu(null);
              }}
              className="w-full text-right px-4 py-1.5 font-bold text-[#005a9e] hover:bg-[#005a9e] hover:text-white flex items-center justify-between cursor-pointer transition"
            >
              <span>بحث الشاشات وفهرس البدائل</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
