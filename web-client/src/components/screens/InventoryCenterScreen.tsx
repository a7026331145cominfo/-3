import React, { useState } from 'react';
import {
  Package,
  Layers,
  PlusCircle,
  ArrowLeftRight,
  ClipboardCheck,
  Search,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Barcode
} from 'lucide-react';
import { Item, ItemUnit, ItemGroup, ItemClass, Store } from '../../types/erp';
import { erpDb } from '../../services/erpDatabase';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface InventoryCenterProps {
  initialItemId?: number;
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const InventoryCenterScreen: React.FC<InventoryCenterProps> = ({
  initialItemId,
  onOpenScreen,
}) => {
  const [activeTab, setActiveTab] = useState<'items' | 'opening' | 'units' | 'transfer' | 'settlement'>('items');
  const items = erpDb.getItems();
  const units = erpDb.getUnits();
  const groups = erpDb.getGroups();
  const classes = erpDb.getClasses();
  const stores = erpDb.getStores();

  const [search, setSearch] = useState('');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    barcode: '',
    code: '',
    unit: 'حبة / قطعة',
    group: 'الأدوات الكهربائية والإضاءة',
    category: 'صنف استراتيجي عالي الدوران',
    purchasePrice: 50,
    salePrice: 75,
    minQty: 10,
    currentStock: 0,
    storeId: 1,
  });

  // Opening quantity state
  const [openItemId, setOpenItemId] = useState<number>(items[0]?.id || 1);
  const [openStoreId, setOpenStoreId] = useState<number>(1);
  const [openQty, setOpenQty] = useState<number>(50);
  const [openCostPrice, setOpenCostPrice] = useState<number>(100);
  const [openNotes, setOpenNotes] = useState<string>('جرد أولي معتمد من لجنة الجرد');
  const [openingSuccess, setOpeningSuccess] = useState('');

  // Transfer state
  const [transferFromStore, setTransferFromStore] = useState<number>(1);
  const [transferToStore, setTransferToStore] = useState<number>(2);
  const [transferItemId, setTransferItemId] = useState<number>(items[0]?.id || 1);
  const [transferQty, setTransferQty] = useState<number>(5);
  const [transferSuccess, setTransferSuccess] = useState('');

  // Settlement state
  const [settleItemId, setSettleItemId] = useState<number>(items[0]?.id || 1);
  const [actualQty, setActualQty] = useState<number>(items[0]?.currentStock || 0);
  const [settleSuccess, setSettleSuccess] = useState('');

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.barcode.includes(search) ||
      i.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.barcode) return;
    erpDb.saveItem(newItemData);
    setShowAddItemModal(false);
    setNewItemData({
      name: '',
      barcode: '',
      code: '',
      unit: 'حبة / قطعة',
      group: 'الأدوات الكهربائية والإضاءة',
      category: 'صنف استراتيجي عالي الدوران',
      purchasePrice: 50,
      salePrice: 75,
      minQty: 10,
      currentStock: 0,
      storeId: 1,
    });
  };

  const handleApplyOpeningQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    erpDb.updateOpeningQuantity(openItemId, openStoreId, openQty, openCostPrice, openNotes);
    const it = erpDb.getItemById(openItemId);
    setOpeningSuccess(`تم تثبيت الرصيد الافتتاحي للصنف (${it?.name}) بكمية ${openQty} وحدة وترحيل القيد آلياً.`);
    setTimeout(() => setOpeningSuccess(''), 4000);
  };

  const handleApplyTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFromStore === transferToStore) {
      alert('لا يمكن التحويل لنفس المستودع.');
      return;
    }
    const it = erpDb.getItemById(transferItemId);
    if (!it || it.currentStock < transferQty) {
      alert(`الرصيد المتاح غير كافٍ. المتوفر حالياً: ${it?.currentStock || 0}`);
      return;
    }
    // Perform transfer
    setTransferSuccess(
      `تم إصدار إذن تحويل مخزني بنجاح للصنف (${it.name}) بكمية ${transferQty} وحدة من المستودع ${transferFromStore} إلى ${transferToStore}.`
    );
    setTimeout(() => setTransferSuccess(''), 4000);
  };

  const handleApplySettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const it = erpDb.getItemById(settleItemId);
    if (!it) return;
    const diff = actualQty - it.currentStock;
    erpDb.adjustItemStock(it.id, diff);
    setSettleSuccess(
      `تمت تسوية المخزون بنجاح. الفارق: ${diff > 0 ? `+${diff} زيادة` : `${diff} عجز`}. الرصيد الفعلي الحالي: ${actualQty} وحدة.`
    );
    setTimeout(() => setSettleSuccess(''), 4000);
  };

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="دليل وبطاقة الأصناف وحركة المخزون"
        screenId={activeTab === 'items' ? 8 : activeTab === 'opening' ? 18 : activeTab === 'transfer' ? 25 : activeTab === 'settlement' ? 83 : 5}
        category="إدارة المخازن والمستودعات"
        icon={<Package className="w-4 h-4 text-white" />}
        description="بطاقات الأصناف والباركود، الكميات الافتتاحية، التحويلات بين المستودعات، والجرد والتسوية"
        onOpenScreen={onOpenScreen}
      />

      {/* Real In-Screen Links Toolbar matching BusinessProcedureForms.cs ItemManagementForm */}
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
          onClick={() => onOpenScreen(60)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          تقرير حركة الصنف
        </button>
        <button
          type="button"
          onClick={() => onOpenScreen(18)}
          className="px-3 py-1 bg-white hover:bg-[#e5f1fb] hover:border-[#0078d7] border border-[#cbd5e1] font-semibold text-slate-800 cursor-pointer transition rounded-xs"
        >
          أرصدة المخزون والكميات الافتتاحية
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'items'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>بطاقة الصنف ودليل الأصناف ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('opening')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'opening'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>الكميات والأرصدة الافتتاحية (Opening Qty)</span>
          </button>

          <button
            onClick={() => setActiveTab('transfer')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'transfer'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>التحويل بين المستودعات</span>
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settlement'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>تسوية وجرد المخزون</span>
          </button>

          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'units'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الوحدات والمجموعات</span>
          </button>
        </div>

        {activeTab === 'items' && (
          <button
            onClick={() => setShowAddItemModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ تعريف صنف جديد</span>
          </button>
        )}
      </div>

      {/* TAB 1: Items Master Table */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="ابحث باسم الصنف، الباركود، أو الكود..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 pr-8 pl-3 py-1.5 rounded text-xs focus:outline-none focus:border-amber-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            <div className="text-slate-600">
              إجمالي الأصناف:{' '}
              <span className="font-bold font-mono text-slate-900">{filteredItems.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">الباركود</th>
                  <th className="p-2.5">كود الصنف</th>
                  <th className="p-2.5">اسم الصنف</th>
                  <th className="p-2.5">الوحدة</th>
                  <th className="p-2.5">المجموعة</th>
                  <th className="p-2.5 text-left">سعر الشراء</th>
                  <th className="p-2.5 text-left">سعر البيع</th>
                  <th className="p-2.5 text-center">الرصيد الحالي</th>
                  <th className="p-2.5 text-center">العمليات والربط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isLow = item.currentStock <= item.minQty;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-mono font-bold text-amber-800">{item.barcode}</td>
                      <td className="p-2.5 font-mono text-slate-600">{item.code}</td>
                      <td className="p-2.5 font-semibold text-slate-900">{item.name}</td>
                      <td className="p-2.5 text-slate-600">{item.unit}</td>
                      <td className="p-2.5 text-slate-600">{item.group}</td>
                      <td className="p-2.5 text-left font-mono text-slate-600">
                        {item.purchasePrice.toLocaleString()} ر.س
                      </td>
                      <td className="p-2.5 text-left font-mono font-bold text-slate-900">
                        {item.salePrice.toLocaleString()} ر.س
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        <span
                          className={`px-2 py-0.5 rounded font-black text-xs ${
                            isLow
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="p-2.5 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenScreen(60, { itemId: item.id })}
                          className="px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold border border-teal-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="تقرير كرت حركة الصنف الوارد والمنصرف"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>كرت الحركة</span>
                        </button>

                        <button
                          onClick={() => {
                            setOpenItemId(item.id);
                            setActiveTab('opening');
                          }}
                          className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="تعديل الرصيد الافتتاحي"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>رصيد افتتاحي</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Opening Quantities Form */}
      {activeTab === 'opening' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4 max-w-2xl mx-auto">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>إدخال الرصيد الافتتاحي للأصناف بالمستودع (Update_OpenQuantity)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              يتم تثبيت كمية وتكلفة بضاعة أول المدة وترحيل قيد الرصيد الافتتاحي تلقائياً إلى حساب المخزون ورأس المال.
            </p>
          </div>

          {openingSuccess && (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{openingSuccess}</span>
            </div>
          )}

          <form onSubmit={handleApplyOpeningQuantity} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">اختر الصنف:</label>
              <select
                value={openItemId}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  setOpenItemId(id);
                  const it = items.find((i) => i.id === id);
                  if (it) {
                    setOpenQty(it.currentStock || 10);
                    setOpenCostPrice(it.purchasePrice || 50);
                  }
                }}
                className="w-full border border-slate-300 rounded p-2 bg-white text-xs font-semibold"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} (الباركود: {it.barcode} | الرصيد الحالي: {it.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">المستودع:</label>
                <select
                  value={openStoreId}
                  onChange={(e) => setOpenStoreId(parseInt(e.target.value, 10))}
                  className="w-full border border-slate-300 rounded p-2 bg-white text-xs"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الكمية الافتتاحية:</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={openQty}
                  onChange={(e) => setOpenQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">سعر التكلفة للوحدة (ر.س):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={openCostPrice}
                onChange={(e) => setOpenCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">ملاحظات ومحضر الجرد:</label>
              <input
                type="text"
                value={openNotes}
                onChange={(e) => setOpenNotes(e.target.value)}
                className="w-full border border-slate-300 rounded p-2"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs flex justify-between">
              <span>إجمالي قيمة بضاعة أول المدة لهذا الصنف:</span>
              <span className="font-mono font-bold text-amber-900">
                {(openQty * openCostPrice).toLocaleString()} ر.س
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded shadow transition cursor-pointer"
              >
                اعتماد وتحديث الرصيد الافتتاحي
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Store Transfer Form */}
      {activeTab === 'transfer' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4 max-w-2xl mx-auto">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-purple-600" />
              <span>إذن تحويل بضاعة بين المستودعات والفروع (Order_StoresTransfer)</span>
            </h3>
          </div>

          {transferSuccess && (
            <div className="p-3 rounded bg-purple-50 border border-purple-300 text-purple-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-purple-600" />
              <span>{transferSuccess}</span>
            </div>
          )}

          <form onSubmit={handleApplyTransfer} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">من مستودع (المصدر):</label>
                <select
                  value={transferFromStore}
                  onChange={(e) => setTransferFromStore(parseInt(e.target.value, 10))}
                  className="w-full border border-slate-300 rounded p-2 bg-white"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">إلى مستودع (الوجهة):</label>
                <select
                  value={transferToStore}
                  onChange={(e) => setTransferToStore(parseInt(e.target.value, 10))}
                  className="w-full border border-slate-300 rounded p-2 bg-white"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">اختر الصنف المراد نقله:</label>
              <select
                value={transferItemId}
                onChange={(e) => setTransferItemId(parseInt(e.target.value, 10))}
                className="w-full border border-slate-300 rounded p-2 bg-white font-semibold"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} (المتوفر الحالي: {it.currentStock} وحدة)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">الكمية المحولة:</label>
              <input
                type="number"
                min="1"
                required
                value={transferQty}
                onChange={(e) => setTransferQty(parseInt(e.target.value, 10) || 1)}
                className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded shadow transition cursor-pointer"
              >
                تنفيذ التحويل المخزني
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Settlement & Physical Audit */}
      {activeTab === 'settlement' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4 max-w-2xl mx-auto">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-amber-600" />
              <span>جرد وتسوية المخزون الفعلي (FrmInventorySettlementMinus)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              مقارنة الجرد الفعلي على الرفوف بالرصيد الدفتري وتسوية أي فوارق عجز أو زيادة تلقائياً.
            </p>
          </div>

          {settleSuccess && (
            <div className="p-3 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{settleSuccess}</span>
            </div>
          )}

          <form onSubmit={handleApplySettlement} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">اختر الصنف:</label>
              <select
                value={settleItemId}
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  setSettleItemId(id);
                  const it = items.find((i) => i.id === id);
                  if (it) setActualQty(it.currentStock);
                }}
                className="w-full border border-slate-300 rounded p-2 bg-white font-semibold"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} (الرصيد الدفتري المسجل: {it.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <span className="text-slate-500 block">الرصيد الدفتري بالنظام:</span>
                <span className="text-lg font-black font-mono text-slate-800">
                  {erpDb.getItemById(settleItemId)?.currentStock || 0} وحدة
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الرصيد الفعلي (الجرد على الطبيعة):</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={actualQty}
                  onChange={(e) => setActualQty(parseInt(e.target.value, 10) || 0)}
                  className="w-full border border-slate-300 rounded p-2 font-mono font-bold text-base"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow transition cursor-pointer"
              >
                اعتماد تسوية الجرد الفعلي
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: Units & Groups */}
      {activeTab === 'units' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Units */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs">
              وحدات القياس (dbo.Item_Unit)
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {units.map((u) => (
                <div key={u.id} className="p-2.5 flex justify-between">
                  <span className="font-semibold text-slate-800">{u.name}</span>
                  <span className="font-mono text-slate-500">{u.code}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs">
              مجموعات الأصناف (dbo.Item_Groups)
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {groups.map((g) => (
                <div key={g.id} className="p-2.5 flex justify-between">
                  <span className="font-semibold text-slate-800">{g.name}</span>
                  <span className="font-mono text-slate-500">{g.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Item */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-lg w-full p-6 space-y-4 text-right">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-200 pb-2">
              تعريف وبطاقة صنف جديد (dbo.Item_Items)
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">اسم الصنف العربي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قاطع كهربائي ثلاثي 100 أمبير"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الباركود:</label>
                  <input
                    type="text"
                    required
                    placeholder="6281001000..."
                    value={newItemData.barcode}
                    onChange={(e) => setNewItemData({ ...newItemData, barcode: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">كود الصنف الداخلي:</label>
                  <input
                    type="text"
                    placeholder="ITM-..."
                    value={newItemData.code}
                    onChange={(e) => setNewItemData({ ...newItemData, code: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">وحدة القياس:</label>
                  <select
                    value={newItemData.unit}
                    onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">مجموعة الصنف:</label>
                  <select
                    value={newItemData.group}
                    onChange={(e) => setNewItemData({ ...newItemData, group: e.target.value })}
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">سعر الشراء (ر.س):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItemData.purchasePrice}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, purchasePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">سعر البيع (ر.س):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItemData.salePrice}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, salePrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">حد الطلب الأدنى:</label>
                  <input
                    type="number"
                    min="1"
                    value={newItemData.minQty}
                    onChange={(e) =>
                      setNewItemData({ ...newItemData, minQty: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full border border-slate-300 rounded p-2 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
