import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Printer,
  Trash2,
  Search,
  BookOpen,
  Package,
  RotateCcw,
  Users,
  CheckCircle2,
  ArrowDownLeft,
  Barcode
} from 'lucide-react';
import { SalesInvoice, InvoiceItemRow, CustomerSupplier, Item } from '../../types/erp';
import { erpDb } from '../../services/erpDatabase';
import { VoucherPrintModal } from '../common/VoucherPrintModal';
import { BusinessRecordPickerModal } from '../common/BusinessRecordPickerModal';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface SalesEntryProps {
  initialInvoiceId?: number;
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const SalesEntryScreen: React.FC<SalesEntryProps> = ({
  initialInvoiceId,
  onOpenScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'new' | 'returns' | 'customers'>('new');
  const invoices = erpDb.getSalesInvoices();
  const customers = erpDb.getCustSup().filter((c) => c.type === 'customer');
  const items = erpDb.getItems();
  const stores = erpDb.getStores();

  // Record Picker Modals (matching InternalScreenLinks in C#)
  const [showCustPicker, setShowCustPicker] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);

  // New Invoice Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.id || 101);
  const [paymentType, setPaymentType] = useState<'نقدي' | 'آجل' | 'شبكة (مدى)'>('آجل');
  const [selectedStoreId, setSelectedStoreId] = useState<number>(stores[0]?.id || 1);
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');

  // Invoice Items Lines
  const [invoiceRows, setInvoiceRows] = useState<InvoiceItemRow[]>([
    {
      id: '1',
      itemId: items[0]?.id || 1,
      barcode: items[0]?.barcode || '628100100001',
      name: items[0]?.name || 'كيبل نحاسي 4 ملم معزول 100 متر',
      unit: items[0]?.unit || 'كرتون (12 حبة)',
      qty: 2,
      price: items[0]?.salePrice || 245,
      discountPercent: 0,
      taxPercent: 15,
      total: (items[0]?.salePrice || 245) * 2 * 1.15,
    },
  ]);

  // Barcode quick add
  const [barcodeInput, setBarcodeInput] = useState('');

  // Print modal state
  const [printDoc, setPrintDoc] = useState<any>(null);

  // New Customer modal
  const [showNewCustModal, setShowNewCustModal] = useState(false);
  const [newCustData, setNewCustData] = useState({
    name: '',
    phone: '',
    vatNumber: '',
    address: '',
    creditLimit: 50000,
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Calculate totals
  const subTotal = invoiceRows.reduce((sum, r) => sum + r.qty * r.price, 0);
  const discountTotal = invoiceRows.reduce(
    (sum, r) => sum + (r.qty * r.price * r.discountPercent) / 100,
    0
  );
  const taxableAmount = subTotal - discountTotal;
  const taxTotal = taxableAmount * 0.15;
  const grandTotal = taxableAmount + taxTotal;

  // Barcode handler
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const found = erpDb.getItemByBarcode(barcodeInput);
    if (found) {
      addItemToInvoice(found);
      setBarcodeInput('');
    } else {
      alert(`لم يتم العثور على صنف بالباركود أو الكود: ${barcodeInput}`);
    }
  };

  const addItemToInvoice = (item: Item) => {
    const existingIdx = invoiceRows.findIndex((r) => r.itemId === item.id);
    if (existingIdx >= 0) {
      const updated = [...invoiceRows];
      updated[existingIdx].qty += 1;
      const rowTax = updated[existingIdx].qty * updated[existingIdx].price * 0.15;
      updated[existingIdx].total =
        updated[existingIdx].qty * updated[existingIdx].price + rowTax;
      setInvoiceRows(updated);
    } else {
      const rowTax = 1 * item.salePrice * 0.15;
      const newRow: InvoiceItemRow = {
        id: String(Date.now()),
        itemId: item.id,
        barcode: item.barcode,
        name: item.name,
        unit: item.unit,
        qty: 1,
        price: item.salePrice,
        discountPercent: 0,
        taxPercent: 15,
        total: item.salePrice + rowTax,
      };
      setInvoiceRows([...invoiceRows, newRow]);
    }
  };

  const updateRow = (idx: number, field: keyof InvoiceItemRow, value: any) => {
    const updated = [...invoiceRows];
    updated[idx] = { ...updated[idx], [field]: value };
    const base = updated[idx].qty * updated[idx].price;
    const disc = (base * updated[idx].discountPercent) / 100;
    const tax = (base - disc) * (updated[idx].taxPercent / 100);
    updated[idx].total = base - disc + tax;
    setInvoiceRows(updated);
  };

  const removeRow = (idx: number) => {
    setInvoiceRows(invoiceRows.filter((_, i) => i !== idx));
  };

  // Submit Invoice
  const handleSaveInvoice = () => {
    if (invoiceRows.length === 0) {
      alert('يجب إضافة صنف واحد على الأقل في الفاتورة.');
      return;
    }

    const store = stores.find((s) => s.id === selectedStoreId);
    const created = erpDb.createSalesInvoice({
      date: invoiceDate,
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || 'العميل النقدي العام',
      paymentType,
      storeId: selectedStoreId,
      storeName: store?.name || 'المستودع الرئيسي',
      items: invoiceRows,
      subTotal,
      discountTotal,
      taxTotal,
      grandTotal,
      notes,
    });

    // Show Print Dialog
    setPrintDoc({
      title: 'فاتورة ضريبية للمبيعات (Tax Invoice)',
      docNo: created.invoiceNo,
      date: created.date,
      partyName: created.customerName,
      amount: created.grandTotal,
      statement: `فاتورة مبيعات ${paymentType} - المستودع: ${store?.name || ''}`,
      items: created.items.map((i) => ({
        name: i.name,
        qty: i.qty,
        price: i.price,
        tax: (i.qty * i.price * 0.15),
        total: i.total,
      })),
      taxTotal: created.taxTotal,
    });

    // Reset rows for new invoice
    setInvoiceRows([]);
    setNotes('');
  };

  // Save new customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustData.name) return;
    const saved = erpDb.saveCustSup({
      ...newCustData,
      type: 'customer',
      currentBalance: 0,
    });
    setSelectedCustomerId(saved.id);
    setShowNewCustModal(false);
    setNewCustData({ name: '', phone: '', vatNumber: '', address: '', creditLimit: 50000 });
  };

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="فاتورة المبيعات والكاشير"
        screenId={59}
        category="المبيعات والتوزيع"
        icon={<ShoppingCart className="w-4 h-4 text-white" />}
        description="تسجيل فواتير المبيعات النقدية والآجلة وطباعة الفواتير الضريبية ZATCA والربط مع سندات القبض ودفتر الأستاذ"
        onOpenScreen={onOpenScreen}
      />

      {/* Real In-Screen Links Toolbar matching SalesEntryForm.cs BuildUi */}
      <div className="bg-[#f8fafc] border border-[#cbd5e1] p-1.5 flex flex-wrap items-center gap-1.5 text-xs shadow-2xs rounded-xs">
        <button
          type="button"
          onClick={() => setShowCustPicker(true)}
          className="px-3 py-1 bg-[#005a9e] hover:bg-[#004b85] text-white font-bold cursor-pointer shadow-2xs transition flex items-center gap-1 rounded-xs"
        >
          <span>اختيار عميل</span>
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
          onClick={() => onOpenScreen(43, { accountId: selectedCustomer?.id || 6 })}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          كشف حساب
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(31, { customerId: selectedCustomerId })}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          سند قبض
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(14)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          مرتجعات المبيعات
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(60)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          تقرير المبيعات
        </button>

        <span className="h-4 w-px bg-slate-300 mx-1"></span>

        <button
          type="button"
          onClick={handleSaveInvoice}
          className="px-4 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer shadow-2xs transition rounded-xs"
        >
          حفظ فاتورة
        </button>
        <button
          type="button"
          onClick={() => {
            setInvoiceRows([]);
            setNotes('');
          }}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          فاتورة جديدة
        </button>
      </div>

      {/* Tab Navigation */}
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
            <ShoppingCart className={`w-3.5 h-3.5 ${activeTab === 'new' ? 'text-white' : 'text-[#005a9e]'}`} />
            <span>فاتورة مبيعات جديدة / كاشير</span>
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
            <span>سجل فواتير المبيعات ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Users className={`w-3.5 h-3.5 ${activeTab === 'customers' ? 'text-white' : 'text-slate-600'}`} />
            <span>دليل وبطاقات العملاء ({customers.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick link to receipt voucher for customer collection */}
          <button
            onClick={() => onOpenScreen(31)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+ سند قبض من العميل</span>
          </button>
        </div>
      </div>

      {/* TAB 1: New Invoice / Cashier Entry Form */}
      {activeTab === 'new' && (
        <div className="space-y-4">
          {/* Header Panel */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              {/* Customer Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">العميل / الحساب:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowNewCustModal(true)}
                      className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      + عميل جديد
                    </button>
                    {selectedCustomer && (
                      <button
                        type="button"
                        onClick={() => onOpenScreen(43, { accountId: 6 })}
                        className="text-[10px] text-indigo-600 hover:underline mr-1 font-bold cursor-pointer"
                        title="كشف حساب العميل في دفتر الأستاذ"
                      >
                        [كشف حساب]
                      </button>
                    )}
                  </div>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(parseInt(e.target.value, 10))}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white font-semibold text-slate-800"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.currentBalance > 0 ? `(مدين: ${c.currentBalance.toLocaleString()} ر.س)` : ''}
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <div className="mt-1 text-[10px] text-slate-500 flex justify-between">
                    <span>الرصيد: {selectedCustomer.currentBalance.toLocaleString()} ر.س</span>
                    <span>الحد الائتماني: {selectedCustomer.creditLimit.toLocaleString()} ر.س</span>
                  </div>
                )}
              </div>

              {/* Payment Type */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">طريقة الدفع:</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded p-1.5 bg-white font-semibold text-slate-800"
                >
                  <option value="آجل">آجل (ذمم مدينة - حساب العميل)</option>
                  <option value="نقدي">نقدي (الصندوق الرئيسي)</option>
                  <option value="شبكة (مدى)">شبكة مدى / بطاقة (البنك الأهلي)</option>
                </select>
              </div>

              {/* Store Warehouse */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">المستودع المصروف منه:</label>
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

              {/* Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">تاريخ الفاتورة:</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full border border-slate-300 rounded p-1.5 font-mono"
                />
              </div>
            </div>

            {/* Barcode Quick Entry Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="امسح أو أدخل باركود الصنف واضغط Enter..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full border-2 border-amber-400 bg-amber-50/50 rounded pr-8 pl-3 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-600"
                  />
                  <Barcode className="w-4 h-4 text-amber-700 absolute right-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-xs cursor-pointer shrink-0"
                >
                  إضافة
                </button>
              </form>

              <div className="flex items-center gap-1.5 text-xs mr-auto">
                <span className="text-slate-500">أو اختر صنفاً يدوياً:</span>
                <select
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    const it = items.find((i) => i.id === id);
                    if (it) addItemToInvoice(it);
                  }}
                  className="border border-slate-300 rounded p-1.5 text-xs bg-white text-slate-700 max-w-xs"
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- اختر صنفاً لإضافته --
                  </option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} (السعر: {i.salePrice} ر.س | متوفر: {i.currentStock})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold">
              <span>جدول أصناف الفاتورة ({invoiceRows.length} سطر)</span>
              <span className="text-slate-500">ضريبة القيمة المضافة 15% محتسبة تلقائياً</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-2.5 w-10">#</th>
                    <th className="p-2.5">اسم الصنف والبيان</th>
                    <th className="p-2.5">الوحدة</th>
                    <th className="p-2.5 w-24 text-center">الكمية</th>
                    <th className="p-2.5 w-28 text-left">السعر (ر.س)</th>
                    <th className="p-2.5 w-20 text-center">خصم %</th>
                    <th className="p-2.5 w-28 text-left">الضريبة 15%</th>
                    <th className="p-2.5 w-32 text-left">الإجمالي شامل الضريبة</th>
                    <th className="p-2.5 w-16 text-center">حذف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoiceRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        لم يتم إضافة أي أصناف بعد. أدخل باركود الصنف أو اختر من القائمة أعلاه.
                      </td>
                    </tr>
                  ) : (
                    invoiceRows.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 text-slate-500 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{row.name}</span>
                            <button
                              type="button"
                              onClick={() => onOpenScreen(8, { itemId: row.itemId })}
                              className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                              title="فتح بطاقة الصنف"
                            >
                              [بطاقة الصنف]
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            باركود: {row.barcode}
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
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row.discountPercent}
                            onChange={(e) =>
                              updateRow(
                                idx,
                                'discountPercent',
                                Math.min(100, Math.max(0, parseFloat(e.target.value) || 0))
                              )
                            }
                            className="w-full border border-slate-300 rounded p-1 text-center font-mono"
                          />
                        </td>
                        <td className="p-2.5 text-left font-mono text-slate-600">
                          {((row.qty * row.price * (1 - row.discountPercent / 100)) * 0.15).toFixed(2)} ر.س
                        </td>
                        <td className="p-2.5 text-left font-mono font-black text-slate-900 text-sm">
                          {row.total.toFixed(2)} ر.س
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                            title="حذف السطر"
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

          {/* Totals & Confirmation Bar */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ملاحظات وشروط الفاتورة:
              </label>
              <textarea
                rows={2}
                placeholder="شروط التسليم والدفع والضمان..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded p-2 text-xs"
              ></textarea>
            </div>

            <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
              {/* Financial Box */}
              <div className="bg-amber-50/80 border border-amber-300 rounded-lg p-3 text-xs space-y-1 min-w-[240px]">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono font-bold">{subTotal.toFixed(2)} ر.س</span>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>إجمالي الخصم:</span>
                    <span className="font-mono font-bold">-{discountTotal.toFixed(2)} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>ضريبة القيمة المضافة 15%:</span>
                  <span className="font-mono font-bold">{taxTotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-slate-950 font-black text-base pt-1 border-t border-amber-200">
                  <span>الإجمالي الصافي:</span>
                  <span className="font-mono text-amber-900">{grandTotal.toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* Save & Print Button */}
              <button
                type="button"
                onClick={handleSaveInvoice}
                disabled={invoiceRows.length === 0}
                className="w-full sm:w-auto px-6 py-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>حفظ وترحيل الفاتورة وطباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sales Invoices List */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">سجل فواتير المبيعات الصادرة (dbo.Order_Order)</span>
            <span className="text-slate-500">إجمالي الفواتير: {invoices.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم الفاتورة</th>
                  <th className="p-2.5">التاريخ</th>
                  <th className="p-2.5">العميل</th>
                  <th className="p-2.5">طريقة الدفع</th>
                  <th className="p-2.5">المستودع</th>
                  <th className="p-2.5 text-left">الضريبة 15%</th>
                  <th className="p-2.5 text-left">الإجمالي الصافي</th>
                  <th className="p-2.5 text-center">العمليات والطباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-blue-700">{inv.invoiceNo}</td>
                    <td className="p-2.5 font-mono text-slate-600">{inv.date}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{inv.customerName}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border text-slate-700 text-[10px]">
                        {inv.paymentType}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-600">{inv.storeName}</td>
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
                            title: 'فاتورة ضريبية للمبيعات',
                            docNo: inv.invoiceNo,
                            date: inv.date,
                            partyName: inv.customerName,
                            amount: inv.grandTotal,
                            statement: `فاتورة مبيعات ${inv.paymentType} - المستودع: ${inv.storeName}`,
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
                        onClick={() => onOpenScreen(43, { accountId: 6 })}
                        className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        title="كشف حساب العميل في دفتر الأستاذ"
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

      {/* TAB 3: Customers Directory */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">دليل بطاقات العملاء (dbo.Account_CustSup)</span>
            <button
              onClick={() => setShowNewCustModal(true)}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs transition cursor-pointer"
            >
              + إضافة بطاقة عميل جديد
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">كود العميل</th>
                  <th className="p-2.5">اسم العميل / المؤسسة</th>
                  <th className="p-2.5">رقم الهاتف</th>
                  <th className="p-2.5">الرقم الضريبي</th>
                  <th className="p-2.5">العنوان</th>
                  <th className="p-2.5 text-left">الحد الائتماني</th>
                  <th className="p-2.5 text-left">الرصيد المدين الحالي</th>
                  <th className="p-2.5 text-center">العمليات والربط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-indigo-700">{c.code}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{c.name}</td>
                    <td className="p-2.5 font-mono text-slate-600">{c.phone || '—'}</td>
                    <td className="p-2.5 font-mono text-slate-600">{c.vatNumber || '—'}</td>
                    <td className="p-2.5 text-slate-600">{c.address || '—'}</td>
                    <td className="p-2.5 text-left font-mono font-bold text-slate-700">
                      {c.creditLimit.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-left font-mono font-black text-rose-700 text-sm">
                      {c.currentBalance.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => onOpenScreen(43, { accountId: 6 })}
                        className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        title="كشف حساب العميل"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>كشف حساب</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCustomerId(c.id);
                          setActiveTab('new');
                        }}
                        className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>فاتورة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: New Customer */}
      {showNewCustModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-md w-full p-5 space-y-4 text-right">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              إضافة بطاقة عميل جديد (dbo.Account_CustSup)
            </h3>
            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">اسم العميل / الشركة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة المقاولات الحديثة"
                  value={newCustData.name}
                  onChange={(e) => setNewCustData({ ...newCustData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">رقم الجوال:</label>
                  <input
                    type="text"
                    placeholder="05XXXXXXXX"
                    value={newCustData.phone}
                    onChange={(e) => setNewCustData({ ...newCustData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الرقم الضريبي (15 رقم):</label>
                  <input
                    type="text"
                    placeholder="3XXXXXXXXXXXXXX"
                    value={newCustData.vatNumber}
                    onChange={(e) => setNewCustData({ ...newCustData, vatNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">العنوان والمدينة:</label>
                <input
                  type="text"
                  placeholder="الرياض - حي الملز"
                  value={newCustData.address}
                  onChange={(e) => setNewCustData({ ...newCustData, address: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الحد الائتماني (ر.س):</label>
                <input
                  type="number"
                  min="0"
                  value={newCustData.creditLimit}
                  onChange={(e) =>
                    setNewCustData({ ...newCustData, creditLimit: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewCustModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  حفظ العميل
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

      {/* Live Customer Picker Modal matching InternalScreenLinks.TryChooseCustomer */}
      {showCustPicker && (
        <BusinessRecordPickerModal
          type="customer"
          title="اختيار عميل (Cust_Customers)"
          onSelect={(cust) => {
            setSelectedCustomerId(cust.id);
          }}
          onClose={() => setShowCustPicker(false)}
        />
      )}

      {/* Live Item Picker Modal matching InternalScreenLinks.TryChooseItem */}
      {showItemPicker && (
        <BusinessRecordPickerModal
          type="item"
          title="إضافة صنف من الدليل (Item_Items)"
          onSelect={(it) => {
            addItemToInvoice(it);
          }}
          onClose={() => setShowItemPicker(false)}
        />
      )}
    </div>
  );
};
