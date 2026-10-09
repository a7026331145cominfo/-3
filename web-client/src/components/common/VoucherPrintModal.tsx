import React from 'react';
import { Printer, X } from 'lucide-react';

interface VoucherPrintModalProps {
  title: string;
  docNo: string;
  date: string;
  partyName: string;
  amount: number;
  statement: string;
  items?: { name: string; qty: number; price: number; tax: number; total: number }[];
  taxTotal?: number;
  onClose: () => void;
}

export const VoucherPrintModal: React.FC<VoucherPrintModalProps> = ({
  title,
  docNo,
  date,
  partyName,
  amount,
  statement,
  items,
  taxTotal,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-l from-[#005a9e] to-[#0078d7] text-white border-b border-[#004b85]">
          <div className="flex items-center gap-2 font-bold text-xs">
            <Printer className="w-4 h-4 text-white" />
            <span>معاينة الطباعة — {title} ({docNo})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-[#005a9e] font-bold rounded text-xs transition cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة المستند</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-red-600 px-2 py-0.5 rounded transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div id="printable-voucher" className="p-8 text-right overflow-y-auto space-y-6">
          {/* Company Official Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-900">مؤسسة الصقر للتجارة والصناعة</h1>
              <p className="text-xs text-slate-600">المملكة العربية السعودية — الرياض — س.ت: 1010899201</p>
              <p className="text-xs text-slate-600">الرقم الضريبي الموحد: 310245678900003</p>
            </div>
            <div className="text-left space-y-1">
              <div className="w-14 h-14 rounded-full border-2 border-amber-600 flex items-center justify-center font-black text-xl text-amber-700 bg-amber-50 mx-auto">
                🦅
              </div>
              <div className="text-[10px] text-slate-500 font-mono text-center">Al-Saqar ERP</div>
            </div>
          </div>

          {/* Doc Title & Meta */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 block">نوع السند / الفاتورة</span>
              <span className="text-base font-bold text-slate-900">{title}</span>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 block">الرقم المرجعي:</span>
              <span className="text-sm font-mono font-bold text-amber-700">{docNo}</span>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-500 block">التاريخ:</span>
              <span className="text-sm font-bold text-slate-800">{date}</span>
            </div>
          </div>

          {/* Recipient / Customer */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
              <span className="text-slate-500">المستفيد / العميل / المورد:</span>
              <p className="font-bold text-sm text-slate-900">{partyName || 'العميل النقدي العام'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
              <span className="text-slate-500">البيان / الشرح:</span>
              <p className="font-medium text-slate-800">{statement || 'لا يوجد ملاحظات إضافية'}</p>
            </div>
          </div>

          {/* Items table if invoice */}
          {items && items.length > 0 && (
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">الصنف والبيان</th>
                    <th className="p-2 text-center">الكمية</th>
                    <th className="p-2 text-left">السعر</th>
                    <th className="p-2 text-left">الضريبة 15%</th>
                    <th className="p-2 text-left">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-slate-500">{idx + 1}</td>
                      <td className="p-2 font-semibold text-slate-800">{it.name}</td>
                      <td className="p-2 text-center">{it.qty}</td>
                      <td className="p-2 text-left">{it.price.toLocaleString()} ر.س</td>
                      <td className="p-2 text-left">{it.tax.toLocaleString()} ر.س</td>
                      <td className="p-2 text-left font-bold">{it.total.toLocaleString()} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Total & Summary */}
          <div className="flex items-center justify-between bg-amber-50/80 border-2 border-amber-300 p-4 rounded-lg">
            <div className="space-y-1">
              <span className="text-xs text-slate-600 block">المبلغ الإجمالي المستحق:</span>
              <span className="text-xl font-black text-amber-900 font-mono">
                {amount.toLocaleString()} ر.س
              </span>
              {taxTotal !== undefined && taxTotal > 0 && (
                <span className="text-xs text-slate-500 block">
                  (شامل ضريبة القيمة المضافة: {taxTotal.toLocaleString()} ر.س)
                </span>
              )}
            </div>

            {/* Simulated ZATCA QR Code Placeholder */}
            <div className="text-center">
              <div className="w-20 h-20 bg-white border border-slate-400 p-1 rounded shadow-xs flex flex-col items-center justify-center">
                <div className="grid grid-cols-4 gap-0.5 w-16 h-16 bg-slate-900 p-0.5">
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-slate-900"></div>
                  <div className="bg-white"></div>
                  <div className="bg-white"></div>
                </div>
              </div>
              <span className="text-[9px] text-slate-500 mt-1 block">رمز الاستجابة ZATCA</span>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-8 text-center text-xs text-slate-700">
            <div className="border-t border-slate-400 pt-2">
              <span className="block font-semibold">المحاسب المالي</span>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <span className="block font-semibold">أمين الصندوق / المستودع</span>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <span className="block font-semibold">المستلم / المعتمد</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
