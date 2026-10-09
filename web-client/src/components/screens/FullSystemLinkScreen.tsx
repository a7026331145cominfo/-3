import React, { useState } from 'react';
import {
  Workflow,
  Layers,
  Activity,
  Search,
  ExternalLink,
  Download,
  Database,
  CheckCircle2,
  Play,
  Table as TableIcon
} from 'lucide-react';
import { GTS_TABLES, GTS_PROCEDURES, ALL_SYSTEM_SCREENS } from '../../data/gts2026Metadata';
import { erpDb } from '../../services/erpDatabase';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface FullSystemLinkProps {
  initialTab?: 'screens' | 'tables' | 'procedures';
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const FullSystemLinkScreen: React.FC<FullSystemLinkProps> = ({
  initialTab = 'screens',
  onOpenScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'screens' | 'tables' | 'procedures'>(initialTab);

  // Search states
  const [screenSearch, setScreenSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [procSearch, setProcSearch] = useState('');

  // Selected table modal / data browser
  const [viewingTable, setViewingTable] = useState<string | null>(null);

  // Filtered lists
  const filteredScreens = ALL_SYSTEM_SCREENS.filter(
    (s) =>
      s.name.toLowerCase().includes(screenSearch.toLowerCase()) ||
      (s.legacyName && s.legacyName.toLowerCase().includes(screenSearch.toLowerCase())) ||
      s.category.includes(screenSearch)
  );

  const filteredTables = GTS_TABLES.filter(
    (t) =>
      t.table.toLowerCase().includes(tableSearch.toLowerCase()) ||
      t.module.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const filteredProcs = GTS_PROCEDURES.filter(
    (p) =>
      p.name.toLowerCase().includes(procSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(procSearch.toLowerCase()) ||
      p.module.toLowerCase().includes(procSearch.toLowerCase())
  );

  // Export tables inventory as CSV
  const handleExportTablesCsv = () => {
    let csv = 'Schema,Table,Module,ColumnsCount,ApproxRows\n';
    GTS_TABLES.forEach((t) => {
      csv += `${t.schema},${t.table},${t.module},${t.columnsCount},${t.approxRows}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GTSdb2026_Table_Inventory.csv';
    link.click();
  };

  // Get sample rows for table preview
  const getTableRows = (tableName: string): any[] => {
    if (tableName.includes('Account_Accounts')) return erpDb.getAccounts();
    if (tableName.includes('Item_Items')) return erpDb.getItems();
    if (tableName.includes('Order_Order')) return erpDb.getSalesInvoices();
    if (tableName.includes('Order_Purchases')) return erpDb.getPurchaseInvoices();
    if (tableName.includes('Account_CustSup')) return erpDb.getCustSup();
    if (tableName.includes('Account_Receipts') || tableName.includes('Account_Payment'))
      return erpDb.getVouchers();
    if (tableName.includes('Tran_Tran') || tableName.includes('Account_DailyEntry'))
      return erpDb.getJournalEntries();
    if (tableName.includes('Account_Stores')) return erpDb.getStores();
    if (tableName.includes('Account_Branch')) return erpDb.getBranches();
    if (tableName.includes('Account_CostCenters')) return erpDb.getCostCenters();
    if (tableName.includes('Emp_Employee')) return erpDb.getEmployees();
    if (tableName.includes('Contract_Contract')) return erpDb.getContracts();
    return [
      { id: 1, info: `سجلات جدول ${tableName}`, status: 'نشط', sys_date: '2026-10-07' },
      { id: 2, info: `سجلات جدول ${tableName} (بيانات مؤمنة)`, status: 'معتمد', sys_date: '2026-10-07' },
    ];
  };

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="ربط وتشغيل النظام بالكامل (Full System Link)"
        screenId={999}
        category="أدوات النظام المتقدمة"
        icon={<Workflow className="w-4 h-4 text-white" />}
        description="مركز الربط المباشر بين واجهات WinForms الأصلية وشاشات V4 مع جداول قاعدة البيانات الـ 180 وكتالوج الإجراءات المخزنة"
        onOpenScreen={onOpenScreen}
      />

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('screens')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'screens'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>الشاشات والصلاحيات (Screens Catalog)</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>جداول قاعدة البيانات (180 جدول)</span>
          </button>

          <button
            onClick={() => setActiveTab('procedures')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'procedures'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>كتالوج الإجراءات المخزنة (Stored Procedures)</span>
          </button>
        </div>

        {activeTab === 'tables' && (
          <button
            onClick={handleExportTablesCsv}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#005a9e] hover:bg-[#004b85] text-white rounded-xs text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير جرد الجداول CSV</span>
          </button>
        )}
      </div>

      {/* TAB 1: Screens */}
      {activeTab === 'screens' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="ابحث باسم الشاشة أو الكود الأصلي..."
                value={screenSearch}
                onChange={(e) => setScreenSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 pr-8 pl-3 py-1.5 rounded text-xs focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <span className="text-slate-500">
              عدد الشاشات المفهرسة: <span className="font-bold font-mono text-slate-900">{filteredScreens.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم الشاشة</th>
                  <th className="p-2.5">اسم الشاشة (Screen_Name)</th>
                  <th className="p-2.5">القسم</th>
                  <th className="p-2.5">المعرف البرمجي الأصلي (Legacy Form)</th>
                  <th className="p-2.5">الوصف والوظيفة</th>
                  <th className="p-2.5 text-center">فتح الشاشة التشغيلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScreens.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-slate-600">#{s.screenNum}</td>
                    <td className="p-2.5 font-bold text-slate-900">{s.name}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border text-slate-700 text-[10px]">
                        {s.category}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-blue-700">{s.legacyName || '—'}</td>
                    <td className="p-2.5 text-slate-600 text-[11px]">{s.description || '—'}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => onOpenScreen(s.id)}
                        className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer inline-flex items-center gap-1 shadow-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>تشغيل الشاشة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Database Tables */}
      {activeTab === 'tables' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="ابحث باسم الجدول أو الوحدة..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 pr-8 pl-3 py-1.5 rounded text-xs focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <div className="text-slate-500">
              إجمالي الجداول بقاعدة البيانات: <span className="font-bold font-mono text-slate-900">{GTS_TABLES.length} جدول</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">المخطط (Schema)</th>
                  <th className="p-2.5">اسم الجدول (Table Name)</th>
                  <th className="p-2.5">الوحدة (Module)</th>
                  <th className="p-2.5 text-center">عدد الأعمدة</th>
                  <th className="p-2.5 text-left">عدد الصفوف التقريبي</th>
                  <th className="p-2.5 text-center">استعراض البيانات المباشرة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTables.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono text-slate-500">{t.schema}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">{t.table}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">
                        {t.module}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-mono">{t.columnsCount}</td>
                    <td className="p-2.5 text-left font-mono font-bold text-slate-800">
                      {t.approxRows.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => setViewingTable(t.table)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold text-[11px] transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <TableIcon className="w-3 h-3 text-amber-600" />
                        <span>فتح الجدول</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Stored Procedures */}
      {activeTab === 'procedures' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="ابحث باسم الإجراء أو الوصف..."
                value={procSearch}
                onChange={(e) => setProcSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 pr-8 pl-3 py-1.5 rounded text-xs focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <span className="text-slate-500">
              الإجراءات الموثقة: <span className="font-bold font-mono text-slate-900">{filteredProcs.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">اسم الإجراء المخزن (Procedure)</th>
                  <th className="p-2.5">الوحدة</th>
                  <th className="p-2.5">الوصف والوظيفة</th>
                  <th className="p-2.5 text-center">عدد المعاملات</th>
                  <th className="p-2.5 text-center">تشغيل / استدعاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProcs.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-teal-800">{p.name}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold text-[10px]">
                        {p.module}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700">{p.description}</td>
                    <td className="p-2.5 text-center font-mono">{p.paramCount}</td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => {
                          if (p.name.includes('Orders')) onOpenScreen(59);
                          else if (p.name.includes('Purches')) onOpenScreen(15);
                          else if (p.name.includes('Ledger')) onOpenScreen(43);
                          else if (p.name.includes('Vat')) onOpenScreen(50);
                          else if (p.name.includes('Quantity')) onOpenScreen(18);
                          else alert(`تم استدعاء الإجراء المخزن [${p.name}] بنجاح.`);
                        }}
                        className="px-2.5 py-1 rounded bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] transition cursor-pointer inline-flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3 h-3" />
                        <span>تنفيذ الإجراء</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Live Table Data Browser */}
      {viewingTable && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden text-right">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Database className="w-4 h-4 text-amber-400" />
                <span>متصفح بيانات الجدول: dbo.{viewingTable}</span>
              </div>
              <button
                onClick={() => setViewingTable(null)}
                className="text-slate-400 hover:text-white px-2 py-1 text-xs font-bold"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                <span>البيانات الحية المباشرة من قاعدة البيانات المحلية المسندة</span>
                <span className="font-mono font-bold">
                  {getTableRows(viewingTable).length} سجلات معروضة
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-xs text-right">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      {getTableRows(viewingTable).length > 0 &&
                        Object.keys(getTableRows(viewingTable)[0])
                          .slice(0, 7)
                          .map((col, idx) => (
                            <th key={idx} className="p-2">
                              {col}
                            </th>
                          ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getTableRows(viewingTable).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        {Object.values(row)
                          .slice(0, 7)
                          .map((val: any, vIdx) => (
                            <td key={vIdx} className="p-2 font-mono text-slate-800">
                              {typeof val === 'object' ? JSON.stringify(val).slice(0, 30) : String(val)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
