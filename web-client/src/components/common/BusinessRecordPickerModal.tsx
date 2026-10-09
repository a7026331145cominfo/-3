import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, Check, X } from 'lucide-react';
import { erpDb } from '../../services/erpDatabase';
import { CustomerSupplier, Item } from '../../types/erp';

export type PickerType = 'customer' | 'supplier' | 'item';

interface BusinessRecordPickerModalProps {
  type: PickerType;
  title: string;
  onSelect: (record: any) => void;
  onClose: () => void;
}

export const BusinessRecordPickerModal: React.FC<BusinessRecordPickerModalProps> = ({
  type,
  title,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Load live data from erpDatabase
  const records = useMemo(() => {
    if (type === 'customer') {
      return erpDb.getCustSup().filter((c) => c.type === 'customer');
    } else if (type === 'supplier') {
      return erpDb.getCustSup().filter((c) => c.type === 'supplier');
    } else {
      return erpDb.getItems();
    }
  }, [type]);

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.trim().toLowerCase();
    return records.filter((r: any) => {
      if (type === 'customer' || type === 'supplier') {
        const c = r as CustomerSupplier;
        return (
          c.name.toLowerCase().includes(term) ||
          c.id.toString().includes(term) ||
          c.phone.toLowerCase().includes(term) ||
          c.vatNumber.toLowerCase().includes(term)
        );
      } else {
        const item = r as Item;
        return (
          item.name.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term) ||
          item.barcode.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
        );
      }
    });
  }, [records, searchTerm, type]);

  const handleConfirm = () => {
    if (selectedId === null) {
      if (filteredRecords.length > 0) {
        onSelect(filteredRecords[0]);
        onClose();
      } else {
        alert('حدد سجلًا من القائمة أولًا.');
      }
      return;
    }
    const rec = records.find((r: any) => r.id === selectedId);
    if (rec) {
      onSelect(rec);
      onClose();
    }
  };

  const handleRowDoubleClick = (record: any) => {
    onSelect(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div
        className="bg-white border border-[#cbd5e1] rounded-sm shadow-2xl w-full max-w-4xl flex flex-col font-sans text-right select-none overflow-hidden"
        style={{ height: '560px' }}
      >
        {/* Title Bar matching Unified Header */}
        <div className="bg-gradient-to-l from-[#005a9e] to-[#0078d7] text-white px-3.5 py-2 flex justify-between items-center text-xs font-semibold border-b border-[#004b85]">
          <div className="flex items-center gap-2">
            <span>🔍</span>
            <span>الصقر ERP — {title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-600 px-2 py-0.5 rounded-2xs transition cursor-pointer text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-[#f8fafc] border-b border-[#cbd5e1] p-2 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                type === 'item'
                  ? 'اكتب اسم الصنف أو الكود أو الباركود ثم اضغط بحث...'
                  : 'اكتب اسم العميل/المورد أو رقم الهاتف أو الرقم الضريبي...'
              }
              className="w-full bg-white border border-[#cbd5e1] rounded-xs px-3 py-1.5 text-xs focus:border-[#0078d7] focus:outline-none text-slate-900"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
          </div>
          <button
            onClick={() => {}}
            className="px-3.5 py-1.5 bg-white hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1] rounded-xs text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1 shadow-2xs transition"
          >
            <Search className="w-3.5 h-3.5 text-[#005a9e]" />
            <span>بحث</span>
          </button>
          <button
            onClick={() => setSearchTerm('')}
            className="px-3 py-1.5 bg-white hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1] rounded-xs text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1 shadow-2xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#005a9e]" />
            <span>تحديث</span>
          </button>
        </div>

        {/* Table Grid (DataGridView style) */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-xs text-right border-collapse">
            <thead className="bg-[#f1f5f9] sticky top-0 border-b border-[#cbd5e1] text-slate-800 font-bold">
              <tr>
                {type !== 'item' ? (
                  <>
                    <th className="p-2 border-r border-[#e2e8f0] w-16">رقم الحساب</th>
                    <th className="p-2 border-r border-[#e2e8f0]">الاسم</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-32">الهاتف</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-36">الرقم الضريبي</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-28">الرصيد الحالي</th>
                    <th className="p-2 border-r border-[#e2e8f0]">العنوان</th>
                  </>
                ) : (
                  <>
                    <th className="p-2 border-r border-[#e2e8f0] w-16">الرقم</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-28">كود الصنف</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-32">الباركود</th>
                    <th className="p-2 border-r border-[#e2e8f0]">اسم الصنف</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-24">الوحدة</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-24">سعر البيع</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-24">سعر التكلفة</th>
                    <th className="p-2 border-r border-[#e2e8f0] w-24">الرصيد المتاح</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    لا توجد سجلات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r: any) => {
                  const isSelected = selectedId === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      onDoubleClick={() => handleRowDoubleClick(r)}
                      className={`border-b border-[#f1f5f9] cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#005a9e] text-white font-medium'
                          : 'hover:bg-[#e5f1fb] text-slate-800'
                      }`}
                    >
                      {type !== 'item' ? (
                        <>
                          <td className="p-2 border-r border-[#e2e8f0] font-mono">{r.id}</td>
                          <td className="p-2 border-r border-[#e2e8f0] font-medium">{r.name}</td>
                          <td className="p-2 border-r border-[#e2e8f0] font-mono">{r.phone || '—'}</td>
                          <td className="p-2 border-r border-[#e2e8f0] font-mono">{r.vatNumber || '—'}</td>
                          <td className={`p-2 border-r border-[#e2e8f0] font-mono font-bold ${isSelected ? 'text-white' : 'text-[#005a9e]'}`}>
                            {(r.currentBalance || 0).toLocaleString()} ر.س
                          </td>
                          <td className="p-2 border-r border-[#e2e8f0]">{r.address || '—'}</td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 border-r border-[#e2e8f0] font-mono">{r.id}</td>
                          <td className="p-2 border-r border-[#e2e8f0] font-mono">{r.code}</td>
                          <td className="p-2 border-r border-[#e2e8f0] font-mono">{r.barcode}</td>
                          <td className="p-2 border-r border-[#e2e8f0] font-medium">{r.name}</td>
                          <td className="p-2 border-r border-[#e2e8f0]">{r.unit}</td>
                          <td className={`p-2 border-r border-[#e2e8f0] font-mono font-bold ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                            {(r.salePrice || 0).toLocaleString()} ر.س
                          </td>
                          <td className="p-2 border-r border-[#e2e8f0] font-mono">
                            {(r.costPrice || 0).toLocaleString()} ر.س
                          </td>
                          <td className="p-2 border-r border-[#e2e8f0] font-mono font-semibold">
                            {(r.stockQty || 0).toLocaleString()}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Status & Actions */}
        <div className="bg-[#f8fafc] border-t border-[#cbd5e1] p-2.5 flex justify-between items-center">
          <span className="text-[11px] text-slate-600">
            عدد السجلات: <strong className="text-[#005a9e]">{filteredRecords.length}</strong> | انقر مرتين لاختيار السجل فوراً
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirm}
              className="px-5 py-1.5 bg-[#005a9e] hover:bg-[#004b85] text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 rounded-xs shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>اختيار السجل</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded-xs text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs transition"
            >
              <span>إلغاء</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
