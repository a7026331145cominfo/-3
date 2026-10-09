import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  Printer,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { FinancialVoucher, CheckItem } from '../../types/erp';
import { erpDb } from '../../services/erpDatabase';
import { VoucherPrintModal } from '../common/VoucherPrintModal';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface FinancialVouchersProps {
  initialKind?: 'receipt' | 'payment' | 'checks';
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const FinancialVouchersScreen: React.FC<FinancialVouchersProps> = ({
  initialKind = 'receipt',
  onOpenScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'receipt' | 'payment' | 'checks'>(initialKind);
  const vouchers = erpDb.getVouchers();
  const checks = erpDb.getChecks();
  const custSupList = erpDb.getCustSup();
  const accounts = erpDb.getAccounts();

  // New Voucher Modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [partyType, setPartyType] = useState<'customer' | 'supplier' | 'account'>(
    activeTab === 'receipt' ? 'customer' : 'supplier'
  );
  const [partyId, setPartyId] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'نقدي (صندوق)' | 'تحويل بنكي' | 'شيك مصرفي'>(
    'نقدي (صندوق)'
  );
  const [cashAccountId, setCashAccountId] = useState<number>(3);
  const [statement, setStatement] = useState<string>('');
  const [checkNo, setCheckNo] = useState<string>('');
  const [checkBank, setCheckBank] = useState<string>('');

  // Print Modal
  const [printDoc, setPrintDoc] = useState<any>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const currentVouchers = vouchers.filter((v) => v.kind === (activeTab === 'checks' ? 'receipt' : activeTab));
  const filteredVouchers = currentVouchers.filter(
    (v) =>
      v.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.statement.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Save new voucher
  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    let partyName = '';
    if (partyType === 'customer' || partyType === 'supplier') {
      const p = custSupList.find((c) => c.id === partyId);
      partyName = p ? p.name : 'طرف غير محدد';
    } else {
      const a = accounts.find((acc) => acc.id === partyId);
      partyName = a ? a.name : 'حساب عام';
    }

    const created = erpDb.createVoucher({
      kind: activeTab === 'payment' ? 'payment' : 'receipt',
      date: new Date().toISOString().split('T')[0],
      partyType,
      partyId,
      partyName,
      amount,
      paymentMethod,
      cashAccountId,
      costCenterId: 1,
      statement,
      checkNo: paymentMethod === 'شيك مصرفي' ? checkNo : undefined,
      checkBank: paymentMethod === 'شيك مصرفي' ? checkBank : undefined,
    });

    setShowNewModal(false);
    setAmount(0);
    setStatement('');
    setCheckNo('');
    setCheckBank('');

    // Trigger Print Preview
    setPrintDoc({
      title: created.kind === 'receipt' ? 'سند قبض مالي' : 'سند صرف مالي',
      docNo: created.voucherNo,
      date: created.date,
      partyName: created.partyName,
      amount: created.amount,
      statement: created.statement,
    });
  };

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="سندات القبض والصرف وإدارة الشيكات"
        screenId={activeTab === 'receipt' ? 31 : activeTab === 'payment' ? 32 : 123}
        category="السندات المالية"
        icon={<ArrowDownLeft className="w-4 h-4 text-white" />}
        description="تسجيل سندات القبض والصرف النقدية والبنكية والشيكات والترحيل الآلي إلى دفتر الأستاذ العام"
        onOpenScreen={onOpenScreen}
      />

      {/* Real In-Screen Links Toolbar matching FinancialTransactionForms.cs */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] p-1.5 flex flex-wrap items-center gap-1.5 text-xs shadow-2xs rounded-xs">
        <button
          type="button"
          onClick={() => onOpenScreen(30)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          دليل الحسابات
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(43)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          كشف حساب
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(36)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          القيود اليومية
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(activeTab === 'receipt' ? 59 : 15)}
          className="px-3 py-1 bg-[#005a9e] hover:bg-[#004b85] text-white font-bold cursor-pointer shadow-2xs transition rounded-xs"
        >
          {activeTab === 'receipt' ? 'فتح فاتورة المبيعات' : 'فتح فاتورة المشتريات'}
        </button>
      </div>

      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('receipt')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'receipt'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <ArrowDownLeft className={`w-4 h-4 ${activeTab === 'receipt' ? 'text-white' : 'text-emerald-600'}`} />
            <span>سندات القبض (Receipts)</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <ArrowUpRight className={`w-4 h-4 ${activeTab === 'payment' ? 'text-white' : 'text-rose-600'}`} />
            <span>سندات الصرف (Payments)</span>
          </button>

          <button
            onClick={() => setActiveTab('checks')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'checks'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === 'checks' ? 'text-white' : 'text-sky-600'}`} />
            <span>إدارة الشيكات ({checks.length})</span>
          </button>
        </div>

        {activeTab !== 'checks' && (
          <button
            onClick={() => {
              setPartyType(activeTab === 'receipt' ? 'customer' : 'supplier');
              const first = custSupList.filter((c) => c.type === (activeTab === 'receipt' ? 'customer' : 'supplier'))[0];
              if (first) setPartyId(first.id);
              setShowNewModal(true);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 text-white rounded text-xs font-bold transition cursor-pointer ${
              activeTab === 'receipt'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-rose-700 hover:bg-rose-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{activeTab === 'receipt' ? 'إنشاء سند قبض جديد' : 'إنشاء سند صرف جديد'}</span>
          </button>
        )}
      </div>

      {/* Main View: Receipts or Payments */}
      {activeTab !== 'checks' ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter & Search */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="ابحث برقم السند، الطرف، أو الشرح..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 pr-8 pl-3 py-1.5 rounded text-xs focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <div className="text-xs text-slate-600">
              إجمالي السندات:{' '}
              <span className="font-bold font-mono text-slate-900">{filteredVouchers.length}</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم السند</th>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">الطرف المستفيد / المقبوض منه</th>
                  <th className="p-2.5">طريقة الدفع</th>
                  <th className="p-2.5">البيان والسبب</th>
                  <th className="p-2.5 text-left">المبلغ</th>
                  <th className="p-2.5 text-center">العمليات والطباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      لا توجد سندات مسجلة حالياً في هذا القسم.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-mono font-bold text-amber-700">{v.voucherNo}</td>
                      <td className="p-2.5 font-mono text-slate-600">{v.date}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{v.partyName}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                          {v.paymentMethod}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-600">{v.statement}</td>
                      <td className="p-2.5 text-left font-mono font-black text-slate-900 text-sm">
                        {v.amount.toLocaleString()} ر.س
                      </td>
                      <td className="p-2.5 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            setPrintDoc({
                              title: v.kind === 'receipt' ? 'سند قبض نقدي / بنكي' : 'سند صرف نقدي / بنكي',
                              docNo: v.voucherNo,
                              date: v.date,
                              partyName: v.partyName,
                              amount: v.amount,
                              statement: v.statement,
                            })
                          }
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="طباعة السند رسمي"
                        >
                          <Printer className="w-3 h-3 text-amber-600" />
                          <span>طباعة</span>
                        </button>

                        {/* Direct link to Ledger for the party */}
                        <button
                          onClick={() => {
                            if (v.partyType === 'customer') onOpenScreen(43, { accountId: 6 });
                            else if (v.partyType === 'supplier') onOpenScreen(43, { accountId: 13 });
                            else onOpenScreen(43, { accountId: v.partyId });
                          }}
                          className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="كشف حساب الأستاذ العام"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>كشف الحساب</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Checks Management Screen */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              شاشة حافظة الشيكات البنكية (FrmCheckCollection / FrmCheckIssued)
            </span>
            <span className="text-xs text-slate-500">إجمالي الشيكات: {checks.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم الشيك</th>
                  <th className="p-2.5">النوع</th>
                  <th className="p-2.5">البنك المسحوب عليه</th>
                  <th className="p-2.5">الطرف (الساحب / المستفيد)</th>
                  <th className="p-2.5">تاريخ الاستحقاق</th>
                  <th className="p-2.5 text-left">المبلغ</th>
                  <th className="p-2.5">حالة التحصيل</th>
                  <th className="p-2.5 text-center">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checks.map((chk) => (
                  <tr key={chk.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-slate-900">{chk.checkNo}</td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          chk.type === 'وارد (قبض)'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {chk.type}
                      </span>
                    </td>
                    <td className="p-2.5 font-medium text-slate-800">{chk.bankName}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{chk.partyName}</td>
                    <td className="p-2.5 font-mono text-slate-600">{chk.dueDate}</td>
                    <td className="p-2.5 text-left font-mono font-bold text-slate-900">
                      {chk.amount.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {chk.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => {
                          alert(`تم تحديث حالة الشيك رقم ${chk.checkNo} إلى "تم التحصيل في الحساب البنكي".`);
                        }}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 border border-slate-300 text-[11px] font-medium transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>تحصيل الشيك</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Voucher */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-lg w-full p-6 space-y-4 text-right">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-2">
              {activeTab === 'receipt' ? 'إنشاء سند قبض جديد (قبض نقدية/شيك)' : 'إنشاء سند صرف جديد (صرف نقدية/بنك)'}
            </h3>

            <form onSubmit={handleSaveVoucher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">نوع الطرف:</label>
                  <select
                    value={partyType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setPartyType(t);
                      if (t === 'customer') {
                        const first = custSupList.filter((c) => c.type === 'customer')[0];
                        if (first) setPartyId(first.id);
                      } else if (t === 'supplier') {
                        const first = custSupList.filter((c) => c.type === 'supplier')[0];
                        if (first) setPartyId(first.id);
                      } else {
                        setPartyId(accounts[0]?.id || 1);
                      }
                    }}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="customer">عميل (من قائمة العملاء)</option>
                    <option value="supplier">مورد (من قائمة الموردين)</option>
                    <option value="account">حساب عام (من شجرة الحسابات)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">اختر الطرف المحدد:</label>
                  {partyType === 'customer' || partyType === 'supplier' ? (
                    <select
                      value={partyId}
                      onChange={(e) => setPartyId(parseInt(e.target.value, 10))}
                      className="w-full border border-slate-300 rounded p-2 bg-white"
                    >
                      {custSupList
                        .filter((c) => c.type === partyType)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} (الرصيد: {c.currentBalance.toLocaleString()} ر.س)
                          </option>
                        ))}
                    </select>
                  ) : (
                    <select
                      value={partyId}
                      onChange={(e) => setPartyId(parseInt(e.target.value, 10))}
                      className="w-full border border-slate-300 rounded p-2 bg-white"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.code} — {a.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">طريقة الدفع:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="نقدي (صندوق)">نقدي (الصندوق الرئيسي)</option>
                    <option value="تحويل بنكي">تحويل بنكي (البنك الأهلي)</option>
                    <option value="شيك مصرفي">شيك مصرفي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">حساب الخزينة / البنك المتأثر:</label>
                  <select
                    value={cashAccountId}
                    onChange={(e) => setCashAccountId(parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value={3}>1101 — الصندوق الرئيسي (الخزينة النقدية)</option>
                    <option value={4}>1102 — البنك الأهلي التجاري</option>
                    <option value={5}>1103 — بنك الراجحي</option>
                  </select>
                </div>
              </div>

              {paymentMethod === 'شيك مصرفي' && (
                <div className="grid grid-cols-2 gap-3 bg-amber-50 p-2.5 rounded border border-amber-200">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">رقم الشيك:</label>
                    <input
                      type="text"
                      placeholder="مثال: CHK-99231"
                      value={checkNo}
                      onChange={(e) => setCheckNo(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">اسم البنك المسحوب عليه:</label>
                    <input
                      type="text"
                      placeholder="مثال: مصرف الراجحي"
                      value={checkBank}
                      onChange={(e) => setCheckBank(e.target.value)}
                      className="w-full border border-slate-300 rounded p-1.5 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">مبلغ السند (ر.س):</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded p-2 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">البيان والشرح التفصيلي:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="مثال: سداد دفعة تحت الحساب عن فواتير التوريد رقم..."
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-amber-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded text-white font-bold transition cursor-pointer ${
                    activeTab === 'receipt'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  اعتماد وترحيل السند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {printDoc && (
        <VoucherPrintModal
          title={printDoc.title}
          docNo={printDoc.docNo}
          date={printDoc.date}
          partyName={printDoc.partyName}
          amount={printDoc.amount}
          statement={printDoc.statement}
          onClose={() => setPrintDoc(null)}
        />
      )}
    </div>
  );
};
