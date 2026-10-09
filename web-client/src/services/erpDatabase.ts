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
import {
  INITIAL_USER,
  INITIAL_BRANCHES,
  INITIAL_STORES,
  INITIAL_COST_CENTERS,
  INITIAL_ACCOUNTS,
  INITIAL_CUSTOMERS_SUPPLIERS,
  INITIAL_UNITS,
  INITIAL_GROUPS,
  INITIAL_CLASSES,
  INITIAL_ITEMS,
  INITIAL_SALES_INVOICES,
  INITIAL_PURCHASE_INVOICES,
  INITIAL_VOUCHERS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_CHECKS,
  INITIAL_CONTRACTS,
  INITIAL_EMPLOYEES,
} from '../data/initialData';

const STORAGE_KEY = 'alsaqar_erp_database_v4';

interface DatabaseState {
  user: UserSession;
  branches: Branch[];
  stores: Store[];
  costCenters: CostCenter[];
  accounts: Account[];
  custSup: CustomerSupplier[];
  units: ItemUnit[];
  groups: ItemGroup[];
  classes: ItemClass[];
  items: Item[];
  salesInvoices: SalesInvoice[];
  purchaseInvoices: PurchaseInvoice[];
  vouchers: FinancialVoucher[];
  journalEntries: JournalEntry[];
  checks: CheckItem[];
  contracts: Contract[];
  employees: Employee[];
}

class ErpDatabaseService {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DatabaseState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      user: INITIAL_USER,
      branches: INITIAL_BRANCHES,
      stores: INITIAL_STORES,
      costCenters: INITIAL_COST_CENTERS,
      accounts: INITIAL_ACCOUNTS,
      custSup: INITIAL_CUSTOMERS_SUPPLIERS,
      units: INITIAL_UNITS,
      groups: INITIAL_GROUPS,
      classes: INITIAL_CLASSES,
      items: INITIAL_ITEMS,
      salesInvoices: INITIAL_SALES_INVOICES,
      purchaseInvoices: INITIAL_PURCHASE_INVOICES,
      vouchers: INITIAL_VOUCHERS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      checks: INITIAL_CHECKS,
      contracts: INITIAL_CONTRACTS,
      employees: INITIAL_EMPLOYEES,
    };
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // ignore
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      user: INITIAL_USER,
      branches: INITIAL_BRANCHES,
      stores: INITIAL_STORES,
      costCenters: INITIAL_COST_CENTERS,
      accounts: INITIAL_ACCOUNTS,
      custSup: INITIAL_CUSTOMERS_SUPPLIERS,
      units: INITIAL_UNITS,
      groups: INITIAL_GROUPS,
      classes: INITIAL_CLASSES,
      items: INITIAL_ITEMS,
      salesInvoices: INITIAL_SALES_INVOICES,
      purchaseInvoices: INITIAL_PURCHASE_INVOICES,
      vouchers: INITIAL_VOUCHERS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      checks: INITIAL_CHECKS,
      contracts: INITIAL_CONTRACTS,
      employees: INITIAL_EMPLOYEES,
    };
    this.saveState();
  }

  // Getters
  public getUser(): UserSession { return this.state.user; }
  public setUser(user: UserSession) { this.state.user = user; this.saveState(); }
  public getBranches(): Branch[] { return this.state.branches; }
  public getStores(): Store[] { return this.state.stores; }
  public getCostCenters(): CostCenter[] { return this.state.costCenters; }
  public getAccounts(): Account[] { return this.state.accounts; }
  public getCustSup(): CustomerSupplier[] { return this.state.custSup; }
  public getUnits(): ItemUnit[] { return this.state.units; }
  public getGroups(): ItemGroup[] { return this.state.groups; }
  public getClasses(): ItemClass[] { return this.state.classes; }
  public getItems(): Item[] { return this.state.items; }
  public getSalesInvoices(): SalesInvoice[] { return this.state.salesInvoices; }
  public getPurchaseInvoices(): PurchaseInvoice[] { return this.state.purchaseInvoices; }
  public getVouchers(): FinancialVoucher[] { return this.state.vouchers; }
  public getJournalEntries(): JournalEntry[] { return this.state.journalEntries; }
  public getChecks(): CheckItem[] { return this.state.checks; }
  public getContracts(): Contract[] { return this.state.contracts; }
  public getEmployees(): Employee[] { return this.state.employees; }

  // Account operations
  public getAccountById(id: number): Account | undefined {
    return this.state.accounts.find((a) => a.id === id);
  }

  public getAccountByCode(code: string): Account | undefined {
    return this.state.accounts.find((a) => a.code === code);
  }

  public saveAccount(account: Partial<Account> & { name: string; code: string }): Account {
    if (account.id) {
      const idx = this.state.accounts.findIndex((a) => a.id === account.id);
      if (idx >= 0) {
        this.state.accounts[idx] = { ...this.state.accounts[idx], ...account };
        this.saveState();
        return this.state.accounts[idx];
      }
    }
    const newId = Math.max(0, ...this.state.accounts.map((a) => a.id)) + 1;
    const newAcc: Account = {
      id: newId,
      code: account.code,
      name: account.name,
      type: account.type || 'فرعي',
      nature: account.nature || 'مدين',
      parentCode: account.parentCode,
      balance: account.balance || 0,
      currency: 'SAR',
      level: account.level || (account.code.length <= 2 ? 1 : account.code.length <= 4 ? 2 : 3),
    };
    this.state.accounts.push(newAcc);
    this.saveState();
    return newAcc;
  }

  public deleteAccount(id: number): boolean {
    const hasEntries = this.state.journalEntries.some((j) =>
      j.lines.some((l) => l.accountId === id)
    );
    if (hasEntries) {
      throw new Error('لا يمكن حذف الحساب نظراً لوجود قيود محاسبية مسجلة عليه.');
    }
    this.state.accounts = this.state.accounts.filter((a) => a.id !== id);
    this.saveState();
    return true;
  }

  // Customer / Supplier Operations
  public getCustSupById(id: number): CustomerSupplier | undefined {
    return this.state.custSup.find((c) => c.id === id);
  }

  public saveCustSup(data: Partial<CustomerSupplier> & { name: string; type: 'customer' | 'supplier' }): CustomerSupplier {
    if (data.id) {
      const idx = this.state.custSup.findIndex((c) => c.id === data.id);
      if (idx >= 0) {
        this.state.custSup[idx] = { ...this.state.custSup[idx], ...data };
        this.saveState();
        return this.state.custSup[idx];
      }
    }
    const newId = Math.max(100, ...this.state.custSup.map((c) => c.id)) + 1;
    const prefix = data.type === 'customer' ? 'CUST' : 'SUPP';
    const newRecord: CustomerSupplier = {
      id: newId,
      type: data.type,
      code: data.code || `${prefix}-${String(newId).padStart(3, '0')}`,
      name: data.name,
      phone: data.phone || '',
      vatNumber: data.vatNumber || '',
      address: data.address || '',
      creditLimit: Number(data.creditLimit) || 0,
      currentBalance: Number(data.currentBalance) || 0,
    };
    this.state.custSup.push(newRecord);
    this.saveState();
    return newRecord;
  }

  public deleteCustSup(id: number): boolean {
    this.state.custSup = this.state.custSup.filter((c) => c.id !== id);
    this.saveState();
    return true;
  }

  // Items Operations
  public getItemById(id: number): Item | undefined {
    return this.state.items.find((i) => i.id === id);
  }

  public getItemByBarcode(barcode: string): Item | undefined {
    return this.state.items.find((i) => i.barcode === barcode || i.code === barcode);
  }

  public saveItem(data: Partial<Item> & { name: string; barcode: string }): Item {
    if (data.id) {
      const idx = this.state.items.findIndex((i) => i.id === data.id);
      if (idx >= 0) {
        this.state.items[idx] = { ...this.state.items[idx], ...data };
        this.saveState();
        return this.state.items[idx];
      }
    }
    const newId = Math.max(0, ...this.state.items.map((i) => i.id)) + 1;
    const newItem: Item = {
      id: newId,
      barcode: data.barcode,
      code: data.code || `ITM-${1000 + newId}`,
      name: data.name,
      unit: data.unit || 'حبة / قطعة',
      group: data.group || 'عام',
      category: data.category || 'صنف عادي',
      purchasePrice: Number(data.purchasePrice) || 0,
      salePrice: Number(data.salePrice) || 0,
      minQty: Number(data.minQty) || 5,
      currentStock: Number(data.currentStock) || 0,
      storeId: Number(data.storeId) || 1,
    };
    this.state.items.push(newItem);
    this.saveState();
    return newItem;
  }

  public adjustItemStock(itemId: number, qtyDelta: number) {
    const item = this.state.items.find((i) => i.id === itemId);
    if (item) {
      item.currentStock = Math.max(0, item.currentStock + qtyDelta);
      this.saveState();
    }
  }

  // Opening Quantity update
  public updateOpeningQuantity(itemId: number, storeId: number, qty: number, costPrice: number, notes: string) {
    const item = this.state.items.find((i) => i.id === itemId);
    if (item) {
      item.currentStock = qty;
      item.purchasePrice = costPrice;
      item.storeId = storeId;
    }
    // Also record an entry in journal
    const totalVal = qty * costPrice;
    if (totalVal > 0) {
      this.createJournalEntry({
        sourceDoc: `رصيد افتتاحي صنف ${item?.name || itemId}`,
        refNo: `OPEN-${itemId}`,
        statement: `إثبات رصيد أول المدة للصنف: ${item?.name || ''} - ${notes}`,
        lines: [
          {
            id: '1',
            accountId: 7, // مخزون
            accountCode: '1105',
            accountName: 'مخزون البضاعة بالمستودعات',
            debit: totalVal,
            credit: 0,
            note: `رصيد افتتاحي ${qty} وحدة`,
          },
          {
            id: '2',
            accountId: 17, // رأس المال
            accountCode: '3101',
            accountName: 'رأس مال المؤسسة المدفوع',
            debit: 0,
            credit: totalVal,
            note: 'مقابل الرصيد الافتتاحي للمخزون',
          },
        ],
        branchId: 1,
      });
    }
    this.saveState();
  }

  // Sales Invoice Processing (with automatic journal entry, stock update, customer balance)
  public createSalesInvoice(invoice: Omit<SalesInvoice, 'id' | 'invoiceNo' | 'createdUser' | 'status'>): SalesInvoice {
    const newId = Math.max(0, ...this.state.salesInvoices.map((s) => s.id)) + 1;
    const invoiceNo = `INV-2026-${String(newId).padStart(3, '0')}`;
    const newInvoice: SalesInvoice = {
      ...invoice,
      id: newId,
      invoiceNo,
      createdUser: this.state.user.userName,
      status: 'معتمد',
    };

    // 1. Deduct Stock
    invoice.items.forEach((itemRow) => {
      this.adjustItemStock(itemRow.itemId, -itemRow.qty);
    });

    // 2. Update Customer Balance if credit
    if (invoice.paymentType === 'آجل' && invoice.customerId) {
      const cust = this.state.custSup.find((c) => c.id === invoice.customerId);
      if (cust) {
        cust.currentBalance += invoice.grandTotal;
      }
    }

    // 3. Post Journal Entry
    const debitAccountId = invoice.paymentType === 'نقدي' ? 3 : invoice.paymentType === 'شبكة (مدى)' ? 4 : 6;
    const debitAccount = this.getAccountById(debitAccountId);

    this.createJournalEntry({
      sourceDoc: `فاتورة مبيعات ${invoiceNo}`,
      refNo: invoiceNo,
      statement: `إثبات فاتورة مبيعات ${invoice.paymentType} للعميل: ${invoice.customerName}`,
      lines: [
        {
          id: '1',
          accountId: debitAccountId,
          accountCode: debitAccount?.code || '1101',
          accountName: debitAccount?.name || 'الصندوق/العملاء',
          debit: invoice.grandTotal,
          credit: 0,
          note: `إجمالي الفاتورة ${invoice.paymentType}`,
        },
        {
          id: '2',
          accountId: 20, // إيراد مبيعات
          accountCode: '4101',
          accountName: 'إيراد مبيعات بضاعة تجارية',
          debit: 0,
          credit: invoice.subTotal - invoice.discountTotal,
          note: 'صافي قيمة المبيعات',
        },
        ...(invoice.taxTotal > 0
          ? [
              {
                id: '3',
                accountId: 14, // ضريبة مبيعات
                accountCode: '2102',
                accountName: 'أمانات ضريبة القيمة المضافة المستحقة (VAT)',
                debit: 0,
                credit: invoice.taxTotal,
                note: 'ضريبة القيمة المضافة 15%',
              },
            ]
          : []),
      ],
      branchId: this.state.user.branchId,
    });

    this.state.salesInvoices.unshift(newInvoice);
    this.saveState();
    return newInvoice;
  }

  // Purchase Invoice Processing (with automatic journal entry, stock update, supplier balance)
  public createPurchaseInvoice(invoice: Omit<PurchaseInvoice, 'id' | 'invoiceNo' | 'createdUser' | 'status'>): PurchaseInvoice {
    const newId = Math.max(0, ...this.state.purchaseInvoices.map((p) => p.id)) + 1;
    const invoiceNo = `PUR-2026-${String(newId).padStart(3, '0')}`;
    const newInvoice: PurchaseInvoice = {
      ...invoice,
      id: newId,
      invoiceNo,
      createdUser: this.state.user.userName,
      status: 'معتمد',
    };

    // 1. Increase Stock
    invoice.items.forEach((itemRow) => {
      this.adjustItemStock(itemRow.itemId, itemRow.qty);
    });

    // 2. Update Supplier Balance if credit
    if (invoice.paymentType === 'آجل' && invoice.supplierId) {
      const supp = this.state.custSup.find((c) => c.id === invoice.supplierId);
      if (supp) {
        supp.currentBalance += invoice.grandTotal;
      }
    }

    // 3. Post Journal Entry
    const creditAccountId = invoice.paymentType === 'نقدي' ? 3 : invoice.paymentType === 'تحويل بنكي' ? 4 : 13;
    const creditAccount = this.getAccountById(creditAccountId);

    this.createJournalEntry({
      sourceDoc: `فاتورة مشتريات ${invoiceNo}`,
      refNo: invoiceNo,
      statement: `إثبات فاتورة مشتريات من المورد: ${invoice.supplierName}`,
      lines: [
        {
          id: '1',
          accountId: 23, // تكلفة البضاعة المشتراة أو المخزون
          accountCode: '1105',
          accountName: 'مخزون البضاعة بالمستودعات',
          debit: invoice.subTotal,
          credit: 0,
          note: 'استلام بضاعة للمخزن',
        },
        ...(invoice.taxTotal > 0
          ? [
              {
                id: '2',
                accountId: 14,
                accountCode: '2102',
                accountName: 'أمانات ضريبة القيمة المضافة المستحقة (VAT)',
                debit: invoice.taxTotal,
                credit: 0,
                note: 'ضريبة مدخلات مشتريات قابلة للخصم',
              },
            ]
          : []),
        {
          id: '3',
          accountId: creditAccountId,
          accountCode: creditAccount?.code || '2101',
          accountName: creditAccount?.name || 'الموردون/البنك',
          debit: 0,
          credit: invoice.grandTotal,
          note: `استحقاق المشتريات ${invoice.paymentType}`,
        },
      ],
      branchId: this.state.user.branchId,
    });

    this.state.purchaseInvoices.unshift(newInvoice);
    this.saveState();
    return newInvoice;
  }

  // Financial Voucher Processing (Receipt / Payment)
  public createVoucher(data: Omit<FinancialVoucher, 'id' | 'voucherNo' | 'createdUser'>): FinancialVoucher {
    const isReceipt = data.kind === 'receipt';
    const existing = this.state.vouchers.filter((v) => v.kind === data.kind);
    const newId = Math.max(0, ...existing.map((v) => v.id)) + 1;
    const prefix = isReceipt ? 'REC' : 'PAY';
    const voucherNo = `${prefix}-2026-${String(newId).padStart(3, '0')}`;

    const newVoucher: FinancialVoucher = {
      ...data,
      id: newId,
      voucherNo,
      createdUser: this.state.user.userName,
    };

    // Update Party Balance
    if (data.partyType === 'customer' || data.partyType === 'supplier') {
      const party = this.state.custSup.find((c) => c.id === data.partyId);
      if (party) {
        if (isReceipt) {
          party.currentBalance = Math.max(0, party.currentBalance - data.amount);
        } else {
          party.currentBalance = Math.max(0, party.currentBalance - data.amount);
        }
      }
    }

    // Post to Journal
    const cashAcc = this.getAccountById(data.cashAccountId) || this.getAccountById(3);
    const partyAccId = data.partyType === 'customer' ? 6 : data.partyType === 'supplier' ? 13 : data.partyId;
    const partyAcc = this.getAccountById(partyAccId);

    if (isReceipt) {
      // Receipt: Cash Dr, Party Cr
      this.createJournalEntry({
        sourceDoc: `سند قبض ${voucherNo}`,
        refNo: voucherNo,
        statement: data.statement || `قبض نقدي من ${data.partyName}`,
        lines: [
          {
            id: '1',
            accountId: cashAcc?.id || 3,
            accountCode: cashAcc?.code || '1101',
            accountName: cashAcc?.name || 'الصندوق الرئيسي',
            debit: data.amount,
            credit: 0,
            note: 'قبض نقدية/حساب',
          },
          {
            id: '2',
            accountId: partyAcc?.id || 6,
            accountCode: partyAcc?.code || '1104',
            accountName: partyAcc?.name || 'العملاء والمدينون',
            debit: 0,
            credit: data.amount,
            note: `سداد من ${data.partyName}`,
          },
        ],
        branchId: this.state.user.branchId,
      });
    } else {
      // Payment: Party Dr, Cash Cr
      this.createJournalEntry({
        sourceDoc: `سند صرف ${voucherNo}`,
        refNo: voucherNo,
        statement: data.statement || `صرف نقدي لصالح ${data.partyName}`,
        lines: [
          {
            id: '1',
            accountId: partyAcc?.id || 13,
            accountCode: partyAcc?.code || '2101',
            accountName: partyAcc?.name || 'الموردون والدائنون',
            debit: data.amount,
            credit: 0,
            note: `صرف لصالح ${data.partyName}`,
          },
          {
            id: '2',
            accountId: cashAcc?.id || 3,
            accountCode: cashAcc?.code || '1101',
            accountName: cashAcc?.name || 'الصندوق الرئيسي',
            debit: 0,
            credit: data.amount,
            note: 'صرف نقدية من الخزينة/البنك',
          },
        ],
        branchId: this.state.user.branchId,
      });
    }

    this.state.vouchers.unshift(newVoucher);
    this.saveState();
    return newVoucher;
  }

  // Journal Entry Processing
  public createJournalEntry(entry: {
    sourceDoc: string;
    refNo: string;
    statement: string;
    lines: {
      id: string;
      accountId: number;
      accountCode: string;
      accountName: string;
      debit: number;
      credit: number;
      costCenter?: string;
      note: string;
    }[];
    branchId: number;
  }): JournalEntry {
    const newId = Math.max(0, ...this.state.journalEntries.map((j) => j.id)) + 1;
    const entryNo = `JV-2026-${String(newId).padStart(3, '0')}`;
    const totalDebit = entry.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = entry.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

    const newEntry: JournalEntry = {
      id: newId,
      entryNo,
      date: new Date().toISOString().split('T')[0],
      sourceDoc: entry.sourceDoc,
      refNo: entry.refNo,
      statement: entry.statement,
      lines: entry.lines,
      totalDebit,
      totalCredit,
      branchId: entry.branchId,
      createdUser: this.state.user.userName,
    };

    // Update account balances
    entry.lines.forEach((line) => {
      const acc = this.state.accounts.find((a) => a.id === line.accountId);
      if (acc) {
        if (acc.nature === 'مدين') {
          acc.balance += (Number(line.debit) || 0) - (Number(line.credit) || 0);
        } else {
          acc.balance += (Number(line.credit) || 0) - (Number(line.debit) || 0);
        }
      }
    });

    this.state.journalEntries.unshift(newEntry);
    this.saveState();
    return newEntry;
  }

  // Cross-Linking Query Helpers
  public getAccountLedger(accountId: number): {
    account: Account | undefined;
    transactions: {
      date: string;
      sourceDoc: string;
      refNo: string;
      statement: string;
      note: string;
      debit: number;
      credit: number;
      runningBalance: number;
    }[];
    totalDebit: number;
    totalCredit: number;
    netBalance: number;
  } {
    const account = this.getAccountById(accountId);
    const transactions: any[] = [];
    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    // Sort ascending by id/date for ledger
    const sorted = [...this.state.journalEntries].sort((a, b) => a.id - b.id);

    sorted.forEach((entry) => {
      const matchLines = entry.lines.filter((l) => l.accountId === accountId);
      matchLines.forEach((line) => {
        const debit = Number(line.debit) || 0;
        const credit = Number(line.credit) || 0;
        totalDebit += debit;
        totalCredit += credit;

        if (account?.nature === 'مدين') {
          runningBalance += debit - credit;
        } else {
          runningBalance += credit - debit;
        }

        transactions.push({
          date: entry.date,
          sourceDoc: entry.sourceDoc,
          refNo: entry.refNo,
          statement: entry.statement,
          note: line.note,
          debit,
          credit,
          runningBalance,
        });
      });
    });

    return {
      account,
      transactions,
      totalDebit,
      totalCredit,
      netBalance: runningBalance,
    };
  }

  public getTrialBalance(): {
    rows: {
      code: string;
      name: string;
      nature: string;
      debitBalance: number;
      creditBalance: number;
    }[];
    sumDebit: number;
    sumCredit: number;
  } {
    const rows = this.state.accounts.map((acc) => {
      const ledger = this.getAccountLedger(acc.id);
      const isDebit = acc.nature === 'مدين';
      const net = ledger.netBalance;
      return {
        code: acc.code,
        name: acc.name,
        nature: acc.nature,
        debitBalance: isDebit ? Math.max(0, net) : 0,
        creditBalance: !isDebit ? Math.max(0, net) : 0,
      };
    });

    const sumDebit = rows.reduce((s, r) => s + r.debitBalance, 0);
    const sumCredit = rows.reduce((s, r) => s + r.creditBalance, 0);

    return { rows, sumDebit, sumCredit };
  }

  // Stock Movement Ledger
  public getItemMovements(itemId: number): {
    item: Item | undefined;
    rows: {
      date: string;
      type: string;
      docNo: string;
      partyName: string;
      qtyIn: number;
      qtyOut: number;
      runningStock: number;
    }[];
  } {
    const item = this.getItemById(itemId);
    const rows: any[] = [];
    let running = 0;

    // Purchases (IN)
    this.state.purchaseInvoices.forEach((pur) => {
      const match = pur.items.find((i) => i.itemId === itemId);
      if (match) {
        running += match.qty;
        rows.push({
          date: pur.date,
          type: 'فاتورة مشتريات',
          docNo: pur.invoiceNo,
          partyName: pur.supplierName,
          qtyIn: match.qty,
          qtyOut: 0,
          runningStock: running,
        });
      }
    });

    // Sales (OUT)
    this.state.salesInvoices.forEach((sale) => {
      const match = sale.items.find((i) => i.itemId === itemId);
      if (match) {
        running -= match.qty;
        rows.push({
          date: sale.date,
          type: 'فاتورة مبيعات',
          docNo: sale.invoiceNo,
          partyName: sale.customerName,
          qtyIn: 0,
          qtyOut: match.qty,
          runningStock: running,
        });
      }
    });

    return { item, rows };
  }
}

export const erpDb = new ErpDatabaseService();
