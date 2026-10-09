import {
  Account,
  CustomerSupplier,
  Item,
  ItemUnit,
  ItemGroup,
  ItemClass,
  Store,
  Branch,
  CostCenter,
  SalesInvoice,
  PurchaseInvoice,
  FinancialVoucher,
  JournalEntry,
  CheckItem,
  Contract,
  Employee,
  UserSession
} from '../types/erp';

export const INITIAL_USER: UserSession = {
  userId: 1,
  userName: 'Admin',
  fullName: 'م/ أحمد الصقر (المدير العام)',
  groupId: 1,
  groupName: 'المدراء ومسؤولو النظام',
  branchId: 1,
  branchName: 'الفرع الرئيسي - الرياض (1)',
};

export const INITIAL_BRANCHES: Branch[] = [
  { id: 1, code: '01', name: 'الفرع الرئيسي - الرياض', address: 'طريق الملك فهد، الرياض', phone: '011-4567890' },
  { id: 2, code: '02', name: 'فرع المنطقة الغربية - جدة', address: 'شارع التحلية، جدة', phone: '012-6543210' },
  { id: 3, code: '03', name: 'فرع المنطقة الشرقية - الدمام', address: 'طريق الأمير محمد بن فهد، الدمام', phone: '013-8765432' },
];

export const INITIAL_STORES: Store[] = [
  { id: 1, code: 'ST-01', name: 'مستودع البضاعة الرئيسي (الرياض)', branchId: 1 },
  { id: 2, code: 'ST-02', name: 'مستودع المعرض وصالة البيع', branchId: 1 },
  { id: 3, code: 'ST-03', name: 'مستودع فرع جدة المركزي', branchId: 2 },
  { id: 4, code: 'ST-04', name: 'مستودع المنطقة الشرقية', branchId: 3 },
];

export const INITIAL_COST_CENTERS: CostCenter[] = [
  { id: 1, code: 'CC-101', name: 'الإدارة العامة والمبيعات', branchId: 1 },
  { id: 2, code: 'CC-102', name: 'قسم التسويق والمعارض', branchId: 1 },
  { id: 3, code: 'CC-103', name: 'قسم الصيانة والدعم الفني', branchId: 1 },
  { id: 4, code: 'CC-201', name: 'تشغيل فرع جدة', branchId: 2 },
  { id: 5, code: 'CC-301', name: 'تشغيل فرع الشرقية', branchId: 3 },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 1, code: '1', name: 'الأصول', type: 'رئيسي', nature: 'مدين', balance: 485000, currency: 'SAR', level: 1 },
  { id: 2, code: '11', name: 'الأصول المتداولة', type: 'رئيسي', nature: 'مدين', parentCode: '1', balance: 345000, currency: 'SAR', level: 2 },
  { id: 3, code: '1101', name: 'الصندوق الرئيسي (الخزينة النقدية)', type: 'فرعي', nature: 'مدين', parentCode: '11', balance: 78500, currency: 'SAR', level: 3 },
  { id: 4, code: '1102', name: 'البنك الأهلي التجاري - الحساب الجاري', type: 'فرعي', nature: 'مدين', parentCode: '11', balance: 142000, currency: 'SAR', level: 3 },
  { id: 5, code: '1103', name: 'بنك الراجحي - حساب العمليات', type: 'فرعي', nature: 'مدين', parentCode: '11', balance: 64500, currency: 'SAR', level: 3 },
  { id: 6, code: '1104', name: 'العملاء والمدينون التجاريون', type: 'رئيسي', nature: 'مدين', parentCode: '11', balance: 60000, currency: 'SAR', level: 3 },
  { id: 7, code: '1105', name: 'مخزون البضاعة بالمستودعات', type: 'فرعي', nature: 'مدين', parentCode: '11', balance: 125000, currency: 'SAR', level: 3 },
  { id: 8, code: '12', name: 'الأصول غير المتداولة (الثابتة)', type: 'رئيسي', nature: 'مدين', parentCode: '1', balance: 140000, currency: 'SAR', level: 2 },
  { id: 9, code: '1201', name: 'السيارات ووسائل النقل', type: 'فرعي', nature: 'مدين', parentCode: '12', balance: 90000, currency: 'SAR', level: 3 },
  { id: 10, code: '1202', name: 'الأجهزة والمعدات المكتبية', type: 'فرعي', nature: 'مدين', parentCode: '12', balance: 50000, currency: 'SAR', level: 3 },

  { id: 11, code: '2', name: 'الخصوم والالتزامات', type: 'رئيسي', nature: 'دائن', balance: 98000, currency: 'SAR', level: 1 },
  { id: 12, code: '21', name: 'الالتزامات المتداولة', type: 'رئيسي', nature: 'دائن', parentCode: '2', balance: 98000, currency: 'SAR', level: 2 },
  { id: 13, code: '2101', name: 'الموردون والدائنون التجاريون', type: 'فرعي', nature: 'دائن', parentCode: '21', balance: 74000, currency: 'SAR', level: 3 },
  { id: 14, code: '2102', name: 'أمانات ضريبة القيمة المضافة المستحقة (VAT)', type: 'فرعي', nature: 'دائن', parentCode: '21', balance: 16500, currency: 'SAR', level: 3 },
  { id: 15, code: '2103', name: 'مصروفات مستحقة الدفع ورواتب', type: 'فرعي', nature: 'دائن', parentCode: '21', balance: 7500, currency: 'SAR', level: 3 },

  { id: 16, code: '3', name: 'حقوق الملكية ورأس المال', type: 'رئيسي', nature: 'دائن', balance: 350000, currency: 'SAR', level: 1 },
  { id: 17, code: '3101', name: 'رأس مال المؤسسة المدفوع', type: 'فرعي', nature: 'دائن', parentCode: '3', balance: 300000, currency: 'SAR', level: 2 },
  { id: 18, code: '3102', name: 'الأرباح والخسائر المدورة', type: 'فرعي', nature: 'دائن', parentCode: '3', balance: 50000, currency: 'SAR', level: 2 },

  { id: 19, code: '4', name: 'الإيرادات والمبيعات', type: 'رئيسي', nature: 'دائن', balance: 165000, currency: 'SAR', level: 1 },
  { id: 20, code: '4101', name: 'إيراد مبيعات بضاعة تجارية', type: 'فرعي', nature: 'دائن', parentCode: '4', balance: 152000, currency: 'SAR', level: 2 },
  { id: 21, code: '4102', name: 'إيرادات خدمات وصيانة', type: 'فرعي', nature: 'دائن', parentCode: '4', balance: 13000, currency: 'SAR', level: 2 },

  { id: 22, code: '5', name: 'المصروفات والتكاليف', type: 'رئيسي', nature: 'مدين', balance: 128000, currency: 'SAR', level: 1 },
  { id: 23, code: '5101', name: 'تكلفة البضاعة المباعة (المشتريات)', type: 'فرعي', nature: 'مدين', parentCode: '5', balance: 95000, currency: 'SAR', level: 2 },
  { id: 24, code: '5201', name: 'مصروف رواتب وأجور الموظفين', type: 'فرعي', nature: 'مدين', parentCode: '5', balance: 22000, currency: 'SAR', level: 2 },
  { id: 25, code: '5202', name: 'مصروف إيجار المعارض والمستودعات', type: 'فرعي', nature: 'مدين', parentCode: '5', balance: 8000, currency: 'SAR', level: 2 },
  { id: 26, code: '5203', name: 'مصروف كهرباء ومياه واتصالات', type: 'فرعي', nature: 'مدين', parentCode: '5', balance: 3000, currency: 'SAR', level: 2 },
];

export const INITIAL_CUSTOMERS_SUPPLIERS: CustomerSupplier[] = [
  // Customers
  { id: 101, type: 'customer', code: 'CUST-001', name: 'مؤسسة النور للتجارة والمقاولات', phone: '0501234567', vatNumber: '310234567800003', address: 'الرياض - حي الملز', creditLimit: 50000, currentBalance: 24500 },
  { id: 102, type: 'customer', code: 'CUST-002', name: 'شركة أفق البناء الحديث', phone: '0559876543', vatNumber: '310987654300003', address: 'جدة - حي الصفا', creditLimit: 100000, currentBalance: 35500 },
  { id: 103, type: 'customer', code: 'CUST-003', name: 'مجموعة الوفاق الهندسية', phone: '0533322114', vatNumber: '310554433200003', address: 'الدمام - الشاطئ', creditLimit: 40000, currentBalance: 0 },
  { id: 104, type: 'customer', code: 'CUST-000', name: 'العميل النقدي العام (مبيعات صالة)', phone: '0500000000', vatNumber: '', address: 'المبيعات النقدية المباشرة', creditLimit: 0, currentBalance: 0 },

  // Suppliers
  { id: 201, type: 'supplier', code: 'SUPP-001', name: 'شركة المواد الخام والتوريدات الدولية', phone: '0112345678', vatNumber: '300112233400003', address: 'الرياض - المدينة الصناعية الثانية', creditLimit: 150000, currentBalance: 46000 },
  { id: 202, type: 'supplier', code: 'SUPP-002', name: 'مصنع الخليج للتغليف والأدوات الصناعية', phone: '0138997766', vatNumber: '300998877600003', address: 'الجبيل الصناعية', creditLimit: 80000, currentBalance: 28000 },
  { id: 203, type: 'supplier', code: 'SUPP-003', name: 'مؤسسة التميز للتوريدات المكتبية والإلكترونية', phone: '0126778899', vatNumber: '300445566700003', address: 'جدة - شارع فلسطين', creditLimit: 30000, currentBalance: 0 },
];

export const INITIAL_UNITS: ItemUnit[] = [
  { id: 1, code: 'U-01', name: 'حبة / قطعة' },
  { id: 2, code: 'U-02', name: 'كرتون (12 حبة)' },
  { id: 3, code: 'U-03', name: 'طرد (24 حبة)' },
  { id: 4, code: 'U-04', name: 'متر طولي' },
  { id: 5, code: 'U-05', name: 'كيلوجرام' },
  { id: 6, code: 'U-06', name: 'طقم كامل' },
];

export const INITIAL_GROUPS: ItemGroup[] = [
  { id: 1, code: 'GRP-01', name: 'المواد الإنشائية والحديد' },
  { id: 2, code: 'GRP-02', name: 'الأدوات الكهربائية والإضاءة' },
  { id: 3, code: 'GRP-03', name: 'الأجهزة ومعدات التشغيل' },
  { id: 4, code: 'GRP-04', name: 'الدهانات والتشطيبات' },
  { id: 5, code: 'GRP-05', name: 'قطع الغيار ومستلزمات الصيانة' },
];

export const INITIAL_CLASSES: ItemClass[] = [
  { id: 1, code: 'CLS-01', name: 'صنف استراتيجي عالي الدوران' },
  { id: 2, code: 'CLS-02', name: 'صنف موسمي' },
  { id: 3, code: 'CLS-03', name: 'صنف خدمات وصيانة' },
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 1,
    barcode: '628100100001',
    code: 'ITM-1001',
    name: 'كيبل نحاسي 4 ملم معزول 100 متر',
    unit: 'كرتون (12 حبة)',
    group: 'الأدوات الكهربائية والإضاءة',
    category: 'صنف استراتيجي عالي الدوران',
    purchasePrice: 180,
    salePrice: 245,
    minQty: 10,
    currentStock: 48,
    storeId: 1
  },
  {
    id: 2,
    barcode: '628100100002',
    code: 'ITM-1002',
    name: 'مفتاح قاطع كهربائي ثلاثي 63 أمبير',
    unit: 'حبة / قطعة',
    group: 'الأدوات الكهربائية والإضاءة',
    category: 'صنف استراتيجي عالي الدوران',
    purchasePrice: 65,
    salePrice: 95,
    minQty: 20,
    currentStock: 85,
    storeId: 1
  },
  {
    id: 3,
    barcode: '628100100003',
    code: 'ITM-2001',
    name: 'حديد تسليح عالي المقاومة 12 ملم (طن)',
    unit: 'طرد (24 حبة)',
    group: 'المواد الإنشائية والحديد',
    category: 'صنف استراتيجي عالي الدوران',
    purchasePrice: 2350,
    salePrice: 2750,
    minQty: 5,
    currentStock: 14,
    storeId: 1
  },
  {
    id: 4,
    barcode: '628100100004',
    code: 'ITM-3001',
    name: 'كشاف إضاءة LED صناعي 150 واط مقاوم للمطر',
    unit: 'حبة / قطعة',
    group: 'الأدوات الكهربائية والإضاءة',
    category: 'صنف استراتيجي عالي الدوران',
    purchasePrice: 110,
    salePrice: 165,
    minQty: 15,
    currentStock: 62,
    storeId: 1
  },
  {
    id: 5,
    barcode: '628100100005',
    code: 'ITM-4001',
    name: 'دهان مقاوم للرطوبة والعوامل الجوية برميل 18 لتر',
    unit: 'حبة / قطعة',
    group: 'الدهانات والتشطيبات',
    category: 'صنف موسمي',
    purchasePrice: 140,
    salePrice: 195,
    minQty: 12,
    currentStock: 30,
    storeId: 1
  },
  {
    id: 6,
    barcode: '628100100006',
    code: 'ITM-5001',
    name: 'طقم مفكات ومعدات صيانة هيدروليكية احترافية',
    unit: 'طقم كامل',
    group: 'قطع الغيار ومستلزمات الصيانة',
    category: 'صنف استراتيجي عالي الدوران',
    purchasePrice: 280,
    salePrice: 390,
    minQty: 8,
    currentStock: 22,
    storeId: 2
  },
];

export const INITIAL_SALES_INVOICES: SalesInvoice[] = [
  {
    id: 1,
    invoiceNo: 'INV-2026-001',
    date: '2026-10-05',
    customerId: 101,
    customerName: 'مؤسسة النور للتجارة والمقاولات',
    paymentType: 'آجل',
    storeId: 1,
    storeName: 'مستودع البضاعة الرئيسي (الرياض)',
    items: [
      { id: '1', itemId: 1, barcode: '628100100001', name: 'كيبل نحاسي 4 ملم معزول 100 متر', unit: 'كرتون (12 حبة)', qty: 10, price: 245, discountPercent: 0, taxPercent: 15, total: 2817.5 },
      { id: '2', itemId: 2, barcode: '628100100002', name: 'مفتاح قاطع كهربائي ثلاثي 63 أمبير', unit: 'حبة / قطعة', qty: 20, price: 95, discountPercent: 5, taxPercent: 15, total: 2075.75 }
    ],
    subTotal: 4350,
    discountTotal: 95,
    taxTotal: 638.25,
    grandTotal: 4893.25,
    notes: 'توريد دفعة المشروع الشرقي - الدفع خلال 30 يوم',
    createdUser: 'Admin',
    status: 'معتمد'
  },
  {
    id: 2,
    invoiceNo: 'INV-2026-002',
    date: '2026-10-06',
    customerId: 104,
    customerName: 'العميل النقدي العام (مبيعات صالة)',
    paymentType: 'نقدي',
    storeId: 2,
    storeName: 'مستودع المعرض وصالة البيع',
    items: [
      { id: '3', itemId: 4, barcode: '628100100004', name: 'كشاف إضاءة LED صناعي 150 واط مقاوم للمطر', unit: 'حبة / قطعة', qty: 4, price: 165, discountPercent: 0, taxPercent: 15, total: 759 }
    ],
    subTotal: 660,
    discountTotal: 0,
    taxTotal: 99,
    grandTotal: 759,
    notes: 'فاتورة كاشير نقدية - الصندوق رقم 1',
    createdUser: 'Admin',
    status: 'معتمد'
  }
];

export const INITIAL_PURCHASE_INVOICES: PurchaseInvoice[] = [
  {
    id: 1,
    invoiceNo: 'PUR-2026-001',
    date: '2026-10-01',
    supplierId: 201,
    supplierName: 'شركة المواد الخام والتوريدات الدولية',
    billRefNo: 'SUP-99812',
    paymentType: 'آجل',
    storeId: 1,
    storeName: 'مستودع البضاعة الرئيسي (الرياض)',
    items: [
      { id: '1', itemId: 1, barcode: '628100100001', name: 'كيبل نحاسي 4 ملم معزول 100 متر', unit: 'كرتون (12 حبة)', qty: 25, price: 180, discountPercent: 0, taxPercent: 15, total: 5175 },
      { id: '2', itemId: 2, barcode: '628100100002', name: 'مفتاح قاطع كهربائي ثلاثي 63 أمبير', unit: 'حبة / قطعة', qty: 50, price: 65, discountPercent: 0, taxPercent: 15, total: 3737.5 }
    ],
    subTotal: 7750,
    taxTotal: 1162.5,
    grandTotal: 8912.5,
    notes: 'استلام بضاعة كهربائيات للمستودع المركزي',
    createdUser: 'Admin',
    status: 'معتمد'
  }
];

export const INITIAL_VOUCHERS: FinancialVoucher[] = [
  {
    id: 1,
    voucherNo: 'REC-2026-001',
    kind: 'receipt',
    date: '2026-10-04',
    partyType: 'customer',
    partyId: 101,
    partyName: 'مؤسسة النور للتجارة والمقاولات',
    amount: 15000,
    paymentMethod: 'نقدي (صندوق)',
    cashAccountId: 3,
    costCenterId: 1,
    statement: 'سداد دفعة تحت الحساب من فواتير المبيعات السابقة',
    createdUser: 'Admin'
  },
  {
    id: 2,
    voucherNo: 'PAY-2026-001',
    kind: 'payment',
    date: '2026-10-03',
    partyType: 'supplier',
    partyId: 201,
    partyName: 'شركة المواد الخام والتوريدات الدولية',
    amount: 20000,
    paymentMethod: 'تحويل بنكي',
    cashAccountId: 4,
    costCenterId: 1,
    statement: 'سداد دفعة للمورد عن فاتورة مشتريات PUR-2026-001 عبر البنك الأهلي',
    createdUser: 'Admin'
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 1,
    entryNo: 'JV-2026-001',
    date: '2026-10-04',
    sourceDoc: 'سند قبض REC-2026-001',
    refNo: 'REC-2026-001',
    statement: 'إثبات سند قبض نقدي من مؤسسة النور للتجارة',
    lines: [
      { id: '1', accountId: 3, accountCode: '1101', accountName: 'الصندوق الرئيسي (الخزينة النقدية)', debit: 15000, credit: 0, note: 'الصندوق مدين بالمقبوضات' },
      { id: '2', accountId: 6, accountCode: '1104', accountName: 'العملاء والمدينون التجاريون', debit: 0, credit: 15000, note: 'العميل دائن بالسداد' }
    ],
    totalDebit: 15000,
    totalCredit: 15000,
    branchId: 1,
    createdUser: 'Admin'
  },
  {
    id: 2,
    entryNo: 'JV-2026-002',
    date: '2026-10-03',
    sourceDoc: 'سند صرف PAY-2026-001',
    refNo: 'PAY-2026-001',
    statement: 'سداد دفعة للمورد شركة المواد الخام عبر البنك الأهلي',
    lines: [
      { id: '3', accountId: 13, accountCode: '2101', accountName: 'الموردون والدائنون التجاريون', debit: 20000, credit: 0, note: 'المورد مدين بتخفيض الالتزام' },
      { id: '4', accountId: 4, accountCode: '1102', accountName: 'البنك الأهلي التجاري - الحساب الجاري', debit: 0, credit: 20000, note: 'البنك دائن بالمبلغ المصروف' }
    ],
    totalDebit: 20000,
    totalCredit: 20000,
    branchId: 1,
    createdUser: 'Admin'
  },
  {
    id: 3,
    entryNo: 'JV-2026-003',
    date: '2026-10-05',
    sourceDoc: 'فاتورة مبيعات INV-2026-001',
    refNo: 'INV-2026-001',
    statement: 'قيد إثبات فاتورة مبيعات آجلة رقم INV-2026-001',
    lines: [
      { id: '5', accountId: 6, accountCode: '1104', accountName: 'العملاء والمدينون التجاريون', debit: 4893.25, credit: 0, note: 'العميل مؤسسة النور' },
      { id: '6', accountId: 20, accountCode: '4101', accountName: 'إيراد مبيعات بضاعة تجارية', debit: 0, credit: 4255, note: 'صافي المبيعات' },
      { id: '7', accountId: 14, accountCode: '2102', accountName: 'أمانات ضريبة القيمة المضافة المستحقة (VAT)', debit: 0, credit: 638.25, note: 'ضريبة القيمة المضافة 15%' }
    ],
    totalDebit: 4893.25,
    totalCredit: 4893.25,
    branchId: 1,
    createdUser: 'Admin'
  }
];

export const INITIAL_CHECKS: CheckItem[] = [
  { id: 1, checkNo: 'CHK-89921', bankName: 'مصرف الراجحي', dueDate: '2026-10-25', amount: 25000, partyName: 'مؤسسة النور للتجارة', type: 'وارد (قبض)', status: 'تحت التحصيل' },
  { id: 2, checkNo: 'CHK-45120', bankName: 'البنك الأهلي السعودي', dueDate: '2026-10-30', amount: 18000, partyName: 'شركة أفق البناء', type: 'وارد (قبض)', status: 'تحت التحصيل' },
  { id: 3, checkNo: 'CHK-11203', bankName: 'بنك الرياض', dueDate: '2026-11-05', amount: 35000, partyName: 'شركة المواد الخام والتوريدات', type: 'صادر (صرف)', status: 'تحت التحصيل' },
];

export const INITIAL_CONTRACTS: Contract[] = [
  { id: 1, contractNo: 'CNT-2026-01', customerId: 101, customerName: 'مؤسسة النور للتجارة والمقاولات', title: 'عقد توريد مستلزمات كهربائية ومواد إنشائية', startDate: '2026-01-01', endDate: '2026-12-31', totalValue: 250000, status: 'ساري', notes: 'توريد على دفعات شهرية مع خصم 3%' },
  { id: 2, contractNo: 'CNT-2026-02', customerId: 102, customerName: 'شركة أفق البناء الحديث', title: 'عقد تأجير معدات ثقيلة وسقالات معدنية', startDate: '2026-06-01', endDate: '2026-11-30', totalValue: 120000, status: 'ساري', notes: 'إيجار شهري 20,000 ريال شامل الصيانة الدورية' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, code: 'EMP-01', name: 'م/ خالد بن عبد العزيز الشمري', jobTitle: 'مدير العمليات والمشاريع', department: 'الإدارة الهندسية', phone: '0551122334', basicSalary: 14000, allowances: 3000, hireDate: '2022-03-15', branchId: 1 },
  { id: 2, code: 'EMP-02', name: 'أ/ سلمان بن فهد العتيبي', jobTitle: 'رئيس قسم المحاسبة المالية', department: 'المحاسبة والمالية', phone: '0552233445', basicSalary: 11000, allowances: 2500, hireDate: '2023-01-10', branchId: 1 },
  { id: 3, code: 'EMP-03', name: 'أ/ فهد بن ناصر القحطاني', jobTitle: 'مسؤول المبيعات الميدانية والتسويق', department: 'المبيعات', phone: '0553344556', basicSalary: 7500, allowances: 2000, hireDate: '2024-05-01', branchId: 1 },
  { id: 4, code: 'EMP-04', name: 'أ/ محمد بن راشد الدوسري', jobTitle: 'أمين المستودع المركزي', department: 'المستودعات والمخازن', phone: '0554455667', basicSalary: 6500, allowances: 1500, hireDate: '2023-08-20', branchId: 1 },
];
