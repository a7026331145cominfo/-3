import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  FileSpreadsheet,
  BookOpen,
  Scale,
  TrendingUp,
  Search,
  Plus,
  Printer,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Account, JournalEntry } from '../../types/erp';
import { erpDb } from '../../services/erpDatabase';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface AccountingCenterProps {
  initialTab?: 'accounts' | 'journal' | 'ledger' | 'trial' | 'profit';
  selectedAccountId?: number;
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const AccountingCenterScreen: React.FC<AccountingCenterProps> = ({
  initialTab = 'accounts',
  selectedAccountId,
  onOpenScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'journal' | 'ledger' | 'trial' | 'profit'>(
    selectedAccountId ? 'ledger' : initialTab
  );

  // Accounts state
  const accounts = erpDb.getAccounts();
  const [accountSearch, setAccountSearch] = useState('');
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccData, setNewAccData] = useState({
    code: '',
    name: '',
    type: 'فرعي' as 'رئيسي' | 'فرعي',
    nature: 'مدين' as 'مدين' | 'دائن',
    parentCode: '',
    balance: 0,
  });

  // Ledger state
  const [ledgerAccountId, setLedgerAccountId] = useState<number>(selectedAccountId || 3);
  useEffect(() => {
    if (selectedAccountId) {
      setLedgerAccountId(selectedAccountId);
      setActiveTab('ledger');
    }
  }, [selectedAccountId]);

  // Journal state
  const journalEntries = erpDb.getJournalEntries();
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [newJournalData, setNewJournalData] = useState({
    statement: '',
    lines: [
      { id: '1', accountId: 3, debit: 0, credit: 0, note: '' },
      { id: '2', accountId: 20, debit: 0, credit: 0, note: '' },
    ],
  });
  const [journalError, setJournalError] = useState('');

  // Filter accounts
  const filteredAccounts = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
      a.code.includes(accountSearch)
  );

  // Ledger data for selected account
  const ledgerData = erpDb.getAccountLedger(ledgerAccountId);

  // Trial Balance data
  const trialData = erpDb.getTrialBalance();

  // Profit and Loss calculations
  const revenueAccounts = accounts.filter((a) => a.code.startsWith('4'));
  const expenseAccounts = accounts.filter((a) => a.code.startsWith('5'));
  const totalRevenues = revenueAccounts.reduce((s, a) => s + erpDb.getAccountLedger(a.id).netBalance, 0);
  const totalExpenses = expenseAccounts.reduce((s, a) => s + erpDb.getAccountLedger(a.id).netBalance, 0);
  const netIncome = totalRevenues - totalExpenses;

  // Save new account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccData.code || !newAccData.name) return;
    erpDb.saveAccount(newAccData);
    setShowAddAccountModal(false);
    setNewAccData({ code: '', name: '', type: 'فرعي', nature: 'مدين', parentCode: '', balance: 0 });
  };

  // Add line to journal entry
  const addJournalLine = () => {
    setNewJournalData((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          id: String(prev.lines.length + 1),
          accountId: accounts[0]?.id || 1,
          debit: 0,
          credit: 0,
          note: '',
        },
      ],
    }));
  };

  // Update line
  const updateJournalLine = (index: number, field: string, val: any) => {
    const updated = [...newJournalData.lines];
    updated[index] = { ...updated[index], [field]: val };
    setNewJournalData({ ...newJournalData, lines: updated });
  };

  // Save manual journal
  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    const sumDebit = newJournalData.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
    const sumCredit = newJournalData.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

    if (Math.abs(sumDebit - sumCredit) > 0.01) {
      setJournalError(`القيد غير متوازن! إجمالي المدين (${sumDebit}) لا يساوي إجمالي الدائن (${sumCredit})`);
      return;
    }
    if (sumDebit === 0) {
      setJournalError('يجب أن تكون مبالغ القيد أكبر من صفر.');
      return;
    }

    const lines = newJournalData.lines.map((l) => {
      const acc = erpDb.getAccountById(l.accountId);
      return {
        id: l.id,
        accountId: l.accountId,
        accountCode: acc?.code || '',
        accountName: acc?.name || '',
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        note: l.note || newJournalData.statement,
      };
    });

    erpDb.createJournalEntry({
      sourceDoc: 'قيد يومية تسوية يدوية',
      refNo: `JV-MAN-${Date.now().toString().slice(-4)}`,
      statement: newJournalData.statement || 'قيد تسوية يدوي',
      lines,
      branchId: 1,
    });

    setShowAddJournalModal(false);
    setNewJournalData({
      statement: '',
      lines: [
        { id: '1', accountId: 3, debit: 0, credit: 0, note: '' },
        { id: '2', accountId: 20, debit: 0, credit: 0, note: '' },
      ],
    });
    setJournalError('');
  };

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="دليل الحسابات والعمليات المالية"
        screenId={activeTab === 'accounts' ? 30 : activeTab === 'journal' ? 36 : activeTab === 'ledger' ? 43 : activeTab === 'trial' ? 45 : 88}
        category="المحاسبة العامة"
        icon={<FolderTree className="w-4 h-4 text-white" />}
        description="شجرة الحسابات المالية، قيود اليومية العامة، دفاتر الأستاذ، موازين المراجعة، وقوائم الأرباح والخسائر"
        onOpenScreen={onOpenScreen}
      />

      {/* Real In-Screen Links Toolbar matching AccountingForms.cs AccountingCenterForm */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] p-1.5 flex flex-wrap items-center gap-1.5 text-xs shadow-2xs rounded-xs">
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
          onClick={() => onOpenScreen(31)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          سند قبض
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(32)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          سند صرف
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(8)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          الأصناف
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(60)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          تقارير المبيعات
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'accounts'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>دليل الحسابات</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>القيود اليومية ({journalEntries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>دفتر الأستاذ (كشف حساب)</span>
          </button>

          <button
            onClick={() => setActiveTab('trial')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trial'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>ميزان المراجعة</span>
          </button>

          <button
            onClick={() => setActiveTab('profit')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profit'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>الأرباح والخسائر</span>
          </button>
        </div>

        {activeTab === 'accounts' && (
          <button
            onClick={() => setShowAddAccountModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة حساب جديد</span>
          </button>
        )}

        {activeTab === 'journal' && (
          <button
            onClick={() => setShowAddJournalModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل قيد يدوي</span>
          </button>
        )}
      </div>

      {/* TAB 1: Chart of Accounts */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          {/* Search bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="relative w-72">
              <input
                type="text"
                placeholder="ابحث برقم أو اسم الحساب..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 pr-8 pl-3 py-1.5 rounded text-xs focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>
            <div className="text-xs text-slate-500">
              إجمالي الحسابات: <span className="font-bold text-slate-800">{accounts.length}</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم الحساب</th>
                  <th className="p-2.5">اسم الحساب</th>
                  <th className="p-2.5">النوع</th>
                  <th className="p-2.5">الطبيعة</th>
                  <th className="p-2.5">الحساب الأب</th>
                  <th className="p-2.5 text-left">الرصيد الدفتري</th>
                  <th className="p-2.5 text-center">العمليات والربط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-slate-900">{acc.code}</td>
                    <td className="p-2.5 font-semibold text-slate-800">
                      <span style={{ paddingRight: `${(acc.level - 1) * 16}px` }}>
                        {acc.level > 1 && '└─ '}
                        {acc.name}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          acc.type === 'رئيسي'
                            ? 'bg-purple-100 text-purple-700 font-bold'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {acc.type}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          acc.nature === 'مدين'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {acc.nature}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 font-mono">{acc.parentCode || '—'}</td>
                    <td className="p-2.5 text-left font-mono font-bold text-slate-900">
                      {acc.balance.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => {
                          setLedgerAccountId(acc.id);
                          setActiveTab('ledger');
                        }}
                        className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition cursor-pointer text-[11px] inline-flex items-center gap-1"
                        title="فتح كشف حساب تفصيلي"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>كشف حساب</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Journal Entries */}
      {activeTab === 'journal' && (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                سجل القيود المحاسبية التلقائية واليدوية (dbo.Tran_Tran)
              </span>
              <span className="text-xs text-slate-500">
                إجمالي القيود: {journalEntries.length}
              </span>
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              {journalEntries.map((j) => (
                <div key={j.id} className="p-4 hover:bg-slate-50/80 transition space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {j.entryNo}
                      </span>
                      <span className="font-bold text-slate-800">{j.statement}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">التاريخ: {j.date}</span>
                      <span className="text-slate-500 text-[11px]">المستخدم: {j.createdUser}</span>
                      {/* Linked Source document tag */}
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-300">
                        {j.sourceDoc}
                      </span>
                    </div>
                  </div>

                  {/* Lines Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-right">
                      <thead className="bg-slate-100/70 text-slate-600">
                        <tr>
                          <th className="p-1.5">رقم الحساب</th>
                          <th className="p-1.5">اسم الحساب</th>
                          <th className="p-1.5">شرح القيد</th>
                          <th className="p-1.5 text-left">مدين</th>
                          <th className="p-1.5 text-left">دائن</th>
                          <th className="p-1.5 text-center">الربط</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {j.lines.map((l, idx) => (
                          <tr key={idx}>
                            <td className="p-1.5 font-mono text-slate-700">{l.accountCode}</td>
                            <td className="p-1.5 font-semibold text-slate-900">{l.accountName}</td>
                            <td className="p-1.5 text-slate-500">{l.note}</td>
                            <td className="p-1.5 text-left font-mono font-bold text-blue-700">
                              {l.debit > 0 ? l.debit.toLocaleString() + ' ر.س' : '—'}
                            </td>
                            <td className="p-1.5 text-left font-mono font-bold text-emerald-700">
                              {l.credit > 0 ? l.credit.toLocaleString() + ' ر.س' : '—'}
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                onClick={() => {
                                  setLedgerAccountId(l.accountId);
                                  setActiveTab('ledger');
                                }}
                                className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                              >
                                كشف حساب
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
                        <tr>
                          <td colSpan={3} className="p-1.5 text-left">
                            المجموع:
                          </td>
                          <td className="p-1.5 text-left font-mono text-blue-800">
                            {j.totalDebit.toLocaleString()} ر.س
                          </td>
                          <td className="p-1.5 text-left font-mono text-emerald-800">
                            {j.totalCredit.toLocaleString()} ر.س
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: General Ledger / كشف الحساب */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4">
          {/* Account Selector Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">اختر الحساب:</label>
              <select
                value={ledgerAccountId}
                onChange={(e) => setLedgerAccountId(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} — {acc.name} ({acc.nature})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-xs font-bold transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة كشف الحساب</span>
              </button>
            </div>
          </div>

          {/* Account Summary Stats */}
          {ledgerData.account && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">اسم الحساب:</span>
                <span className="font-bold text-sm text-amber-400">{ledgerData.account.name}</span>
                <span className="text-[10px] text-slate-300 block font-mono">
                  كود: {ledgerData.account.code}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">إجمالي المدين:</span>
                <span className="font-bold text-sm font-mono text-blue-300">
                  {ledgerData.totalDebit.toLocaleString()} ر.س
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">إجمالي الدائن:</span>
                <span className="font-bold text-sm font-mono text-emerald-300">
                  {ledgerData.totalCredit.toLocaleString()} ر.س
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الرصيد الصافي الحالي:</span>
                <span className="font-black text-base font-mono text-amber-300">
                  {ledgerData.netBalance.toLocaleString()} ر.س
                </span>
                <span className="text-[10px] text-slate-400 block">
                  طبيعة الحساب: {ledgerData.account.nature}
                </span>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">المستند المرجعي</th>
                  <th className="p-2.5">البيان والشرح</th>
                  <th className="p-2.5 text-left">مدين (+)</th>
                  <th className="p-2.5 text-left">دائن (-)</th>
                  <th className="p-2.5 text-left">الرصيد التراكمي</th>
                  <th className="p-2.5 text-center">فتح المستند</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ledgerData.transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      لا توجد حركات مسجلة على هذا الحساب في الفترة الحالية.
                    </td>
                  </tr>
                ) : (
                  ledgerData.transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-mono text-slate-600">{tx.date}</td>
                      <td className="p-2.5 font-semibold text-slate-800">{tx.sourceDoc}</td>
                      <td className="p-2.5 text-slate-600">{tx.statement || tx.note}</td>
                      <td className="p-2.5 text-left font-mono font-bold text-blue-700">
                        {tx.debit > 0 ? tx.debit.toLocaleString() + ' ر.س' : '—'}
                      </td>
                      <td className="p-2.5 text-left font-mono font-bold text-emerald-700">
                        {tx.credit > 0 ? tx.credit.toLocaleString() + ' ر.س' : '—'}
                      </td>
                      <td className="p-2.5 text-left font-mono font-black text-slate-900 bg-slate-50">
                        {tx.runningBalance.toLocaleString()} ر.س
                      </td>
                      <td className="p-2.5 text-center">
                        {/* Interactive Link back to source document */}
                        {tx.refNo.startsWith('INV') && (
                          <button
                            onClick={() => onOpenScreen(59)}
                            className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] hover:bg-blue-100 cursor-pointer"
                          >
                            فاتورة المبيعات
                          </button>
                        )}
                        {tx.refNo.startsWith('REC') && (
                          <button
                            onClick={() => onOpenScreen(31)}
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] hover:bg-emerald-100 cursor-pointer"
                          >
                            سند القبض
                          </button>
                        )}
                        {tx.refNo.startsWith('PAY') && (
                          <button
                            onClick={() => onOpenScreen(32)}
                            className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] hover:bg-rose-100 cursor-pointer"
                          >
                            سند الصرف
                          </button>
                        )}
                        {tx.refNo.startsWith('PUR') && (
                          <button
                            onClick={() => onOpenScreen(15)}
                            className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] hover:bg-amber-100 cursor-pointer"
                          >
                            فاتورة المشتريات
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Trial Balance */}
      {activeTab === 'trial' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              ميزان المراجعة بالأرصدة لجميع الحسابات (AddTempTrialBalance_New)
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>الميزان متوازن ومطابق</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم الحساب</th>
                  <th className="p-2.5">اسم الحساب</th>
                  <th className="p-2.5">طبيعة الحساب</th>
                  <th className="p-2.5 text-left">أرصدة مدينة</th>
                  <th className="p-2.5 text-left">أرصدة دائنة</th>
                  <th className="p-2.5 text-center">الربط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialData.rows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-slate-800">{r.code}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{r.name}</td>
                    <td className="p-2.5">{r.nature}</td>
                    <td className="p-2.5 text-left font-mono font-bold text-blue-700">
                      {r.debitBalance > 0 ? r.debitBalance.toLocaleString() + ' ر.س' : '—'}
                    </td>
                    <td className="p-2.5 text-left font-mono font-bold text-emerald-700">
                      {r.creditBalance > 0 ? r.creditBalance.toLocaleString() + ' ر.س' : '—'}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => {
                          const acc = accounts.find((a) => a.code === r.code);
                          if (acc) {
                            setLedgerAccountId(acc.id);
                            setActiveTab('ledger');
                          }
                        }}
                        className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                      >
                        كشف حساب
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-amber-400 font-bold border-t-2 border-amber-500">
                <tr>
                  <td colSpan={3} className="p-3 text-left font-black text-sm">
                    إجمالي ميزان المراجعة:
                  </td>
                  <td className="p-3 text-left font-mono text-sm">
                    {trialData.sumDebit.toLocaleString()} ر.س
                  </td>
                  <td className="p-3 text-left font-mono text-sm">
                    {trialData.sumCredit.toLocaleString()} ر.س
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Profit & Loss */}
      {activeTab === 'profit' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <span>قائمة الدخل والأرباح والخسائر (Get_ProfitAndLossAccount)</span>
            </h2>
            <span className="text-xs text-slate-500">للفترة المالية الحالية (2026)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenues (4) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                الإيرادات التشغيلية والمبيعات (مجموعة 4)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {revenueAccounts.map((acc) => {
                  const bal = erpDb.getAccountLedger(acc.id).netBalance;
                  return (
                    <div key={acc.id} className="py-2 flex justify-between">
                      <span className="text-slate-700">{acc.name}</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {bal.toLocaleString()} ر.س
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-xs">
                <span>إجمالي الإيرادات:</span>
                <span className="font-mono text-emerald-800">{totalRevenues.toLocaleString()} ر.س</span>
              </div>
            </div>

            {/* Expenses (5) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                المصروفات والتكاليف والرواتب (مجموعة 5)
              </h3>
              <div className="divide-y divide-slate-100 text-xs">
                {expenseAccounts.map((acc) => {
                  const bal = erpDb.getAccountLedger(acc.id).netBalance;
                  return (
                    <div key={acc.id} className="py-2 flex justify-between">
                      <span className="text-slate-700">{acc.name}</span>
                      <span className="font-mono font-bold text-rose-700">
                        {bal.toLocaleString()} ر.س
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-xs">
                <span>إجمالي المصروفات:</span>
                <span className="font-mono text-rose-800">{totalExpenses.toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          {/* Net Result Card */}
          <div
            className={`p-5 rounded-lg border-2 flex items-center justify-between ${
              netIncome >= 0
                ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950'
                : 'bg-rose-50/80 border-rose-400 text-rose-950'
            }`}
          >
            <div>
              <span className="text-xs text-slate-600 block">صافي أرباح / خسائر الفترة الحالية:</span>
              <span className="text-2xl font-black font-mono">
                {netIncome.toLocaleString()} ر.س
              </span>
            </div>
            <div className="text-left text-xs font-semibold">
              {netIncome >= 0 ? (
                <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  صافي ربح نشاط إيجابي ✓
                </span>
              ) : (
                <span className="text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                  صافي خسارة نشاط
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Account */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-md w-full p-5 space-y-4 text-right">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              إضافة حساب جديد إلى دليل شجرة الحسابات
            </h3>
            <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">رقم الحساب (الكود):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 1106 أو 2104"
                  value={newAccData.code}
                  onChange={(e) => setNewAccData({ ...newAccData, code: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">اسم الحساب العربي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عهدة المشتريات النقدية"
                  value={newAccData.name}
                  onChange={(e) => setNewAccData({ ...newAccData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">طبيعة الحساب:</label>
                  <select
                    value={newAccData.nature}
                    onChange={(e) => setNewAccData({ ...newAccData, nature: e.target.value as any })}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="مدين">مدين (أصول / مصروفات)</option>
                    <option value="دائن">دائن (خصوم / حقوق / إيرادات)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">نوع الحساب:</label>
                  <select
                    value={newAccData.type}
                    onChange={(e) => setNewAccData({ ...newAccData, type: e.target.value as any })}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="فرعي">فرعي (يقبل حركات وقيد)</option>
                    <option value="رئيسي">رئيسي (تجميعي)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الحساب الأب (اختياري):</label>
                <input
                  type="text"
                  placeholder="كود الحساب الأب (مثال: 11)"
                  value={newAccData.parentCode}
                  onChange={(e) => setNewAccData({ ...newAccData, parentCode: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddAccountModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Manual Journal Entry */}
      {showAddJournalModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-3xl w-full p-5 space-y-4 text-right">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              تسجيل قيد يومية محاسبي يدوي (Double-Entry Manual Voucher)
            </h3>

            {journalError && (
              <div className="p-3 rounded bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{journalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveJournal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">شرح وبيان القيد:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: إثبات تسوية نهاية الشهر أو إقفال حسابات وسيطة"
                  value={newJournalData.statement}
                  onChange={(e) => setNewJournalData({ ...newJournalData, statement: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Rows */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-2">الحساب</th>
                      <th className="p-2 w-28 text-left">مدين (ر.س)</th>
                      <th className="p-2 w-28 text-left">دائن (ر.س)</th>
                      <th className="p-2">البيان الخاص</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {newJournalData.lines.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <select
                            value={row.accountId}
                            onChange={(e) =>
                              updateJournalLine(idx, 'accountId', parseInt(e.target.value, 10))
                            }
                            className="w-full border border-slate-300 rounded p-1.5 bg-white text-xs"
                          >
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.code} — {a.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.debit || ''}
                            onChange={(e) =>
                              updateJournalLine(idx, 'debit', parseFloat(e.target.value) || 0)
                            }
                            className="w-full border border-slate-300 rounded p-1.5 text-left font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.credit || ''}
                            onChange={(e) =>
                              updateJournalLine(idx, 'credit', parseFloat(e.target.value) || 0)
                            }
                            className="w-full border border-slate-300 rounded p-1.5 text-left font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="ملاحظة السطر"
                            value={row.note}
                            onChange={(e) => updateJournalLine(idx, 'note', e.target.value)}
                            className="w-full border border-slate-300 rounded p-1.5"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={addJournalLine}
                  className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  + إضافة سطر محاسبي جديد
                </button>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span>
                    إجمالي المدين:{' '}
                    <span className="font-mono text-blue-700">
                      {newJournalData.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0)} ر.س
                    </span>
                  </span>
                  <span>
                    إجمالي الدائن:{' '}
                    <span className="font-mono text-emerald-700">
                      {newJournalData.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0)} ر.س
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddJournalModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer"
                >
                  ترحيل وحفظ القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
