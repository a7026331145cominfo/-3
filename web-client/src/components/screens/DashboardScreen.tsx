import React from 'react';
import {
  ShoppingCart,
  RotateCcw,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  ArrowLeftRight,
  Users,
  Building2,
  FileSpreadsheet,
  FolderTree,
  BookOpen,
  Scale,
  Percent,
  Calendar,
  UserCheck2,
  Shield,
  Settings,
  Workflow,
  Sparkles,
  TrendingUp,
  CreditCard,
  Crown
} from 'lucide-react';
import { erpDb } from '../../services/erpDatabase';

interface DashboardScreenProps {
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onOpenScreen }) => {
  const salesInvoices = erpDb.getSalesInvoices();
  const purchaseInvoices = erpDb.getPurchaseInvoices();
  const vouchers = erpDb.getVouchers();
  const items = erpDb.getItems();
  const accounts = erpDb.getAccounts();
  const customers = erpDb.getCustSup().filter((c) => c.type === 'customer');
  const suppliers = erpDb.getCustSup().filter((c) => c.type === 'supplier');
  const journalEntries = erpDb.getJournalEntries();
  const user = erpDb.getUser();

  const totalSales = salesInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const totalPurchases = purchaseInvoices.reduce((s, i) => s + i.grandTotal, 0);
  const receiptsTotal = vouchers
    .filter((v) => v.kind === 'receipt')
    .reduce((s, v) => s + v.amount, 0);
  const paymentsTotal = vouchers
    .filter((v) => v.kind === 'payment')
    .reduce((s, v) => s + v.amount, 0);

  return (
    <div className="space-y-6 text-right select-none pb-8">
      {/* Royal Luxury Header Banner */}
      <div className="relative overflow-hidden rounded-xl border-2 border-amber-500/40 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-6 shadow-xl">
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-amber-300 tracking-wide flex items-center gap-2">
                  <span>الصقر ERP — الشاشة الملكية الرئيسية (FrmPremium)</span>
                </h1>
                <p className="text-xs text-slate-300">
                  لوحة تحكم DevExpress الملكية لإدارة كافة العمليات والشاشات المترابطة بقاعدة GTSdb2026
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-amber-500/30 px-4 py-2.5 rounded-xl text-xs">
            <div className="text-right">
              <span className="text-[10px] text-amber-300/80 block">المستخدم المصرح:</span>
              <span className="font-bold text-white">{user.fullName}</span>
            </div>
            <div className="h-7 w-px bg-slate-700"></div>
            <div className="text-right">
              <span className="text-[10px] text-amber-300/80 block">قاعدة البيانات:</span>
              <span className="font-mono text-emerald-400 font-bold">dboGTSdb2026 (ONLINE)</span>
            </div>
          </div>
        </div>

        {/* Live Top Financial Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-blue-900/40 border border-blue-700/50 p-2.5 rounded-lg">
            <span className="text-[11px] text-blue-200 block">إجمالي المبيعات</span>
            <span className="text-base font-black font-mono text-amber-300">
              {totalSales.toLocaleString()} ر.س
            </span>
          </div>
          <div className="bg-emerald-900/40 border border-emerald-700/50 p-2.5 rounded-lg">
            <span className="text-[11px] text-emerald-200 block">إجمالي المشتريات</span>
            <span className="text-base font-black font-mono text-emerald-300">
              {totalPurchases.toLocaleString()} ر.س
            </span>
          </div>
          <div className="bg-teal-900/40 border border-teal-700/50 p-2.5 rounded-lg">
            <span className="text-[11px] text-teal-200 block">المقبوضات النقدية</span>
            <span className="text-base font-black font-mono text-teal-300">
              {receiptsTotal.toLocaleString()} ر.س
            </span>
          </div>
          <div className="bg-rose-900/40 border border-rose-700/50 p-2.5 rounded-lg">
            <span className="text-[11px] text-rose-200 block">المدفوعات والمصروفات</span>
            <span className="text-base font-black font-mono text-rose-300">
              {paymentsTotal.toLocaleString()} ر.س
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          1. مجموعة المبيعات والعملاء (Sales & Customers Tiles)
         ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-950 border-r-4 border-amber-500 pr-2">
          <span>المبيعات ونقاط البيع والعملاء</span>
          <span className="text-[11px] font-normal text-slate-500">
            (شاشات الفواتير، الكاشير، المردودات، والعملاء)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* TileOrder */}
          <div
            onClick={() => onOpenScreen(59)}
            className="group relative bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 hover:from-blue-600 hover:to-blue-900 text-white p-4 rounded-xl border border-blue-500/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-900/60 border border-blue-400/40 flex items-center justify-center text-amber-300 shadow">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-950/80 text-[10px] text-amber-300 font-mono border border-blue-400/30">
                FrmCashir #59
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              فاتورة مبيعات ونقطة بيع
            </div>
            <div className="text-[11px] text-blue-200 mt-1">
              {salesInvoices.length} فواتير مسجلة | إصدار فوري ZATCA
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>فتح الشاشة الملكية</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* TileOrderReturn */}
          <div
            onClick={() => onOpenScreen(14)}
            className="group relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 hover:from-indigo-600 hover:to-indigo-900 text-white p-4 rounded-xl border border-indigo-500/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-indigo-900/60 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow">
                <RotateCcw className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-[10px] text-amber-300 font-mono border border-indigo-400/30">
                FrmOrderReturn #14
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              مردودات المبيعات
            </div>
            <div className="text-[11px] text-indigo-200 mt-1">
              إرجاع بضائع وتعديل حساب العميل والمخزن
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>فتح الشاشة</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* TilCustomer */}
          <div
            onClick={() => onOpenScreen(23)}
            className="group relative bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 hover:from-slate-700 hover:to-slate-900 text-white p-4 rounded-xl border border-slate-700 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-slate-600 flex items-center justify-center text-amber-300 shadow">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-slate-700">
                FrmReservation #23
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              دليل وبطاقات العملاء
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              {customers.length} عملاء معتمدين | الحدود الائتمانية
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>دليل العملاء</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* TileReceipt */}
          <div
            onClick={() => onOpenScreen(31)}
            className="group relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 hover:from-emerald-600 hover:to-emerald-900 text-white p-4 rounded-xl border border-emerald-500/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-900/60 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-[10px] text-amber-300 font-mono border border-emerald-400/30">
                FrmReceipts #31
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              سند قبض نقدي / بنكي
            </div>
            <div className="text-[11px] text-emerald-200 mt-1">
              {receiptsTotal.toLocaleString()} ر.س مقبوضات مسجلة
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>تحصيل نقدي</span>
              <span className="mr-auto">←</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. مجموعة المشتريات والموردين (Purchases & Suppliers Tiles)
         ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-950 border-r-4 border-amber-500 pr-2">
          <span>المشتريات والموردين</span>
          <span className="text-[11px] font-normal text-slate-500">
            (فواتير الشراء، التوريدات، وسندات الصرف)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* TilPurches */}
          <div
            onClick={() => onOpenScreen(15)}
            className="group relative bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 hover:from-teal-600 hover:to-teal-900 text-white p-4 rounded-xl border border-teal-500/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-teal-900/60 border border-teal-400/40 flex items-center justify-center text-amber-300 shadow">
                <Truck className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-950/80 text-[10px] text-amber-300 font-mono border border-teal-400/30">
                FrmPurchases #15
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              فاتورة مشتريات بضاعة
            </div>
            <div className="text-[11px] text-teal-200 mt-1">
              {purchaseInvoices.length} فواتير شراء | توريد مستودعي
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>تسجيل مشتريات</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* TilSupplier */}
          <div
            onClick={() => onOpenScreen(24)}
            className="group relative bg-gradient-to-br from-cyan-800 via-slate-800 to-slate-900 hover:from-cyan-700 hover:to-slate-800 text-white p-4 rounded-xl border border-cyan-700/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-cyan-500/40 flex items-center justify-center text-amber-300 shadow">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-cyan-600/30">
                FrmSuppliers #24
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              دليل وبطاقات الموردين
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              {suppliers.length} موردين معتمدين | حسابات التوريد
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>دليل الموردين</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* TilePayment */}
          <div
            onClick={() => onOpenScreen(32)}
            className="group relative bg-gradient-to-br from-rose-700 via-rose-800 to-rose-950 hover:from-rose-600 hover:to-rose-900 text-white p-4 rounded-xl border border-rose-500/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-rose-900/60 border border-rose-400/40 flex items-center justify-center text-amber-300 shadow">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950/80 text-[10px] text-amber-300 font-mono border border-rose-400/30">
                FrmPayment #32
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              سند صرف نقدي / بنكي
            </div>
            <div className="text-[11px] text-rose-200 mt-1">
              {paymentsTotal.toLocaleString()} ر.س مدفوعات مسجلة
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>صرف مدفوعات</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* Cheques */}
          <div
            onClick={() => onOpenScreen(123)}
            className="group relative bg-gradient-to-br from-sky-800 via-sky-900 to-slate-900 hover:from-sky-700 hover:to-slate-800 text-white p-4 rounded-xl border border-sky-600/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-sky-400/40 flex items-center justify-center text-amber-300 shadow">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-sky-600/30">
                FrmCheckCollection #123
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              حافظة الشيكات البنكية
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              شيكات تحت التحصيل، الصادرة والواردة
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>إدارة الشيكات</span>
              <span className="mr-auto">←</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. مجموعة المحاسبة والأستاذ (Accounting & Ledger Tiles)
         ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-950 border-r-4 border-amber-500 pr-2">
          <span>المحاسبة العامة ودفتر الأستاذ والقوائم المالية</span>
          <span className="text-[11px] font-normal text-slate-500">
            (شجرة الحسابات، قيود اليومية، كشف الحساب، وميزان المراجعة)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* BtnAccTreeAccount */}
          <div
            onClick={() => onOpenScreen(30)}
            className="group relative bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 hover:from-emerald-700 hover:to-slate-800 text-white p-4 rounded-xl border border-emerald-600/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow">
                <FolderTree className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-emerald-600/30">
                FrmOpenAccount #30
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              دليل شجرة الحسابات
            </div>
            <div className="text-[11px] text-emerald-200 mt-1">
              {accounts.length} حسابات رئيسية وفرعية
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>استعراض الشجرة</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* TilAccountQuid */}
          <div
            onClick={() => onOpenScreen(36)}
            className="group relative bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-900 hover:from-blue-700 hover:to-slate-800 text-white p-4 rounded-xl border border-indigo-600/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-indigo-400/40 flex items-center justify-center text-amber-300 shadow">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-indigo-600/30">
                FrmDailyRestrictions #36
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              القيود اليومية المحاسبية
            </div>
            <div className="text-[11px] text-indigo-200 mt-1">
              {journalEntries.length} قيود مرحلة آلياً (Tran_Tran)
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>دفتر اليومية</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* BtnAccCardAccount (Ledger) */}
          <div
            onClick={() => onOpenScreen(43)}
            className="group relative bg-gradient-to-br from-amber-800 via-amber-900 to-slate-950 hover:from-amber-700 hover:to-slate-900 text-white p-4 rounded-xl border border-amber-600/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-amber-600/30">
                FrmRPLeadger #43
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              دفتر الأستاذ (كشف حساب)
            </div>
            <div className="text-[11px] text-amber-200 mt-1">
              كشف تفصيلي بالأرصدة والحركات التراكمية
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>كشف الحساب</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* BtnReportMizan */}
          <div
            onClick={() => onOpenScreen(45)}
            className="group relative bg-gradient-to-br from-purple-800 via-purple-900 to-slate-950 hover:from-purple-700 hover:to-slate-900 text-white p-4 rounded-xl border border-purple-600/50 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-purple-400/40 flex items-center justify-center text-amber-300 shadow">
                <Scale className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-purple-600/30">
                FrmRPMizaniyah #45
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              ميزان المراجعة والأرباح
            </div>
            <div className="text-[11px] text-purple-200 mt-1">
              ميزان الأرصدة والمجاميع، وقائمة الدخل
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>ميزان المراجعة</span>
              <span className="mr-auto">←</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. مجموعة المخزون والأصناف (Inventory & Stock Tiles)
         ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-950 border-r-4 border-amber-500 pr-2">
          <span>المخزون والمستودعات والأصناف</span>
          <span className="text-[11px] font-normal text-slate-500">
            (بطاقة الصنف، الأرصدة الافتتاحية، التحويلات، والجرد)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* TilItems */}
          <div
            onClick={() => onOpenScreen(8)}
            className="group relative bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 hover:from-blue-800 hover:to-slate-900 text-white p-4 rounded-xl border border-blue-500/40 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-blue-400/40 flex items-center justify-center text-amber-300 shadow">
                <Package className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-blue-600/30">
                FrmItems #8
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              بطاقة الصنف ودليل المواد
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              {items.length} أصناف مسجلة بالباركود والأسعار
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>دليل الأصناف</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* Open Quantity */}
          <div
            onClick={() => onOpenScreen(18)}
            className="group relative bg-gradient-to-br from-emerald-800 via-slate-900 to-slate-950 hover:from-emerald-700 hover:to-slate-900 text-white p-4 rounded-xl border border-emerald-600/40 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-emerald-400/40 flex items-center justify-center text-amber-300 shadow">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-emerald-600/30">
                FrmOpenQuantity #18
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              الكميات والأرصدة الافتتاحية
            </div>
            <div className="text-[11px] text-emerald-200 mt-1">
              تأسيس كميات أول المدة للمستودعات
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>تعديل الأرصدة</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* TilStoresTransfer */}
          <div
            onClick={() => onOpenScreen(25)}
            className="group relative bg-gradient-to-br from-purple-900 via-slate-900 to-slate-950 hover:from-purple-800 hover:to-slate-900 text-white p-4 rounded-xl border border-purple-600/40 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-900/80 border border-purple-400/40 flex items-center justify-center text-amber-300 shadow">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 font-mono border border-purple-600/30">
                FrmStoresTransfer #25
              </span>
            </div>
            <div className="font-black text-sm text-white group-hover:text-amber-200 transition">
              التحويل بين المستودعات
            </div>
            <div className="text-[11px] text-purple-200 mt-1">
              مناقلات الأصناف بين الفروع والمخازن
            </div>
            <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1">
              <span>إذن تحويل</span>
              <span className="mr-auto">←</span>
            </div>
          </div>

          {/* Full System Link */}
          <div
            onClick={() => onOpenScreen(999)}
            className="group relative bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 hover:from-amber-500 hover:to-amber-800 text-slate-950 p-4 rounded-xl border-2 border-amber-400 shadow-lg hover:shadow-2xl transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-black shadow-md">
                <Workflow className="w-7 h-7" />
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-amber-300 font-bold font-mono">
                FullSystemLink #999
              </span>
            </div>
            <div className="font-black text-sm text-slate-950">
              ربط وتشغيل النظام بالكامل
            </div>
            <div className="text-[11px] text-amber-950 font-bold mt-1">
              180 جدول قاعدة بيانات + 369 شاشة
            </div>
            <div className="mt-3 text-[10px] text-slate-950 font-black flex items-center gap-1">
              <span>مستكشف النظام والجداول</span>
              <span className="mr-auto">←</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
