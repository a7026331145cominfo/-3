import React, { useState } from 'react';
import { erpDb } from '../../services/erpDatabase';
import { RotateCcw } from 'lucide-react';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface ShowDashboardViewProps {
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const ShowDashboardView: React.FC<ShowDashboardViewProps> = ({ onOpenScreen }) => {
  const [activeTab, setActiveTab] = useState<'trans' | 'sales' | 'purchases' | 'accounts'>('trans');
  const [, setRefreshKey] = useState(0);

  const accounts = erpDb.getAccounts();
  const items = erpDb.getItems();
  const sales = erpDb.getSalesInvoices();
  const purchases = erpDb.getPurchaseInvoices();
  const journalEntries = erpDb.getJournalEntries();
  const user = erpDb.getUser();

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-2 text-right select-none flex flex-col h-full min-h-[650px]">
      {/* 1. Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="لوحة تشغيل الصقر ERP"
        screenId={0}
        category="لوحة التحكم الرئيسية"
        icon={<span className="text-base">🖥️</span>}
        description={`المستخدم: ${user.userName} | الفرع: ${user.branchId} | متصل بقاعدة بيانات dboGTSdb2026 الحقيقية`}
        onOpenScreen={onOpenScreen}
        onRefresh={handleRefresh}
      />

      {/* 2. KPI Cards Flow (175px x 78px) matching Card() in ClassicMainForm */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        <div
          onClick={() => onOpenScreen(30)}
          className="w-[175px] h-[78px] bg-white border border-[#cbd5e1] hover:border-[#0078d7] hover:bg-[#f0f7fc] cursor-pointer flex flex-col justify-between p-1.5 shadow-2xs transition rounded-xs"
        >
          <span className="text-xs text-slate-700 font-bold text-center border-b border-slate-200 pb-0.5">
            الحسابات
          </span>
          <span
            className="text-2xl font-bold text-[#005a9e] text-center my-auto font-mono"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {accounts.length}
          </span>
        </div>

        <div
          onClick={() => onOpenScreen(8)}
          className="w-[175px] h-[78px] bg-white border border-[#cbd5e1] hover:border-[#0078d7] hover:bg-[#f0f7fc] cursor-pointer flex flex-col justify-between p-1.5 shadow-2xs transition rounded-xs"
        >
          <span className="text-xs text-slate-700 font-bold text-center border-b border-slate-200 pb-0.5">
            الأصناف
          </span>
          <span
            className="text-2xl font-bold text-[#005a9e] text-center my-auto font-mono"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {items.length}
          </span>
        </div>

        <div
          onClick={() => onOpenScreen(59)}
          className="w-[175px] h-[78px] bg-white border border-[#cbd5e1] hover:border-[#0078d7] hover:bg-[#f0f7fc] cursor-pointer flex flex-col justify-between p-1.5 shadow-2xs transition rounded-xs"
        >
          <span className="text-xs text-slate-700 font-bold text-center border-b border-slate-200 pb-0.5">
            المبيعات
          </span>
          <span
            className="text-2xl font-bold text-[#005a9e] text-center my-auto font-mono"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {sales.length}
          </span>
        </div>

        <div
          onClick={() => onOpenScreen(15)}
          className="w-[175px] h-[78px] bg-white border border-[#cbd5e1] hover:border-[#0078d7] hover:bg-[#f0f7fc] cursor-pointer flex flex-col justify-between p-1.5 shadow-2xs transition rounded-xs"
        >
          <span className="text-xs text-slate-700 font-bold text-center border-b border-slate-200 pb-0.5">
            المشتريات
          </span>
          <span
            className="text-2xl font-bold text-[#005a9e] text-center my-auto font-mono"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {purchases.length}
          </span>
        </div>

        <div
          onClick={() => onOpenScreen(36)}
          className="w-[175px] h-[78px] bg-white border border-[#cbd5e1] hover:border-[#0078d7] hover:bg-[#f0f7fc] cursor-pointer flex flex-col justify-between p-1.5 shadow-2xs transition rounded-xs"
        >
          <span className="text-xs text-slate-700 font-bold text-center border-b border-slate-200 pb-0.5">
            القيود
          </span>
          <span
            className="text-2xl font-bold text-[#005a9e] text-center my-auto font-mono"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            {journalEntries.length}
          </span>
        </div>

        <div
          onClick={() => onOpenScreen(1)}
          className="w-[175px] h-[78px] bg-white border border-[#cbd5e1] hover:border-[#0078d7] hover:bg-[#f0f7fc] cursor-pointer flex flex-col justify-between p-1.5 shadow-2xs transition rounded-xs"
        >
          <span className="text-xs text-slate-700 font-bold text-center border-b border-slate-200 pb-0.5">
            المستخدمون
          </span>
          <span
            className="text-2xl font-bold text-[#005a9e] text-center my-auto font-mono"
            style={{ fontFamily: 'Segoe UI, sans-serif' }}
          >
            4
          </span>
        </div>
      </div>

      {/* 3. Guidance Notice matching ClassicMainForm.cs */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] p-2 text-center text-xs text-slate-800 font-medium shadow-2xs rounded-xs">
        ابدأ من قائمة وحدات الصقر ERP على اليمين أو من أزرار الوصول السريع أعلاه. جميع العمليات مرتبطة بقاعدة GtsDb2026 الحقيقية وبصلاحيات المستخدم الحالية.
      </div>

      {/* 4. Quick Buttons matching Quick() in ClassicMainForm */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#f8fafc] border border-[#cbd5e1] p-1.5 shadow-2xs rounded-xs">
        <button
          onClick={() => onOpenScreen(59)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs transition rounded-xs"
        >
          فاتورة مبيعات
        </button>
        <button
          onClick={() => onOpenScreen(15)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs transition rounded-xs"
        >
          فاتورة مشتريات
        </button>
        <button
          onClick={() => onOpenScreen(31)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs transition rounded-xs"
        >
          سند قبض
        </button>
        <button
          onClick={() => onOpenScreen(32)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs transition rounded-xs"
        >
          سند صرف
        </button>
        <button
          onClick={() => onOpenScreen(36)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs transition rounded-xs"
        >
          القيود اليومية
        </button>
        <button
          onClick={() => onOpenScreen(30)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs transition rounded-xs"
        >
          دليل الحسابات
        </button>
        <button
          onClick={() => onOpenScreen(8)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs transition rounded-xs"
        >
          الأصناف
        </button>
        <button
          onClick={() => onOpenScreen(999)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs transition rounded-xs"
        >
          ربط النظام بالكامل
        </button>
      </div>

      {/* 5. Live TabControl matching ClassicMainForm.cs Live() and Accounts() */}
      <div className="bg-white border border-[#cbd5e1] flex-1 flex flex-col shadow-2xs overflow-hidden rounded-xs">
        {/* Tab Headers */}
        <div className="flex border-b border-[#cbd5e1] bg-[#f8fafc]">
          <button
            onClick={() => setActiveTab('trans')}
            className={`px-4 py-1.5 text-xs font-bold border-l border-[#cbd5e1] cursor-pointer transition ${
              activeTab === 'trans'
                ? 'bg-[#005a9e] text-white'
                : 'text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e]'
            }`}
          >
            آخر القيود (dbo.Tran_Tran)
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-1.5 text-xs font-bold border-l border-[#cbd5e1] cursor-pointer transition ${
              activeTab === 'sales'
                ? 'bg-[#005a9e] text-white'
                : 'text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e]'
            }`}
          >
            آخر المبيعات (dbo.Order_Orders)
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-1.5 text-xs font-bold border-l border-[#cbd5e1] cursor-pointer transition ${
              activeTab === 'purchases'
                ? 'bg-[#005a9e] text-white'
                : 'text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e]'
            }`}
          >
            آخر المشتريات (dbo.Order_Purchases)
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-1.5 text-xs font-bold cursor-pointer transition ${
              activeTab === 'accounts'
                ? 'bg-[#005a9e] text-white'
                : 'text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e]'
            }`}
          >
            دليل الحسابات (dbo.Account_Accounts)
          </button>
        </div>

        {/* Tab Sub-toolbar with Refresh button & notification label */}
        <div className="bg-[#f8f8f8] border-b border-[#d0d0d0] px-3 py-1 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-[#f0f0f0] hover:bg-[#e5f1fb] border border-[#adadad] text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3 text-slate-600" />
              تحديث
            </button>
            <span className="text-slate-600 text-[11px]">
              بيانات فعلية من قاعدة البيانات GtsDb2026
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            عرض أحدث السجلات الفعلية
          </span>
        </div>

        {/* Tab Content Table Grid (DataGridView) */}
        <div className="flex-1 overflow-auto bg-white p-0">
          {activeTab === 'trans' && (
            <table className="w-full text-xs text-right border-collapse">
              <thead className="bg-[#f0f0f0] sticky top-0 border-b border-[#adadad] text-slate-700">
                <tr>
                  <th className="p-2 border-r border-[#d0d0d0] w-14">ID</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">رقم القيد (TranSn)</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">التاريخ</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-32">المرجع (ReferenceCode)</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-24">النوع</th>
                  <th className="p-2 border-r border-[#d0d0d0]">البيان (Note)</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {journalEntries.map((j) => (
                  <tr key={j.id} className="border-b border-[#e5e5e5] hover:bg-[#f5f9ff]">
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{j.id}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold text-[#0070c0]">
                      {j.entryNo}
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{j.date}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{j.refNo}</td>
                    <td className="p-2 border-r border-[#d0d0d0]">قيد يومية</td>
                    <td className="p-2 border-r border-[#d0d0d0]">{j.statement}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold">
                      {j.totalDebit.toLocaleString()} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sales' && (
            <table className="w-full text-xs text-right border-collapse">
              <thead className="bg-[#f0f0f0] sticky top-0 border-b border-[#adadad] text-slate-700">
                <tr>
                  <th className="p-2 border-r border-[#d0d0d0] w-14">ID</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">رقم الفاتورة (OrderNum)</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">التاريخ</th>
                  <th className="p-2 border-r border-[#d0d0d0]">العميل (SupplierName)</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-24">طريقة الدفع</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-24">الضريبة</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">الصافي (Net)</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">الإجمالي (TotalPrices)</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => onOpenScreen(59, { invoiceId: s.id })}
                    className="border-b border-[#e5e5e5] hover:bg-[#f5f9ff] cursor-pointer"
                  >
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{s.id}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold text-[#0070c0]">
                      {s.invoiceNo}
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{s.date}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-semibold">{s.customerName}</td>
                    <td className="p-2 border-r border-[#d0d0d0]">{s.paymentType}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">
                      {s.taxTotal.toLocaleString()} ر.س
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold">
                      {(s.subTotal - s.discountTotal).toLocaleString()} ر.س
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold text-[#0070c0]">
                      {s.grandTotal.toLocaleString()} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'purchases' && (
            <table className="w-full text-xs text-right border-collapse">
              <thead className="bg-[#f0f0f0] sticky top-0 border-b border-[#adadad] text-slate-700">
                <tr>
                  <th className="p-2 border-r border-[#d0d0d0] w-14">ID</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">رقم الفاتورة</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">التاريخ</th>
                  <th className="p-2 border-r border-[#d0d0d0]">المورد (SupplierName)</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-24">الفرع</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-24">الضريبة</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">الصافي (Net)</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">الإجمالي (TotalPrices)</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => onOpenScreen(15, { invoiceId: p.id })}
                    className="border-b border-[#e5e5e5] hover:bg-[#f5f9ff] cursor-pointer"
                  >
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{p.id}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold text-[#0070c0]">
                      {p.invoiceNo}
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{p.date}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-semibold">{p.supplierName}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{p.storeId}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">
                      {p.taxTotal.toLocaleString()} ر.س
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold">
                      {p.subTotal.toLocaleString()} ر.س
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold text-[#0070c0]">
                      {p.grandTotal.toLocaleString()} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'accounts' && (
            <table className="w-full text-xs text-right border-collapse">
              <thead className="bg-[#f0f0f0] sticky top-0 border-b border-[#adadad] text-slate-700">
                <tr>
                  <th className="p-2 border-r border-[#d0d0d0] w-14">ID</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-32">كود الحساب</th>
                  <th className="p-2 border-r border-[#d0d0d0]">اسم الحساب</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-28">النوع</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-20">المستوى</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-32">الرصيد مدين</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-32">الرصيد دائن</th>
                  <th className="p-2 border-r border-[#d0d0d0] w-32">الرصيد الصافي</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => onOpenScreen(43, { accountId: a.id })}
                    className="border-b border-[#e5e5e5] hover:bg-[#f5f9ff] cursor-pointer"
                  >
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{a.id}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold text-[#0070c0]">
                      {a.code}
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-medium">{a.name}</td>
                    <td className="p-2 border-r border-[#d0d0d0]">{a.type}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono">{a.level}</td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono text-emerald-700 font-semibold">
                      {a.nature === 'مدين' ? (a.balance || 0).toLocaleString() : '0'} ر.س
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono text-amber-700 font-semibold">
                      {a.nature === 'دائن' ? (a.balance || 0).toLocaleString() : '0'} ر.س
                    </td>
                    <td className="p-2 border-r border-[#d0d0d0] font-mono font-bold">
                      {(a.balance || 0).toLocaleString()} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
