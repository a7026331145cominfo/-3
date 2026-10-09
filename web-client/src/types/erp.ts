export type ModuleCategory =
  | 'الرئيسية'
  | 'المحاسبة'
  | 'السندات'
  | 'المبيعات'
  | 'المشتريات'
  | 'المخزون والأصناف'
  | 'العملاء والموردون'
  | 'المراكز والعمليات'
  | 'التقارير'
  | 'الأمان والصلاحيات'
  | 'ربط وتشغيل النظام';

export interface UserSession {
  userId: number;
  userName: string;
  fullName: string;
  groupId: number;
  groupName: string;
  branchId: number;
  branchName: string;
}

export interface ScreenDefinition {
  id: number;
  name: string;
  screenNum: number;
  category: ModuleCategory;
  legacyName?: string;
  primaryProcedure?: string;
  targetTable?: string;
  iconName?: string;
  description?: string;
  allowBranch?: boolean;
  allowEnter?: boolean;
  allowSave?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowPrint?: boolean;
  allowExport?: boolean;
}

export interface OpenTab {
  id: string; // unique tab instance key
  screenId: number;
  title: string;
  category: ModuleCategory;
  params?: Record<string, any>; // parameters for cross-screen linking (e.g. accountId, orderId, itemBarcode)
}

export interface Account {
  id: number;
  code: string;
  name: string;
  type: 'رئيسي' | 'فرعي';
  nature: 'مدين' | 'دائن';
  parentCode?: string;
  balance: number;
  currency: string;
  level: number;
}

export interface CustomerSupplier {
  id: number;
  type: 'customer' | 'supplier';
  code: string;
  name: string;
  phone: string;
  vatNumber: string;
  address: string;
  creditLimit: number;
  currentBalance: number;
}

export interface ItemUnit {
  id: number;
  code: string;
  name: string;
}

export interface ItemGroup {
  id: number;
  code: string;
  name: string;
}

export interface ItemClass {
  id: number;
  code: string;
  name: string;
}

export interface Item {
  id: number;
  barcode: string;
  code: string;
  name: string;
  unit: string;
  group: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  minQty: number;
  currentStock: number;
  storeId: number;
}

export interface InvoiceItemRow {
  id: string;
  itemId: number;
  barcode: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  discountPercent: number;
  taxPercent: number; // usually 15%
  total: number;
}

export interface SalesInvoice {
  id: number;
  invoiceNo: string;
  date: string;
  customerId: number;
  customerName: string;
  paymentType: 'نقدي' | 'آجل' | 'شبكة (مدى)';
  storeId: number;
  storeName: string;
  items: InvoiceItemRow[];
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes: string;
  createdUser: string;
  status: 'معتمد' | 'مسودة' | 'ملغي';
}

export interface PurchaseInvoice {
  id: number;
  invoiceNo: string;
  date: string;
  supplierId: number;
  supplierName: string;
  billRefNo: string;
  paymentType: 'نقدي' | 'آجل' | 'تحويل بنكي';
  storeId: number;
  storeName: string;
  items: InvoiceItemRow[];
  subTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes: string;
  createdUser: string;
  status: 'معتمد' | 'مسودة';
}

export interface FinancialVoucher {
  id: number;
  voucherNo: string;
  kind: 'receipt' | 'payment'; // سند قبض أو سند صرف
  date: string;
  partyType: 'customer' | 'supplier' | 'account';
  partyId: number;
  partyName: string;
  amount: number;
  paymentMethod: 'نقدي (صندوق)' | 'شيك مصرفي' | 'تحويل بنكي';
  cashAccountId: number;
  costCenterId: number;
  statement: string;
  checkNo?: string;
  checkBank?: string;
  checkDueDate?: string;
  createdUser: string;
}

export interface JournalEntryLine {
  id: string;
  accountId: number;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  costCenter?: string;
  note: string;
}

export interface JournalEntry {
  id: number;
  entryNo: string;
  date: string;
  sourceDoc: string; // e.g. "فاتورة مبيعات رقم INV-2026-001" or "سند قبض REC-1002"
  refNo: string;
  statement: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  branchId: number;
  createdUser: string;
}

export interface Store {
  id: number;
  code: string;
  name: string;
  branchId: number;
}

export interface Branch {
  id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
}

export interface CostCenter {
  id: number;
  code: string;
  name: string;
  branchId: number;
}

export interface Contract {
  id: number;
  contractNo: string;
  customerId: number;
  customerName: string;
  title: string;
  startDate: string;
  endDate: string;
  totalValue: number;
  status: 'ساري' | 'منتهي' | 'معلق';
  notes: string;
}

export interface Employee {
  id: number;
  code: string;
  name: string;
  jobTitle: string;
  department: string;
  phone: string;
  basicSalary: number;
  allowances: number;
  hireDate: string;
  branchId: number;
}

export interface CheckItem {
  id: number;
  checkNo: string;
  bankName: string;
  dueDate: string;
  amount: number;
  partyName: string;
  type: 'وارد (قبض)' | 'صادر (صرف)';
  status: 'تحت التحصيل' | 'تم التحصيل' | 'مرتجع';
}

export interface TableInventoryItem {
  schema: string;
  table: string;
  module: string;
  columnsCount: number;
  approxRows: number;
}

export interface ProcedureInventoryItem {
  name: string;
  module: string;
  description: string;
  paramCount: number;
}
