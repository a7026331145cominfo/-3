import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Printer,
  Trash2,
  Search,
  BookOpen,
  Building2,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { PurchaseInvoice, InvoiceItemRow, CustomerSupplier, Item } from '../../types/erp';
import { erpDb } from '../../services/erpDatabase';
import { VoucherPrintModal } from '../common/VoucherPrintModal';
import { BusinessRecordPickerModal } from '../common/BusinessRecordPickerModal';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface PurchaseEntryProps {
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const PurchaseEntryScreen: React.FC<PurchaseEntryProps> = ({ onOpenScreen }) => {
  const [activeTab, setActiveTab] = useState<'new' | 'list' | 'suppliers'>('new');
  const invoices = erpDb.getPurchaseInvoices();
  const suppliers = erpDb.getCustSup().filter((c) => c.type === 'supplier');
  const items = erpDb.getItems();
  const stores = erpDb.getStores();

  // Record Picker Modals (matching InternalScreenLinks in C#)
  const [showSuppPicker, setShowSuppPicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);

  // New Invoice Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState<number>(suppliers[0]?.id || 201);
  const [billRefNo, setBillRefNo] = useState<string>('SUP-INV-8891');
  const [paymentType, setPaymentType] = useState<'نقدي' | 'آجل' | 'تحويل بنكي'>('آجل');
  const [selectedStoreId, setSelectedStoreId] = useState<number>(stores[0]?.id || 1);
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  // Rows
  const [rows, setRows] = useState<InvoiceItemRow[]>([
    {
      id: '1',
      itemId: items[0]?.id || 1,
      barcode: items[0]?.barcode || '628100100001',
      name: items[0]?.name || 'كيبل نحاسي 4 ملم معزول 100 متر',
      unit: items[0]?.unit || 'كرتون (12 حبة)',
      qty: 15,
      price: items[0]?.purchasePrice || 180,
      discountPercent: 0,
      taxPercent: 15,
      total: (items[0]?.purchasePrice || 180) * 15 * 1.15,
    },
  ]);

  // Modals
  const [printDoc, setPrintDoc] = useState<any>(null);
  const [showNewSuppModal, setShowNewSuppModal] = useState(false);
  const [newSuppData, setNewSuppData] = useState({
    name: '',
    phone: '',
    vatNumber: '',
    address: '',
    creditLimit: 100000,
  });

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);

  // Totals
  const subTotal = rows.reduce((s, r) => s + r.qty * r.price, 0);
  const taxTotal = subTotal * 0.15;
  const grandTotal = subTotal + taxTotal;

  const addItemToRows = (item: Item) => {
    const existing = rows.find((r) => r.itemId === item.id);
    if (existing) {
      existing.qty += 1;
      existing.total = existing.qty * existing.price * 1.15;
      setRows([...rows]);
    } else {
      setRows([
        ...rows,
        {
          id: String(Date.now()),
          itemId: item.id,
          barcode: item.barcode,
          name: item.name,
          unit: item.unit,
          qty: 1,
          price: item.purchasePrice,
          discountPercent: 0,
          taxPercent: 15,
          total: item.purchasePrice * 1.15,
        },
      ]);
    }
  };

  const updateRow = (idx: number, field: keyof InvoiceItemRow, value: any) => {
    const updated = [...rows];
    updated[idx] = { ...updated[idx], [field]: value };
    updated[idx].total = updated[idx].qty * updated[idx].price * 1.15;
    setRows(updated);
  };

  const removeRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleSavePurchase = () => {
    if (rows.length === 0) {
      alert('يجب إضافة صنف واحد على الأقل في فاتورة المشتريات.');
      return;
    }
    const store = stores.find((s) => s.id === selectedStoreId);
    const created = erpDb.createPurchaseInvoice({
      date: invoiceDate,
      supplierId: selectedSupplierId,
      supplierName: selectedSupplier?.name || 'مورد بضاعة عام',
      billRefNo,
      paymentType,
      storeId: selectedStoreId,
      storeName: store?.name || 'المستودع الرئيسي',
      items: rows,
      subTotal,
      taxTotal,
      grandTotal,
      notes,
    });

    setPrintDoc({
      title: 'فاتورة استلام مشتريات بضاعة',
      docNo: created.invoiceNo,
      date: created.date,
      partyName: created.supplierName,
      amount: created.grandTotal,
      statement: `فاتورة مشتريات رقم المورد (${billRefNo}) - المستودع: ${store?.name || ''}`,
      items: created.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        tax: i.qty * i.price * 0.15,
        total: i.total,
      })),
      taxTotal: created.taxTotal,
    });

    setRows([]);
    setNotes('');
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuppData.name) return;
    const saved = erpDb.saveCustSup({
      ...newSuppData,
      type: 'supplier',
      currentBalance: 0,
    });
    setSelectedSupplierId(saved.id);
    setShowNewSuppModal(false);
    setNewSuppData({ name: '', phone: '', vatNumber: '', address: '', creditLimit: 100000 });
  };

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="فاتورة المشتريات والتوريد"
        screenId={15}
        category="المشتريات والموردين"
        icon={<Truck className="w-4 h-4 text-white" />}
        description="تسجيل فواتير الشراء وأوامر التوريد وإثبات استحقاقات الموردين والتحديث المباشر للمخزون"
        onOpenScreen={onOpenScreen}
      />

      {/* Real In-Screen Links Toolbar matching PurchaseEntryForm.cs BuildUi */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] p-1.5 flex flex-wrap items-center gap-1.5 text-xs shadow-2xs rounded-xs">
        <button
          type="button"
          onClick={() => setShowSuppPicker(true)}
          className="px-3 py-1 bg-[#005a9e] hover:bg-[#004b85] text-white font-bold cursor-pointer shadow-2xs transition flex items-center gap-1 rounded-xs"
        >
          <span>اختيار مورد</span>
        </button>
        <button
          type="button"
          onClick={() => setShowItemPicker(true)}
          className="px-3 py-1 bg-[#005a9e] hover:bg-[#004b85] text-white font-bold cursor-pointer shadow-2xs transition flex items-center gap-1 rounded-xs"
        >
          <span>إضافة صنف من الدليل</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(32, { supplierId: selectedSupplierId })}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          سند صرف
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(16)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          مرتجعات المشتريات
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(61)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          تقرير المشتريات
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(43, { accountId: selectedSupplier?.id || 10 })}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          كشف حساب المورد
        </button>

        <span className="h-4 w-px bg-slate-300 mx-1"></span>

        <button
          type="button"
          onClick={handleSavePurchase}
          className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer shadow-2xs transition rounded-xs"
        >
          حفظ جديد
        </button>
        <button
          type="button"
          onClick={() => {
            setRows([]);
            setNotes('');
          }}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          فاتورة جديدة
        </button>
      </div>

      {/* Top Tab Bar */}
      <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'new'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Truck className={`w-3.5 h-3.5 ${activeTab === 'new' ? 'text-white' : 'text-emerald-600'}`} />
            <span>فاتورة مشتريات جديدة</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${activeTab === 'list' ? 'text-white' : 'text-slate-500'}`} />
            <span>سجل فواتير المشتريات ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'suppliers'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${activeTab === 'suppliers' ? 'text-white' : 'text-cyan-600'}`} />
            <span>دليل وبطاقات الموردين ({suppliers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Payment Voucher */}
          <button
            onClick={() => onOpenScreen(32)}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xs text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ سند صرف للمورد</span>
          </button>
        </div>
      </div>

      {/* TAB 1: New Purchase Invoice */}
      {activeTab === 'new' && (
        <div className="space-y-4">
          {/* Header Panel */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {/* Supplier Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">المورد:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowNewSuppModal(true)}
                      className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      + مورد جديد
                    </button>
                    {selectedSupplier && (
                      <button
                        type="button"
                        onClick={() => onOpenScreen(43, { accountId: 13 })}
                        className="text-[10px] text-indigo-600 hover:underline mr-1 font-bold cursor-pointer"
                        title="كشف حساب المورد في دفتر الأستاذ"
                      >
                        [كشف حساب]
                      </button>
                    )}
                  </div>
                </div>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(parseInt(e.target.value, 10))}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white font-semibold text-slate-800"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.currentBalance > 0 ? `(دائن: ${s.currentBalance.toLocaleString()} ر.س)` : ''}
                    </option>
                  ))}
                </select>
                {selectedSupplier && (
                  <div className="mt-1 text-[10px] text-slate-500 flex justify-between">
                    <span>الرصيد المستحق: {selectedSupplier.currentBalance.toLocaleString()} ر.س</span>
                    <span>الرقم الضريبي: {selectedSupplier.vatNumber || '—'}</span>
                  </div>
                )}
              </div>

              {/* Bill Reference No */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">رقم فاتورة المورد:</label>
                <input
                  type="text"
                  value={billRefNo}
                  onChange={(e) => setBillRefNo(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono"
                  placeholder="مثال: SUP-88912"
                />
              </div>

              {/* Payment Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">طريقة الدفع:</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white font-semibold text-slate-800"
                >
                  <option value="آجل">آجل (ذمم دائنة - حساب المورد)</option>
                  <option value="نقدي">نقدي (الصندوق الرئيسي)</option>
                  <option value="تحويل بنكي">تحويل بنكي (البنك الأهلي)</option>
                </select>
              </div>

              {/* Store & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المستودع:</label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded p-1.5 bg-white"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">التاريخ:</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full border border-slate-300 rounded p-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Quick Add item */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-600 font-semibold">إضافة صنف مشتريات:</span>
              <select
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  const it = items.find((i) => i.id === id);
                  if (it) addItemToRows(it);
                }}
                className="border border-slate-300 rounded p-1.5 bg-white text-slate-700 max-w-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  -- اضغط لاختيار الصنف المراد شراؤه --
                </option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (تكلفة الشراء: {i.purchasePrice} ر.س | متوفر: {i.currentStock})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
              <span>أصناف فاتورة المشتريات ({rows.length} سطر)</span>
              <span className="text-emerald-700">تحديث كميات المستودع آلياً عند الاعتماد</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2.5 w-10">#</th>
                    <th className="p-2.5">اسم الصنف</th>
                    <th className="p-2.5">الوحدة</th>
                    <th className="p-2.5 w-24 text-center">الكمية الواردة</th>
                    <th className="p-2.5 w-28 text-left">سعر التكلفة (ر.س)</th>
                    <th className="p-2.5 w-28 text-left">الضريبة 15%</th>
                    <th className="p-2.5 w-32 text-left">الإجمالي شامل الضريبة</th>
                    <th className="p-2.5 w-16 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        لم يتم إضافة أي أصناف بعد.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900">
                          <span>{row.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            كود: {row.barcode}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600">{row.unit}</td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            value={row.qty}
                            onChange={(e) =>
                              updateRow(idx, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))
                            }
                            className="w-full border border-slate-300 rounded p-1 text-center font-mono font-bold"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.price}
                            onChange={(e) =>
                              updateRow(idx, 'price', Math.max(0, parseFloat(e.target.value) || 0))
                            }
                            className="w-full border border-slate-300 rounded p-1 text-left font-mono font-bold"
                          />
                        </td>
                        <td className="p-2.5 text-left font-mono text-slate-600">
                          {(row.qty * row.price * 0.15).toFixed(2)} ر.س
                        </td>
                        <td className="p-2.5 text-left font-mono font-black text-slate-900 text-sm">
                          {row.total.toFixed(2)} ر.س
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Submit */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ملاحظات واستلام الشحنة:
              </label>
              <textarea
                rows={2}
                placeholder="ملاحظات محضر الفحص والاستلام بالمستودع..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              ></textarea>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-3 text-xs space-y-1 min-w-[240px]">
                <div className="flex justify-between text-slate-600">
                  <span>إجمالي المشتريات:</span>
                  <span className="font-mono font-bold">{subTotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ضريبة القيمة المضافة 15%:</span>
                  <span className="font-mono font-bold">{taxTotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-950 font-black text-base pt-1 border-t border-emerald-200">
                  <span>الإجمالي الصافي:</span>
                  <span className="font-mono text-emerald-950">{grandTotal.toFixed(2)} ر.س</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePurchase}
                disabled={rows.length === 0}
                className="w-full sm:w-auto px-6 py-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>اعتماد وترحيل فاتورة المشتريات</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Purchase Invoices List */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              سجل فواتير المشتريات الواردة (dbo.Order_Purchases)
            </span>
            <span className="text-slate-500">إجمالي الفواتير: {invoices.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم الفاتورة</th>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">المورد</th>
                  <th className="p-2.5">رقم إشعار المورد</th>
                  <th className="p-2.5">طريقة الدفع</th>
                  <th className="p-2.5 text-left">الضريبة 15%</th>
                  <th className="p-2.5 text-left">الإجمالي الصافي</th>
                  <th className="p-2.5 text-center">العمليات والطباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-emerald-700">{inv.invoiceNo}</td>
                    <td className="p-2.5 font-mono text-slate-600">{inv.date}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{inv.supplierName}</td>
                    <td className="p-2.5 font-mono text-slate-600">{inv.billRefNo}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border text-slate-700 text-[10px]">
                        {inv.paymentType}
                      </span>
                    </td>
                    <td className="p-2.5 text-left font-mono text-slate-600">
                      {inv.taxTotal.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-left font-mono font-black text-slate-900 text-sm">
                      {inv.grandTotal.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          setPrintDoc({
                            title: 'فاتورة استلام مشتريات',
                            docNo: inv.invoiceNo,
                            date: inv.date,
                            partyName: inv.supplierName,
                            amount: inv.grandTotal,
                            statement: `فاتورة مشتريات - مرجع المورد: ${inv.billRefNo}`,
                            items: inv.items.map((i) => ({
                              name: i.name,
                              qty: i.qty,
                              price: i.price,
                              tax: i.qty * i.price * 0.15,
                              total: i.total,
                            })),
                            taxTotal: inv.taxTotal,
                          })
                        }
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3 text-amber-600" />
                        <span>طباعة</span>
                      </button>

                      <button
                        onClick={() => onOpenScreen(43, { accountId: 13 })}
                        className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        title="كشف حساب المورد في دفتر الأستاذ"
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

      {/* TAB 3: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">دليل بطاقات الموردين (dbo.Account_CustSup)</span>
            <button
              onClick={() => setShowNewSuppModal(true)}
              className="px-3 py-1 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded text-xs transition cursor-pointer"
            >
              + إضافة بطاقة مورد جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">كود المورد</th>
                  <th className="p-2.5">اسم شركة التوريد / المورد</th>
                  <th className="p-2.5">رقم الهاتف</th>
                  <th className="p-2.5">الرقم الضريبي</th>
                  <th className="p-2.5">المدينة والعنوان</th>
                  <th className="p-2.5 text-left">الرصيد الدائن المستحق</th>
                  <th className="p-2.5 text-center">العمليات والربط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-cyan-800">{s.code}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{s.name}</td>
                    <td className="p-2.5 font-mono text-slate-600">{s.phone || '—'}</td>
                    <td className="p-2.5 font-mono text-slate-600">{s.vatNumber || '—'}</td>
                    <td className="p-2.5 text-slate-600">{s.address || '—'}</td>
                    <td className="p-2.5 text-left font-mono font-black text-rose-700 text-sm">
                      {s.currentBalance.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => onOpenScreen(43, { accountId: 13 })}
                        className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        title="كشف حساب المورد"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>كشف حساب</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSupplierId(s.id);
                          setActiveTab('new');
                        }}
                        className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Truck className="w-3 h-3" />
                        <span>شراء</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Supplier */}
      {showNewSuppModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-md w-full p-5 space-y-4 text-right">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              إضافة بطاقة مورد جديد (dbo.Account_CustSup)
            </h3>
            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">اسم شركة المورد:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مصنع الرياض للمواد الصناعية"
                  value={newSuppData.name}
                  onChange={(e) => setNewSuppData({ ...newSuppData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={newSuppData.phone}
                    onChange={(e) => setNewSuppData({ ...newSuppData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الرقم الضريبي:</label>
                  <input
                    type="text"
                    value={newSuppData.vatNumber}
                    onChange={(e) => setNewSuppData({ ...newSuppData, vatNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">العنوان:</label>
                <input
                  type="text"
                  value={newSuppData.address}
                  onChange={(e) => setNewSuppData({ ...newSuppData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewSuppModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-700 hover:bg-cyan-800 text-white font-bold"
                >
                  حفظ المورد
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
          items={printDoc.items}
          taxTotal={printDoc.taxTotal}
          onClose={() => setPrintDoc(null)}
        />
      )}

      {/* Live Supplier Picker Modal matching InternalScreenLinks.TryChooseCustomer */}
      {showSuppPicker && (
        <BusinessRecordPickerModal
          type="supplier"
          title="اختيار مورد (Supplier_Suppliers)"
          onSelect={(sup) => {
            setSelectedSupplierId(sup.id);
          }}
          onClose={() => setShowSuppPicker(false)}
        />
      )}

      {/* Live Item Picker Modal matching InternalScreenLinks.TryChooseItem */}
      {showItemPicker && (
        <BusinessRecordPickerModal
          type="item"
          title="إضافة صنف من الدليل (Item_Items)"
          onSelect={(it) => {
            addItemToRows(it);
          }}
          onClose={() => setShowItemPicker(false)}
        />
      )}
    </div>
  );
};
