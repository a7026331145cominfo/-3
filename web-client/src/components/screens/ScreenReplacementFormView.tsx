import React, { useState } from 'react';
import { ALL_SYSTEM_SCREENS } from '../../data/gts2026Metadata';
import { Search, RotateCcw, ExternalLink, X } from 'lucide-react';

interface ScreenReplacementProps {
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
  onClose?: () => void;
}

export const ScreenReplacementFormView: React.FC<ScreenReplacementProps> = ({
  onOpenScreen,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState<number | null>(
    ALL_SYSTEM_SCREENS[1]?.id || null
  );

  const filteredScreens = ALL_SYSTEM_SCREENS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.legacyName && s.legacyName.toLowerCase().includes(search.toLowerCase())) ||
      s.category.includes(search) ||
      s.screenNum.toString().includes(search)
  );

  const handleOpenSelected = () => {
    if (selectedScreenId !== null) {
      onOpenScreen(selectedScreenId);
    }
  };

  return (
    <div className="bg-white border border-[#cbd5e1] shadow-sm font-sans text-xs text-slate-800 flex flex-col h-[760px] select-none rounded-sm">
      {/* Window Header */}
      <div className="bg-gradient-to-l from-[#005a9e] to-[#0078d7] text-white px-3.5 py-2 flex justify-between items-center text-xs font-semibold rounded-t-sm border-b border-[#004b85]">
        <div className="flex items-center gap-2">
          <span>📑</span>
          <span>الصقر ERP — بدائل الشاشات الأصلية (ScreenReplacementForm)</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="hover:bg-red-600 px-2 py-0.5 text-white font-bold cursor-pointer transition text-xs rounded-2xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* WinForms FlowLayoutPanel Toolbar */}
      <div className="bg-[#f8fafc] border-b border-[#cbd5e1] px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenSelected}
            disabled={selectedScreenId === null}
            className="px-3 py-1 bg-[#005a9e] hover:bg-[#004b85] text-white font-semibold cursor-pointer disabled:opacity-50 text-xs shadow-2xs flex items-center gap-1 rounded-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>فتح البديل</span>
          </button>

          <button
            onClick={() => setSearch('')}
            className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-slate-800 font-semibold cursor-pointer text-xs shadow-2xs flex items-center gap-1 rounded-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تحديث</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-700 font-bold">بحث:</label>
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث باسم الشاشة أو رقمها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 bg-white border border-[#707070] px-2 py-1 text-xs focus:outline-none focus:border-[#0078d7]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute left-1.5 top-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="px-3 py-1.5 bg-[#fff9e6] border-b border-[#e6dbb8] text-[11px] text-amber-900">
        📌 يتم تحميل الشاشات من User_Screens وربطها بالمسار التشغيلي المعتمد في V4 مع احترام صلاحيات المجموعة.
      </div>

      {/* Classic WinForms DataGridView */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-right border-collapse text-xs">
          <thead className="bg-[#f0f0f0] border-b border-[#adadad] sticky top-0 z-10 select-none">
            <tr>
              <th className="p-2 border-l border-[#adadad] font-bold text-slate-800 w-20 text-center">رقم الشاشة</th>
              <th className="p-2 border-l border-[#adadad] font-bold text-slate-800">اسم الشاشة في النظام</th>
              <th className="p-2 border-l border-[#adadad] font-bold text-slate-800">الشاشة الأصلية (Legacy Name)</th>
              <th className="p-2 border-l border-[#adadad] font-bold text-slate-800 w-28">القسم</th>
              <th className="p-2 border-l border-[#adadad] font-bold text-slate-800 w-20 text-center">ظهور</th>
              <th className="p-2 border-l border-[#adadad] font-bold text-slate-800 w-20 text-center">صلاحية الدخول</th>
              <th className="p-2 font-bold text-slate-800 w-28 text-center">الإجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {filteredScreens.map((screen) => {
              const isSelected = selectedScreenId === screen.id;
              return (
                <tr
                  key={screen.id}
                  onClick={() => setSelectedScreenId(screen.id)}
                  onDoubleClick={() => onOpenScreen(screen.id)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? 'bg-[#0078d7] text-white'
                      : 'hover:bg-[#e5f1fb] text-slate-900'
                  }`}
                >
                  <td className={`p-2 border-l text-center font-mono font-bold ${isSelected ? 'border-blue-400' : 'border-[#e5e5e5]'}`}>
                    #{screen.screenNum}
                  </td>
                  <td className={`p-2 border-l font-semibold ${isSelected ? 'border-blue-400' : 'border-[#e5e5e5]'}`}>
                    {screen.name}
                  </td>
                  <td className={`p-2 border-l font-mono text-[11px] ${isSelected ? 'border-blue-400 text-blue-100' : 'border-[#e5e5e5] text-slate-600'}`}>
                    {screen.legacyName || '—'}
                  </td>
                  <td className={`p-2 border-l ${isSelected ? 'border-blue-400' : 'border-[#e5e5e5]'}`}>
                    {screen.category}
                  </td>
                  <td className={`p-2 border-l text-center ${isSelected ? 'border-blue-400' : 'border-[#e5e5e5]'}`}>
                    <span className="text-emerald-700 font-bold">1 (نعم)</span>
                  </td>
                  <td className={`p-2 border-l text-center ${isSelected ? 'border-blue-400' : 'border-[#e5e5e5]'}`}>
                    <span className="text-emerald-700 font-bold">مسموح</span>
                  </td>
                  <td className="p-1.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenScreen(screen.id);
                      }}
                      className={`px-2 py-0.5 border text-xs font-semibold cursor-pointer ${
                        isSelected
                          ? 'bg-white text-blue-900 border-white hover:bg-slate-100'
                          : 'bg-[#f0f0f0] hover:bg-[#e5f1fb] border-[#adadad] text-slate-800'
                      }`}
                    >
                      فتح البديل
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Grid Footer Status */}
      <div className="bg-[#f0f0f0] border-t border-[#adadad] px-3 py-1 flex justify-between items-center text-[11px] text-slate-600">
        <span>إجمالي الشاشات المتاحة: {filteredScreens.length} شاشة</span>
        <span>انقر نقراً مزدوجاً على أي سجل لفتح الشاشة مباشرة</span>
      </div>
    </div>
  );
};
