import React, { useState } from 'react';
import { GTS_TABLES } from '../../data/gts2026Metadata';
import { erpDb } from '../../services/erpDatabase';

interface SchemaFormViewProps {
  onClose: () => void;
}

export const SchemaFormView: React.FC<SchemaFormViewProps> = ({ onClose }) => {
  const [selectedTable, setSelectedTable] = useState<string>(GTS_TABLES[0]?.table || 'Account_Accounts');

  // Generate realistic columns definition for selected table
  const getColumnsForTable = (table: string) => {
    if (table.includes('Account')) {
      return [
        { name: 'ID', sqlType: 'int', nullable: 'NO', primaryKey: 'YES', identity: 'YES', computed: 'NO' },
        { name: 'Code', sqlType: 'nvarchar(50)', nullable: 'NO', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'Name', sqlType: 'nvarchar(200)', nullable: 'NO', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'AccountTypeID', sqlType: 'int', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'Nature', sqlType: 'nvarchar(10)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'Balance', sqlType: 'decimal(18,2)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'ParentID', sqlType: 'int', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'Created_Date', sqlType: 'datetime', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'Created_User', sqlType: 'nvarchar(50)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
      ];
    }
    if (table.includes('Item')) {
      return [
        { name: 'ID', sqlType: 'int', nullable: 'NO', primaryKey: 'YES', identity: 'YES', computed: 'NO' },
        { name: 'ItemCode', sqlType: 'nvarchar(50)', nullable: 'NO', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'ItemName', sqlType: 'nvarchar(200)', nullable: 'NO', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'Barcode', sqlType: 'nvarchar(50)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'UnitID', sqlType: 'int', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'GroupID', sqlType: 'int', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'PurchPrice', sqlType: 'decimal(18,2)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'SalePrice', sqlType: 'decimal(18,2)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'CurrentStock', sqlType: 'decimal(18,2)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'MinLimit', sqlType: 'decimal(18,2)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
      ];
    }
    if (table.includes('Order')) {
      return [
        { name: 'ID', sqlType: 'int', nullable: 'NO', primaryKey: 'YES', identity: 'YES', computed: 'NO' },
        { name: 'OrderNo', sqlType: 'nvarchar(50)', nullable: 'NO', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'OrderDate', sqlType: 'datetime', nullable: 'NO', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'CustomerID', sqlType: 'int', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'StoreID', sqlType: 'int', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'TotalAmount', sqlType: 'decimal(18,2)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'TaxAmount', sqlType: 'decimal(18,2)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
        { name: 'GrandTotal', sqlType: 'decimal(18,2)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
      ];
    }
    return [
      { name: 'ID', sqlType: 'int', nullable: 'NO', primaryKey: 'YES', identity: 'YES', computed: 'NO' },
      { name: 'Code', sqlType: 'nvarchar(50)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
      { name: 'Name', sqlType: 'nvarchar(200)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
      { name: 'Created_Date', sqlType: 'datetime', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
      { name: 'Created_User', sqlType: 'nvarchar(50)', nullable: 'YES', primaryKey: 'NO', identity: 'NO', computed: 'NO' },
    ];
  };

  const columns = getColumnsForTable(selectedTable);

  return (
    <div className="bg-white border border-[#cbd5e1] rounded-sm shadow-md p-0 overflow-hidden text-right">
      <div className="bg-gradient-to-l from-[#005a9e] to-[#0078d7] text-white px-3.5 py-2 flex justify-between items-center text-xs font-semibold border-b border-[#004b85]">
        <div className="flex items-center gap-2">
          <span>🗄️</span>
          <span>الصقر ERP — بنية قاعدة البيانات (SchemaForm)</span>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-red-600 px-2 py-0.5 text-white font-bold rounded-2xs cursor-pointer transition text-xs"
        >
          ✕
        </button>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[520px]">
          {/* Right: Table ListBox */}
          <div className="bg-white border border-[#cbd5e1] rounded-xs overflow-y-auto text-xs shadow-2xs">
            <div className="bg-[#f8fafc] p-2 font-bold text-[#005a9e] text-xs border-b border-[#cbd5e1]">
              جداول قاعدة البيانات ({GTS_TABLES.length})
            </div>
            <div className="divide-y divide-slate-100">
              {GTS_TABLES.map((t) => (
                <div
                  key={t.table}
                  onClick={() => setSelectedTable(t.table)}
                  className={`p-2 cursor-pointer font-mono transition text-xs ${
                    selectedTable === t.table
                      ? 'bg-[#005a9e] text-white font-bold'
                      : 'text-slate-800 hover:bg-[#e5f1fb]'
                  }`}
                >
                  dbo.{t.table} ({t.columnsCount} أعمدة)
                </div>
              ))}
            </div>
          </div>

          {/* Left: Columns DataGridView */}
          <div className="md:col-span-2 bg-white border border-[#cbd5e1] rounded-xs overflow-y-auto text-xs shadow-2xs">
            <div className="bg-[#f8fafc] p-2 font-bold text-slate-800 border-b border-[#cbd5e1] flex justify-between">
              <span className="text-[#005a9e]">أعمدة الجدول: dbo.{selectedTable}</span>
              <span className="font-mono text-slate-600">{columns.length} حقول</span>
            </div>

            <table className="w-full text-xs text-right">
              <thead className="bg-[#f1f5f9] text-slate-800 border-b border-[#cbd5e1] font-bold">
                <tr>
                  <th className="p-2 border-l border-slate-200">Name</th>
                  <th className="p-2 border-l border-slate-200">SQL Type</th>
                  <th className="p-2 border-l border-slate-200 text-center">Nullable</th>
                  <th className="p-2 border-l border-slate-200 text-center">Primary Key</th>
                  <th className="p-2 border-l border-slate-200 text-center">Identity</th>
                  <th className="p-2 text-center">Computed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {columns.map((c, idx) => (
                  <tr key={idx} className="hover:bg-[#e5f1fb]/50">
                    <td className="p-2 font-bold text-slate-900 border-l border-slate-200">{c.name}</td>
                  <td className="p-2 text-blue-700 border-l border-slate-200">{c.sqlType}</td>
                  <td className="p-2 text-center border-l border-slate-200">{c.nullable}</td>
                  <td className="p-2 text-center border-l border-slate-200 font-bold text-emerald-700">
                    {c.primaryKey}
                  </td>
                  <td className="p-2 text-center border-l border-slate-200">{c.identity}</td>
                  <td className="p-2 text-center">{c.computed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
};
