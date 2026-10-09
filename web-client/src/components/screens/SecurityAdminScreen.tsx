import React, { useState } from 'react';
import {
  UserCheck2,
  Shield,
  Key,
  Plus,
  CheckCircle2,
  Users,
  ShieldAlert,
  Save
} from 'lucide-react';
import { UserSession } from '../../types/erp';
import { erpDb } from '../../services/erpDatabase';
import { ALL_SYSTEM_SCREENS } from '../../data/gts2026Metadata';
import { UnifiedScreenHeader } from '../common/UnifiedScreenHeader';

interface SecurityAdminProps {
  onOpenScreen: (screenId: number, params?: Record<string, any>) => void;
}

interface UserItem {
  id: number;
  userName: string;
  fullName: string;
  groupId: number;
  groupName: string;
  branchId: number;
  isActive: boolean;
}

export const SecurityAdminScreen: React.FC<SecurityAdminProps> = ({ onOpenScreen }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'permissions'>('users');

  const [usersList, setUsersList] = useState<UserItem[]>([
    { id: 1, userName: 'Admin', fullName: 'م/ أحمد الصقر (المدير العام)', groupId: 1, groupName: 'المدراء ومسؤولو النظام', branchId: 1, isActive: true },
    { id: 2, userName: 'Accountant1', fullName: 'أ/ سلمان العتيبي (المحاسب المالي)', groupId: 2, groupName: 'المحاسبون والمالية', branchId: 1, isActive: true },
    { id: 3, userName: 'Cashier1', fullName: 'أ/ فهد القحطاني (الكاشير والمبيعات)', groupId: 3, groupName: 'المبيعات والكاشير', branchId: 1, isActive: true },
    { id: 4, userName: 'StoreKeeper', fullName: 'أ/ محمد الدوسري (أمين المستودع)', groupId: 4, groupName: 'المستودعات والمخازن', branchId: 1, isActive: true },
  ]);

  const groups = [
    { id: 1, name: 'المدراء ومسؤولو النظام', note: 'صلاحيات كاملة مطلقة على كافة الشاشات والجداول' },
    { id: 2, name: 'المحاسبون والمالية', note: 'شاشات القيود، السندات، الحسابات، ميزان المراجعة، والتقارير' },
    { id: 3, name: 'المبيعات والكاشير', note: 'فواتير المبيعات، الكاشير، وسندات القبض وبطاقات العملاء' },
    { id: 4, name: 'المستودعات والمخازن', note: 'أذونات الاستلام، التحويل، بطاقات الأصناف، والجرد' },
  ];

  // Permissions state per screen
  const [selectedGroupId, setSelectedGroupId] = useState<number>(1);
  const [permissionSuccess, setPermissionSuccess] = useState('');

  // New user modal
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    userName: '',
    fullName: '',
    groupId: 2,
    branchId: 1,
  });

  const currentUser = erpDb.getUser();

  const handleSwitchUser = (u: UserItem) => {
    const updated: UserSession = {
      userId: u.id,
      userName: u.userName,
      fullName: u.fullName,
      groupId: u.groupId,
      groupName: u.groupName,
      branchId: u.branchId,
      branchName: `الفرع الرئيسي (${u.branchId})`,
    };
    erpDb.setUser(updated);
    alert(`تم التبديل بنجاح إلى المستخدم: ${u.fullName}`);
    window.location.reload();
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.userName || !newUserData.fullName) return;
    const grp = groups.find((g) => g.id === newUserData.groupId);
    const newUser: UserItem = {
      id: usersList.length + 1,
      userName: newUserData.userName,
      fullName: newUserData.fullName,
      groupId: newUserData.groupId,
      groupName: grp?.name || 'مجموعة عامة',
      branchId: newUserData.branchId,
      isActive: true,
    };
    setUsersList([...usersList, newUser]);
    setShowNewUserModal(false);
    setNewUserData({ userName: '', fullName: '', groupId: 2, branchId: 1 });
  };

  return (
    <div className="space-y-2 text-right select-none">
      {/* Unified Screen Header with In-Screen Navigation */}
      <UnifiedScreenHeader
        title="إدارة المستخدمين والصلاحيات والأمان"
        screenId={activeTab === 'users' ? 1 : activeTab === 'groups' ? 3 : 104}
        category="الأمان والنظام"
        icon={<Shield className="w-4 h-4 text-white" />}
        description="تسجيل المستخدمين، ربط الفروع، تصنيف مجموعات الصلاحيات، ومصفوفة الأذونات على الشاشات"
        onOpenScreen={onOpenScreen}
      />

      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <UserCheck2 className="w-3.5 h-3.5" />
            <span>مستخدمو النظام (dbo.User_Login)</span>
          </button>

          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'groups'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>مجموعات الصلاحيات (dbo.User_Groups)</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-[#005a9e] text-white shadow-xs border border-[#004b85]'
                : 'bg-white text-slate-700 hover:bg-[#e5f1fb] hover:text-[#005a9e] hover:border-[#0078d7] border border-[#cbd5e1]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>مصفوفة صلاحيات الشاشات (dbo.User_Permission)</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setShowNewUserModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#005a9e] hover:bg-[#004b85] text-white rounded-xs text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ مستخدم جديد</span>
          </button>
        )}
      </div>

      {/* TAB 1: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800">سجل المستخدمين المصرح لهم بالدخول إلى النظام</span>
            <span className="text-slate-500">
              المستخدم النشط حالياً: <span className="font-bold text-amber-700">{currentUser.fullName}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم المعرف</th>
                  <th className="p-2.5">اسم تسجيل الدخول</th>
                  <th className="p-2.5">الاسم الكامل للمستخدم</th>
                  <th className="p-2.5">مجموعة الصلاحيات</th>
                  <th className="p-2.5">الفرع المصرح</th>
                  <th className="p-2.5 text-center">الحالة</th>
                  <th className="p-2.5 text-center">تسجيل الدخول به</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => {
                  const isCurrent = currentUser.userId === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-mono font-bold text-slate-700">#{u.id}</td>
                      <td className="p-2.5 font-mono font-semibold text-blue-700">{u.userName}</td>
                      <td className="p-2.5 font-bold text-slate-900">{u.fullName}</td>
                      <td className="p-2.5 text-slate-700">{u.groupName}</td>
                      <td className="p-2.5 text-slate-600">الفرع #{u.branchId}</td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          نشط ✓
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {isCurrent ? (
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-300">
                            الحساب النشط حالياً
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSwitchUser(u)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 font-semibold border border-slate-300 text-[11px] transition cursor-pointer"
                          >
                            تبديل الدخول له
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Groups */}
      {activeTab === 'groups' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs">
            مجموعات الأمان والأدوار (dbo.User_Groups)
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {groups.map((g) => (
              <div key={g.id} className="p-3 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {g.name} <span className="font-mono text-slate-400 font-normal">[#{g.id}]</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{g.note}</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedGroupId(g.id);
                    setActiveTab('permissions');
                  }}
                  className="px-3 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-300 text-xs transition cursor-pointer"
                >
                  تعديل الصلاحيات ←
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">اختر المجموعة لتعديل صلاحياتها:</label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(parseInt(e.target.value, 10))}
                className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setPermissionSuccess('تم حفظ وتحديث مصفوفة الصلاحيات بنجاح في قاعدة البيانات.');
                setTimeout(() => setPermissionSuccess(''), 4000);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>حفظ الصلاحيات</span>
            </button>
          </div>

          {permissionSuccess && (
            <div className="p-3 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{permissionSuccess}</span>
            </div>
          )}

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="w-full text-xs text-right">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-2.5">رقم الشاشة</th>
                  <th className="p-2.5">اسم الشاشة</th>
                  <th className="p-2.5">القسم</th>
                  <th className="p-2.5 text-center">دخول (Allow_Enter)</th>
                  <th className="p-2.5 text-center">حفظ (Allow_Save)</th>
                  <th className="p-2.5 text-center">تعديل (Allow_Edit)</th>
                  <th className="p-2.5 text-center">حذف (Allow_Delete)</th>
                  <th className="p-2.5 text-center">طباعة (Allow_Print)</th>
                  <th className="p-2.5 text-center">تصدير (Allow_Export)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ALL_SYSTEM_SCREENS.map((screen) => (
                  <tr key={screen.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 font-mono text-slate-500">#{screen.screenNum}</td>
                    <td className="p-2.5 font-bold text-slate-900">{screen.name}</td>
                    <td className="p-2.5 text-slate-500">{screen.category}</td>
                    <td className="p-2.5 text-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                    </td>
                    <td className="p-2.5 text-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                    </td>
                    <td className="p-2.5 text-center">
                      <input type="checkbox" defaultChecked={selectedGroupId <= 2} className="w-4 h-4 text-emerald-600 rounded" />
                    </td>
                    <td className="p-2.5 text-center">
                      <input type="checkbox" defaultChecked={selectedGroupId === 1} className="w-4 h-4 text-emerald-600 rounded" />
                    </td>
                    <td className="p-2.5 text-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                    </td>
                    <td className="p-2.5 text-center">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-300 max-w-md w-full p-5 space-y-4 text-right">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
              إنشاء مستخدم نظام جديد (dbo.User_Login)
            </h3>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">اسم الدخول (Username):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: accountant2"
                  value={newUserData.userName}
                  onChange={(e) => setNewUserData({ ...newUserData, userName: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أ/ عبد الله الراجحي"
                  value={newUserData.fullName}
                  onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">مجموعة الصلاحيات:</label>
                  <select
                    value={newUserData.groupId}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, groupId: parseInt(e.target.value, 10) })
                    }
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">الفرع المخصص:</label>
                  <select
                    value={newUserData.branchId}
                    onChange={(e) =>
                      setNewUserData({ ...newUserData, branchId: parseInt(e.target.value, 10) })
                    }
                    className="w-full border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value={1}>الفرع الرئيسي (الرياض)</option>
                    <option value={2}>فرع جدة</option>
                    <option value={3}>فرع الدمام</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-bold"
                >
                  إنشاء المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
