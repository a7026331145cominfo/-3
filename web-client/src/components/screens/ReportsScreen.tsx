import React, { useState } from 'react';
import {
  Percent,
  Activity,
  Calendar,
  UserCheck,
  Printer,
  Download,
  BookOpen
} from 'lucide-react';
import { erpDb } from '../../services/erpDatabase';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface ReportsProps {
  initialReport?: 'vat' | 'movement' | 'daily' | 'salesman';
  selectedItemId?: number;
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const ReportsScreen: React.FC<ReportsProps> = ({
  initialReport = 'vat',
  selectedItemId,
  onOpenScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'vat' | 'movement' | 'daily' | 'salesman'>(
    selectedItemId ? 'movement' : initialReport
  );

  const salesInvoices = erpDb.getSalesInvoices();
  const purchaseInvoices = erpDb.getPurchaseInvoices();
  const vouchers = erpDb.getVouchers();
  const items = erpDb.getItems();

  // Movement Report item
  const [movementItemId, setMovementItemId] = useState<number>(selectedItemId || items[0]?.id || 1);
  const movementData = erpDb.getItemMovements(movementItemId);

  // VAT calculations
  const salesTax = salesInvoices.reduce((s, i) => s + i.taxTotal, 0);
  const salesBase = salesInvoices.reduce((s, i) => s + (i.subTotal - i.discountTotal), 0);
  const purchaseTax = purchaseInvoices.reduce((s, i) => s + i.taxTotal, 0);
  const purchaseBase = purchaseInvoices.reduce((s, i) => s + i.subTotal, 0);
  const netVatPayable = salesTax - purchaseTax;

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="مركز التقارير المالية والضريبية"
        screenId={activeTab === 'vat' ? 50 : activeTab === 'movement' ? 60 : activeTab === 'daily' ? 41 : 127}
        category="التقارير والاستعلامات"
        icon={<Activity className="w-4 h-4 text-white" />}
        description="إقرارات ضريبة القيمة المضافة ZATCA، كروت حركة الصنف، حركات الصناديق اليومية، ومبيعات المناديب"
        onOpenScreen={onOpenScreen}
      />

      {/* Real In-Screen Links Toolbar matching Reports Forms */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] p-1.5 flex flex-wrap items-center gap-1.5 text-xs shadow-2xs rounded-xs">
        <button
          type="button"
          onClick={() => onOpenScreen(43)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          كشف حساب دفتر الأستاذ
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(59)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          فاتورة مبيعات
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(15)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          فاتورة مشتريات
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(8)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          بطاقة الصنف
        </button>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('vat')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vat'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Percent className={`w-3.5 h-3.5 ${activeTab === 'vat' ? 'text-white' : 'text-emerald-600'}`} />
            <span>إقرار ضريبة القيمة المضافة (ZATCA VAT)</span>
          </button>

          <button
            onClick={() => setActiveTab('movement')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'movement'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${activeTab === 'movement' ? 'text-white' : 'text-teal-600'}`} />
            <span>كرت حركة صنف بالمستودعات</span>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${activeTab === 'daily' ? 'text-white' : 'text-blue-600'}`} />
            <span>حركة الصناديق والعمليات اليومية</span>
          </button>

          <button
            onClick={() => setActiveTab('salesman')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'salesman'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <UserCheck className={`w-3.5 h-3.5 ${activeTab === 'salesman' ? 'text-white' : 'text-purple-600'}`} />
            <span>تقرير مبيعات المناديب</span>
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-[#cbd5e1] rounded-xs text-xs font-bold transition cursor-pointer shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>طباعة التقرير</span>
        </button>
      </div>

      {/* TAB 1: VAT Report */}
      {activeTab === 'vat' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-600" />
                <span>إقرار ضريبة القيمة المضافة 15% (GetReport_VatReport)</span>
              </h2>
              <span className="text-xs text-slate-500">
                حسب معايير هيئة الزكاة والضريبة والجمارك (ZATCA)
              </span>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded">
              الفترة الضريبية الحالية (2026)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Sales VAT (Outputs) */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
                1. المبيعات الخاضعة للنسبة الأساسية 15% (المخرجات)
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-600">إجمالي المبيعات الخاضعة للضريبة:</span>
                <span className="font-mono font-bold">{salesBase.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-800 pt-2 border-t border-slate-200">
                <span>ضريبة المخرجات المستحقة (15%):</span>
                <span className="font-mono">{salesTax.toLocaleString()} ر.س</span>
              </div>
            </div>

            {/* Purchases VAT (Inputs) */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2">
                2. المشتريات الخاضعة للنسبة الأساسية 15% (المدخلات القابلة للخصم)
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-600">إجمالي المشتريات الخاضعة للضريبة:</span>
                <span className="font-mono font-bold">{purchaseBase.toLocaleString()} ر.س</span>
              </div>
              <div className="flex justify-between font-bold text-blue-800 pt-2 border-t border-slate-200">
                <span>ضريبة المدخلات القابلة للاسترداد (15%):</span>
                <span className="font-mono">{purchaseTax.toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          {/* Net VAT Card */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-600 block">صافي الضريبة المستحقة السداد للهيئة:</span>
              <span className="text-2xl font-black font-mono text-amber-950">
                {netVatPayable.toLocaleString()} ر.س
              </span>
            </div>
            <div className="text-left text-xs text-slate-600">
              <p className="font-semibold">تاريخ الاستحقاق: نهاية الشهر التالي</p>
              <p>حساب الأمانات: 2102 — أمانات ضريبة القيمة المضافة</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Item Movement Ledger */}
      {activeTab === 'movement' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">اختر الصنف:</label>
              <select
                value={movementItemId}
                onChange={(e) => setMovementItemId(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (الباركود: {i.barcode})
                  </option>
                ))}
              </select>
            </div>

            {movementData.item && (
              <div className="text-xs font-bold text-slate-800">
                الرصيد الفعلي الحالي في المستودع:{' '}
                <span className="font-mono text-emerald-700 text-sm">
                  {movementData.item.currentStock} وحدة
                </span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">نوع الحركة</th>
                  <th className="p-2.5">رقم المستند</th>
                  <th className="p-2.5">الطرف (العميل / المورد)</th>
                  <th className="p-2.5 text-center">الوارد (+)</th>
                  <th className="p-2.5 text-center">المنصرف (-)</th>
                  <th className="p-2.5 text-center">الرصيد بعد الحركة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movementData.rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      لا توجد حركات بيع أو شراء مسجلة لهذا الصنف حتى الآن.
                    </td>
                  </tr>
                ) : (
                  movementData.rows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-mono text-slate-600">{r.date}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{r.type}</td>
                      <td className="p-2.5 font-mono font-bold text-blue-700">{r.docNo}</td>
                      <td className="p-2.5 text-slate-700">{r.partyName}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-700">
                        {r.qtyIn > 0 ? `+${r.qtyIn}` : '—'}
                      </td>
                      <td className="p-2.5 text-center font-mono font-bold text-rose-700">
                        {r.qtyOut > 0 ? `-${r.qtyOut}` : '—'}
                      </td>
                      <td className="p-2.5 text-center font-mono font-black text-slate-900 bg-slate-50">
                        {r.runningStock} وحدة
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Daily Movements */}
      {activeTab === 'daily' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-200 pb-2 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">
              ملخص الحركات اليومية لجميع الفروع (GetReport_MovementsDailyReport)
            </span>
            <span className="text-slate-500">تاريخ اليوم: {new Date().toISOString().split('T')[0]}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-slate-600 block mb-1">إجمالي مبيعات اليوم:</span>
              <span className="text-xl font-bold font-mono text-blue-900">
                {salesInvoices.reduce((s, i) => s + i.grandTotal, 0).toLocaleString()} ر.س
              </span>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-slate-600 block mb-1">إجمالي مقبوضات الخزينة اليوم:</span>
              <span className="text-xl font-bold font-mono text-emerald-900">
                {vouchers
                  .filter((v) => v.kind === 'receipt')
                  .reduce((s, v) => s + v.amount, 0)
                  .toLocaleString()}{' '}
                ر.س
              </span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="text-slate-600 block mb-1">إجمالي مدفوعات الصندوق اليوم:</span>
              <span className="text-xl font-bold font-mono text-rose-900">
                {vouchers
                  .filter((v) => v.kind === 'payment')
                  .reduce((s, v) => s + v.amount, 0)
                  .toLocaleString()}{' '}
                ر.س
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Salesman Report */}
      {activeTab === 'salesman' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="border-b border-slate-200 pb-2 text-xs font-bold text-slate-800">
            تقرير مبيعات المناديب والعمولات (GetReport_OrdersBySalesMan)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">المندوب</th>
                  <th className="p-2.5">الفرع</th>
                  <th className="p-2.5 text-center">عدد الفواتير</th>
                  <th className="p-2.5 text-left">إجمالي المبيعات</th>
                  <th className="p-2.5 text-left">العمولة المستحقة (2.5%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900">أ/ فهد بن ناصر القحطاني</td>
                  <td className="p-2.5 text-slate-600">الفرع الرئيسي - الرياض</td>
                  <td className="p-2.5 text-center font-mono">{salesInvoices.length}</td>
                  <td className="p-2.5 text-left font-mono font-bold text-slate-800">
                    {salesInvoices.reduce((s, i) => s + i.grandTotal, 0).toLocaleString()} ر.س
                  </td>
                  <td className="p-2.5 text-left font-mono font-bold text-emerald-700">
                    {(salesInvoices.reduce((s, i) => s + i.grandTotal, 0) * 0.025).toLocaleString()} ر.س
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
