import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  Truck,
  Package,
  Layers,
  FileSpreadsheet,
  Users,
  Building2,
  FolderTree,
  Scale,
  TrendingUp,
  Percent,
  Activity,
  Workflow,
  RotateCcw,
  PlusCircle,
  ArrowLeftRight,
  ClipboardCheck,
  Target,
  FileSignature,
  Briefcase,
  Utensils,
  Wrench,
  UserCheck2,
  Shield,
  Key,
  CreditCard
} from 'lucide-react';
import { ModuleCategory } from '../../types/erp';

interface RibbonNavProps {
  activeCategory: ModuleCategory;
  onSelectCategory: (cat: ModuleCategory) => void;
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const RibbonNav: React.FC<RibbonNavProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenScreen,
}) => {
  const categories: { key: ModuleCategory; label: string; icon: string }[] = [
    { key: 'الرئيسية', label: 'الرئيسية الملكية (FrmPremium)', icon: '👑' },
    { key: 'المحاسبة', label: 'المحاسبة العامة', icon: '📊' },
    { key: 'السندات', label: 'السندات المالية', icon: '💵' },
    { key: 'المبيعات', label: 'المبيعات والعملاء', icon: '🛒' },
    { key: 'المشتريات', label: 'المشتريات والموردين', icon: '📦' },
    { key: 'المخزون والأصناف', label: 'المخزون والمستودعات', icon: '🏬' },
    { key: 'المراكز والعمليات', label: 'المراكز والقطاعات', icon: '🏢' },
    { key: 'التقارير', label: 'التقارير الشاملة', icon: '📈' },
    { key: 'الأمان والصلاحيات', label: 'الأمان والصلاحيات', icon: '🛡️' },
    { key: 'ربط وتشغيل النظام', label: 'ربط وتشغيل النظام (GTS)', icon: '⚡' },
  ];

  // Specific buttons for each active category ribbon
  const renderRibbonActions = () => {
    switch (activeCategory) {
      case 'الرئيسية':
        return (
          <>
            <button
              onClick={() => onOpenScreen(0)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <LayoutDashboard className="w-5 h-5 text-amber-600 mb-1" />
              <span>لوحة التحكم الرئيسية</span>
            </button>
            <div className="h-9 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => onOpenScreen(59)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <ShoppingCart className="w-5 h-5 text-blue-600 mb-1" />
              <span>فاتورة مبيعات جديدة</span>
            </button>
            <button
              onClick={() => onOpenScreen(31)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <ArrowDownLeft className="w-5 h-5 text-emerald-600 mb-1" />
              <span>سند قبض نقدي</span>
            </button>
            <button
              onClick={() => onOpenScreen(43)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <BookOpen className="w-5 h-5 text-indigo-600 mb-1" />
              <span>كشف حساب الأستاذ</span>
            </button>
            <button
              onClick={() => onOpenScreen(999)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Workflow className="w-5 h-5 text-amber-600 mb-1" />
              <span>مستكشف النظام والجداول</span>
            </button>
          </>
        );

      case 'المحاسبة':
        return (
          <>
            <button
              onClick={() => onOpenScreen(30)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <FolderTree className="w-5 h-5 text-teal-600 mb-1" />
              <span>دليل شجرة الحسابات</span>
            </button>
            <button
              onClick={() => onOpenScreen(36)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <FileSpreadsheet className="w-5 h-5 text-blue-600 mb-1" />
              <span>القيود اليومية المحاسبية</span>
            </button>
            <button
              onClick={() => onOpenScreen(43)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <BookOpen className="w-5 h-5 text-indigo-600 mb-1" />
              <span>دفتر الأستاذ (كشف حساب)</span>
            </button>
            <div className="h-9 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => onOpenScreen(45)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Scale className="w-5 h-5 text-emerald-600 mb-1" />
              <span>ميزان المراجعة</span>
            </button>
            <button
              onClick={() => onOpenScreen(88)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <TrendingUp className="w-5 h-5 text-amber-600 mb-1" />
              <span>قائمة الدخل والأرباح</span>
            </button>
          </>
        );

      case 'السندات':
        return (
          <>
            <button
              onClick={() => onOpenScreen(31)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <ArrowDownLeft className="w-5 h-5 text-emerald-600 mb-1" />
              <span>سند قبض نقدي / بنكي</span>
            </button>
            <button
              onClick={() => onOpenScreen(32)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <ArrowUpRight className="w-5 h-5 text-rose-600 mb-1" />
              <span>سند صرف نقدي / بنكي</span>
            </button>
            <div className="h-9 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => onOpenScreen(123)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <CreditCard className="w-5 h-5 text-sky-600 mb-1" />
              <span>إدارة الشيكات وأوراق القبض/الدفع</span>
            </button>
          </>
        );

      case 'المبيعات':
        return (
          <>
            <button
              onClick={() => onOpenScreen(59)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <ShoppingCart className="w-5 h-5 text-blue-600 mb-1" />
              <span>فاتورة مبيعات ونقطة بيع</span>
            </button>
            <button
              onClick={() => onOpenScreen(14)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <RotateCcw className="w-5 h-5 text-amber-600 mb-1" />
              <span>مردودات المبيعات</span>
            </button>
            <div className="h-9 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => onOpenScreen(23)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Users className="w-5 h-5 text-indigo-600 mb-1" />
              <span>بطاقة العميل والحسابات الجارية</span>
            </button>
            <button
              onClick={() => onOpenScreen(127)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Percent className="w-5 h-5 text-teal-600 mb-1" />
              <span>تقرير مبيعات المناديب</span>
            </button>
          </>
        );

      case 'المشتريات':
        return (
          <>
            <button
              onClick={() => onOpenScreen(15)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Truck className="w-5 h-5 text-emerald-600 mb-1" />
              <span>فاتورة مشتريات بضاعة</span>
            </button>
            <button
              onClick={() => onOpenScreen(49)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <RotateCcw className="w-5 h-5 text-rose-600 mb-1" />
              <span>مردودات المشتريات</span>
            </button>
            <div className="h-9 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => onOpenScreen(24)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Building2 className="w-5 h-5 text-cyan-600 mb-1" />
              <span>بطاقة المورد وحسابات التوريد</span>
            </button>
          </>
        );

      case 'المخزون والأصناف':
        return (
          <>
            <button
              onClick={() => onOpenScreen(8)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Package className="w-5 h-5 text-blue-600 mb-1" />
              <span>بطاقة الصنف ودليل المواد</span>
            </button>
            <button
              onClick={() => onOpenScreen(5)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Layers className="w-5 h-5 text-teal-600 mb-1" />
              <span>وحدات ومجموعات الأصناف</span>
            </button>
            <div className="h-9 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => onOpenScreen(18)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600 mb-1" />
              <span>الأرصدة والكميات الافتتاحية</span>
            </button>
            <button
              onClick={() => onOpenScreen(25)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <ArrowLeftRight className="w-5 h-5 text-purple-600 mb-1" />
              <span>التحويل بين المستودعات</span>
            </button>
            <button
              onClick={() => onOpenScreen(83)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <ClipboardCheck className="w-5 h-5 text-amber-600 mb-1" />
              <span>جرد وتسوية المخزون</span>
            </button>
          </>
        );

      case 'المراكز والعمليات':
        return (
          <>
            <button
              onClick={() => onOpenScreen(2)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Target className="w-5 h-5 text-indigo-600 mb-1" />
              <span>مراكز التكلفة والمشاريع</span>
            </button>
            <button
              onClick={() => onOpenScreen(98)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <FileSignature className="w-5 h-5 text-blue-600 mb-1" />
              <span>العقود والتأجير والضمانات</span>
            </button>
            <button
              onClick={() => onOpenScreen(76)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Briefcase className="w-5 h-5 text-emerald-600 mb-1" />
              <span>شؤون الموظفين والرواتب</span>
            </button>
            <div className="h-9 w-px bg-slate-300 mx-1"></div>
            <button
              onClick={() => onOpenScreen(58)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Utensils className="w-5 h-5 text-amber-600 mb-1" />
              <span>إدارة المطاعم والطاولات</span>
            </button>
            <button
              onClick={() => onOpenScreen(118)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Wrench className="w-5 h-5 text-rose-600 mb-1" />
              <span>أوامر التصنيع والإنتاج</span>
            </button>
          </>
        );

      case 'التقارير':
        return (
          <>
            <button
              onClick={() => onOpenScreen(50)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Percent className="w-5 h-5 text-emerald-600 mb-1" />
              <span>إقرار ضريبة القيمة المضافة (VAT)</span>
            </button>
            <button
              onClick={() => onOpenScreen(41)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Scale className="w-5 h-5 text-blue-600 mb-1" />
              <span>الحركات اليومية والصناديق</span>
            </button>
            <button
              onClick={() => onOpenScreen(60)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Activity className="w-5 h-5 text-teal-600 mb-1" />
              <span>كرت حركة صنف بالمستودعات</span>
            </button>
            <button
              onClick={() => onOpenScreen(43)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <BookOpen className="w-5 h-5 text-indigo-600 mb-1" />
              <span>كشف حساب تفصيلي</span>
            </button>
          </>
        );

      case 'الأمان والصلاحيات':
        return (
          <>
            <button
              onClick={() => onOpenScreen(1)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <UserCheck2 className="w-5 h-5 text-blue-600 mb-1" />
              <span>إدارة المستخدمين (User_Login)</span>
            </button>
            <button
              onClick={() => onOpenScreen(3)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Shield className="w-5 h-5 text-amber-600 mb-1" />
              <span>مجموعات الصلاحيات (User_Groups)</span>
            </button>
            <button
              onClick={() => onOpenScreen(104)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Key className="w-5 h-5 text-emerald-600 mb-1" />
              <span>مصفوفة الصلاحيات (User_Permission)</span>
            </button>
          </>
        );

      case 'ربط وتشغيل النظام':
        return (
          <>
            <button
              onClick={() => onOpenScreen(999)}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Workflow className="w-5 h-5 text-amber-600 mb-1" />
              <span>متصفح كافة الشاشات (369 شاشة)</span>
            </button>
            <button
              onClick={() => onOpenScreen(999, { tab: 'tables' })}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Layers className="w-5 h-5 text-blue-600 mb-1" />
              <span>جداول قاعدة البيانات (180 جدول)</span>
            </button>
            <button
              onClick={() => onOpenScreen(999, { tab: 'procedures' })}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded hover:bg-slate-200 text-slate-700 transition cursor-pointer text-xs"
            >
              <Activity className="w-5 h-5 text-teal-600 mb-1" />
              <span>الإجراءات المخزنة المعتمدة (Stored Procs)</span>
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-100 border-b border-slate-300 shadow-xs select-none">
      {/* Category Tabs */}
      <div className="flex items-center gap-1 px-3 pt-1 border-b border-slate-200 overflow-x-auto bg-slate-200/70">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-t transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-50 text-slate-900 border-t-2 border-amber-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Toolbar Ribbon for active category */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 min-h-[58px] overflow-x-auto">
        {renderRibbonActions()}
      </div>
    </div>
  );
};
