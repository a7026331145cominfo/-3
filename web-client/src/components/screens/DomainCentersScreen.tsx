import React, { useState } from 'react';
import {
  Target,
  Building2,
  FileSignature,
  Briefcase,
  Utensils,
  Wrench,
  Search,
  Plus,
  CheckCircle2
} from 'lucide-react';
import { erpDb } from '../../services/erpDatabase';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface DomainCentersProps {
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

export const DomainCentersScreen: React.FC<DomainCentersProps> = ({ onOpenScreen }) => {
  const [activeTab, setActiveTab] = useState<'cost' | 'branches' | 'contracts' | 'hr' | 'restaurant' | 'manufacturing'>('cost');
  const costCenters = erpDb.getCostCenters();
  const branches = erpDb.getBranches();
  const stores = erpDb.getStores();
  const contracts = erpDb.getContracts();
  const employees = erpDb.getEmployees();

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="مراكز التكلفة والقطاعات والتشغيل"
        screenId={activeTab === 'cost' ? 2 : activeTab === 'branches' ? 4 : activeTab === 'contracts' ? 98 : activeTab === 'hr' ? 76 : activeTab === 'restaurant' ? 58 : 118}
        category="المراكز والقطاعات المتخصصة"
        icon={<Target className="w-4 h-4 text-white" />}
        description="مراكز التكلفة التحليلية، الفروع والمستودعات، العقود والتأجير، الموارد البشرية، وشاشات المطاعم والتصنيع"
        onOpenScreen={onOpenScreen}
      />

      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('cost')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cost'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>مراكز التكلفة ({costCenters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'branches'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>الفروع والمستودعات</span>
          </button>

          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'contracts'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>العقود والاتفاقيات ({contracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hr')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'hr'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>الموظفون والرواتب ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurant')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'restaurant'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>قطاع المطاعم والطاولات</span>
          </button>

          <button
            onClick={() => setActiveTab('manufacturing')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'manufacturing'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>أوامر التصنيع والإنتاج</span>
          </button>
        </div>
      </div>

      {/* TAB: Cost Centers */}
      {activeTab === 'cost' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs flex justify-between">
            <span>مراكز التكلفة والمشاريع (dbo.Account_CostCenters)</span>
            <span className="text-slate-500">{costCenters.length} مراكز معتمدة</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">كود المركز</th>
                  <th className="p-2.5">اسم مركز التكلفة</th>
                  <th className="p-2.5">الفرع المرتبط</th>
                  <th className="p-2.5 text-center">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {costCenters.map((cc) => (
                  <tr key={cc.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-indigo-700">{cc.code}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{cc.name}</td>
                    <td className="p-2.5 text-slate-600">الفرع #{cc.branchId}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                        نشط ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Branches & Stores */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs">
              الفروع التشغيلية (dbo.Account_Branch)
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {branches.map((b) => (
                <div key={b.id} className="p-3 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{b.name}</span>
                    <span className="font-mono text-slate-500">كود: {b.code}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">العنوان: {b.address} | الهاتف: {b.phone}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs">
              المستودعات والمخازن (dbo.Account_Stores)
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {stores.map((s) => (
                <div key={s.id} className="p-3 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-[11px] text-slate-500">تابع للفرع #{s.branchId}</span>
                  </div>
                  <span className="font-mono text-slate-600 font-semibold">{s.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Contracts */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs">
            سجل العقود والاتفاقيات والتأجير (dbo.Contract_Contract)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم العقد</th>
                  <th className="p-2.5">عنوان العقد</th>
                  <th className="p-2.5">العميل</th>
                  <th className="p-2.5">تاريخ البداية</th>
                  <th className="p-2.5">تاريخ الانتهاء</th>
                  <th className="p-2.5 text-left">قيمة العقد</th>
                  <th className="p-2.5 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-blue-700">{c.contractNo}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{c.title}</td>
                    <td className="p-2.5 text-slate-800">{c.customerName}</td>
                    <td className="p-2.5 font-mono text-slate-600">{c.startDate}</td>
                    <td className="p-2.5 font-mono text-slate-600">{c.endDate}</td>
                    <td className="p-2.5 text-left font-mono font-bold text-slate-900">
                      {c.totalValue.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: HR & Payroll */}
      {activeTab === 'hr' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs">
            سجلات الموظفين والرواتب (dbo.Emp_Employee)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">الرقم الوظيفي</th>
                  <th className="p-2.5">اسم الموظف</th>
                  <th className="p-2.5">المسمى الوظيفي</th>
                  <th className="p-2.5">القسم</th>
                  <th className="p-2.5 text-left">الراتب الأساسي</th>
                  <th className="p-2.5 text-left">البدلات</th>
                  <th className="p-2.5 text-left">إجمالي الراتب</th>
                  <th className="p-2.5">تاريخ التعيين</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono font-bold text-emerald-800">{e.code}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{e.name}</td>
                    <td className="p-2.5 text-slate-700">{e.jobTitle}</td>
                    <td className="p-2.5 text-slate-600">{e.department}</td>
                    <td className="p-2.5 text-left font-mono text-slate-700">
                      {e.basicSalary.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-left font-mono text-slate-700">
                      {e.allowances.toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 text-left font-mono font-bold text-slate-900">
                      {(e.basicSalary + e.allowances).toLocaleString()} ر.س
                    </td>
                    <td className="p-2.5 font-mono text-slate-500">{e.hireDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Restaurant */}
      {activeTab === 'restaurant' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">
              شاشة نقاط بيع المطاعم وإدارة الطاولات (Restaurant_Tables / Restaurant_Orders)
            </h3>
            <span className="text-xs text-slate-500">16 طاولة مجهزة</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((t) => (
              <div
                key={t}
                onClick={() => onOpenScreen(59)}
                className={`p-4 rounded-lg border text-center transition cursor-pointer ${
                  t % 2 === 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="text-xl mb-1">🍽️</div>
                <div className="font-bold text-xs">طاولة رقم {t}</div>
                <div className="text-[10px] mt-1 font-semibold">
                  {t % 2 === 0 ? 'مشغولة - طلب نشط' : 'فارغة - متاحة'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: Manufacturing */}
      {activeTab === 'manufacturing' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-bold text-sm text-slate-900">
              أوامر التصنيع وتكاليف خطوط الإنتاج (OrderManufacturing)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              صرف المواد الخام من المستودع وتجميعها في منتج تام الصنع واحتساب التكلفة الإجمالية.
            </p>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">أمر تشغيل رقم MF-2026-001 (إنتاج لوحات تحكم)</span>
                <span className="text-slate-500">تاريخ البدء: 2026-10-01 | الحالة: جاري التنفيذ</span>
              </div>
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold">قيد التشغيل</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800 block">أمر تشغيل رقم MF-2026-002 (تجهيز كابلات معزولة)</span>
                <span className="text-slate-500">تاريخ البدء: 2026-09-25 | الحالة: مكتمل ومعتمد بالمخزن</span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">مكتمل ومرحل ✓</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
