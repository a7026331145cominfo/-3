using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AlSaqarERP.Desktop;

public sealed class AppSettings
{
    public string Server { get; set; } = @".\SQLEXPRESS";
    public string Database { get; set; } = "GTSdb2026";
    public bool IntegratedSecurity { get; set; } = true;
    public string UserName { get; set; } = "";
    public string EncryptedPassword { get; set; } = "";

    [JsonIgnore]
    public string Password
    {
        get
        {
            if (string.IsNullOrEmpty(EncryptedPassword)) return "";
            try
            {
                var bytes = Convert.FromBase64String(EncryptedPassword);
                return Encoding.UTF8.GetString(ProtectedData.Unprotect(bytes, null, DataProtectionScope.CurrentUser));
            }
            catch { return ""; }
        }
        set
        {
            if (string.IsNullOrEmpty(value)) { EncryptedPassword = ""; return; }
            EncryptedPassword = Convert.ToBase64String(
                ProtectedData.Protect(Encoding.UTF8.GetBytes(value), null, DataProtectionScope.CurrentUser));
        }
    }

    [JsonIgnore]
    public string SettingsPath => Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "AlSaqarERP", "desktop-settings.json");

    public string BuildConnectionString()
    {
        var b = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder
        {
            DataSource = string.IsNullOrWhiteSpace(Server) ? @".\SQLEXPRESS" : Server.Trim(),
            InitialCatalog = string.IsNullOrWhiteSpace(Database) ? "GTSdb2026" : Database.Trim(),
            IntegratedSecurity = IntegratedSecurity,
            TrustServerCertificate = true,
            Encrypt = true,
            ConnectTimeout = 8,
            ApplicationName = "AlSaqarERP CSharp Desktop"
        };
        if (!IntegratedSecurity)
        {
            b.UserID = UserName;
            b.Password = Password;
        }
        return b.ConnectionString;
    }

    public void Save()
    {
        Directory.CreateDirectory(Path.GetDirectoryName(SettingsPath)!);
        File.WriteAllText(SettingsPath, JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true }));
    }

    public static AppSettings Load()
    {
        var settings = new AppSettings();
        try
        {
            if (File.Exists(settings.SettingsPath))
                settings = JsonSerializer.Deserialize<AppSettings>(File.ReadAllText(settings.SettingsPath)) ?? settings;
        }
        catch { }
        return settings;
    }
}

public sealed record ErpScreen(
    string Key, string Title, string Category, string Description,
    string[] Tables, bool IsReport = false, bool AllowMasterDataEdit = false);

public static class ErpScreenCatalog
{
    public static readonly IReadOnlyList<ErpScreen> Screens =
    [
        new("dashboard", "لوحة تشغيل الصقر ERP", "الرئيسية", "ملخص مباشر من قاعدة GTSdb2026.", ["dbo.Account_Accounts","dbo.Account_CustSup","dbo.Item_Items","dbo.Order_Order","dbo.Order_Purchases"]),
        new("accounting", "مركز المحاسبة", "المحاسبة", "دليل الحسابات والقيود وكشوف الحساب.", ["dbo.Account_Accounts","dbo.Account_DailyEntry","dbo.Account_CustSup"], AllowMasterDataEdit: true),
        new("vouchers", "السندات المالية", "السندات", "سندات القبض والصرف والشيكات.", ["dbo.Account_Receipts","dbo.Account_Payment","dbo.Checks_Checks"]),
        new("sales", "فواتير المبيعات", "المبيعات", "عرض فواتير البيع وتفاصيلها من قاعدة البيانات.", ["dbo.Order_Order","dbo.Order_OrderDetails","dbo.Order_OrderReturn","dbo.Order_OrderReturnDetails"]),
        new("purchases", "فواتير المشتريات", "المشتريات", "عرض فواتير الشراء وتفاصيلها من قاعدة البيانات.", ["dbo.Order_Purchases","dbo.Order_PurchasesDetails","dbo.Order_PurchasesReturn","dbo.Order_PurchasesReturnDetails"]),
        new("inventory", "مركز المخزون والأصناف", "المخزون والأصناف", "الأصناف والوحدات والمجموعات والأرصدة والتحويلات.", ["dbo.Item_Items","dbo.Item_Unit","dbo.Item_Groups","dbo.Item_Class","dbo.Item_OpenQuantity","dbo.Order_StoresTransfer"], AllowMasterDataEdit: true),
        new("domains", "مراكز وعمليات", "المراكز والعمليات", "مراكز التكلفة والعقود والموظفون.", ["dbo.Account_CostCenters","dbo.Account_Projects","dbo.Contract_Contract","dbo.Emp_Employee"], AllowMasterDataEdit: true),
        new("reports", "التقارير", "التقارير", "تنفيذ إجراءات التقارير المسموح بها واستعراض النتائج.", [], true),
        new("security", "الأمان والصلاحيات", "الأمان والصلاحيات", "مراجعة المستخدمين والمجموعات ومصفوفة الصلاحيات.", ["dbo.User_Login","dbo.User_Groups","dbo.User_Screens","dbo.User_Permission"]),
        new("schema", "مستكشف بنية قاعدة البيانات", "ربط وتشغيل النظام", "استعراض الجداول والحقول والأنواع والمفاتيح.", []),
        new("links", "ربط وتشغيل النظام بالكامل", "ربط وتشغيل النظام", "كتالوج الشاشات والجداول والإجراءات المتاحة.", []),
        new("connection", "إعداد الاتصال", "ربط وتشغيل النظام", "إعداد واختبار الاتصال بخادم SQL Server.", [])
    ];

    public static readonly string[] KnownTables =
    [
        "dbo.Account_Accounts","dbo.Account_AccountType","dbo.Account_Branch","dbo.Account_CostCenters",
        "dbo.Account_CustSup","dbo.Account_CustTailor","dbo.Account_DailyEntry","dbo.Account_DefualtAccount",
        "dbo.Account_DefualtAccount2","dbo.Account_DefualtCustomer","dbo.Account_Final","dbo.Account_Nature",
        "dbo.Account_Place","dbo.Account_Projects","dbo.Account_ProjectsDetails","dbo.Account_Receipts",
        "dbo.Account_ReceiptsDetails","dbo.Account_Payment","dbo.Account_SalesMan","dbo.Account_Stores",
        "dbo.Account_Suspended","dbo.Account_Type","dbo.AccountStartBalance","dbo.AccountYearEndClosing",
        "dbo.AccountYears","dbo.Item_Items","dbo.Item_Unit","dbo.Item_Groups","dbo.Item_Class",
        "dbo.Item_Company","dbo.Item_Country","dbo.Item_OpenQuantity","dbo.Item_PriceList","dbo.Item_BarCode",
        "dbo.Item_Guarantee","dbo.Item_Doctor","dbo.Order_Order","dbo.Order_OrderDetails","dbo.Order_OrderReturn",
        "dbo.Order_OrderReturnDetails","dbo.Order_Purchases","dbo.Order_PurchasesDetails","dbo.Order_PurchasesReturn",
        "dbo.Order_PurchasesReturnDetails","dbo.Order_StoresTransfer","dbo.Order_StoresTransferDetails","dbo.Tran_Tran",
        "dbo.User_Login","dbo.User_Groups","dbo.User_Permission","dbo.User_Screens","dbo.Contract_Contract",
        "dbo.Contract_Details","dbo.Emp_Employee","dbo.Emp_Payroll","dbo.Restaurant_Tables","dbo.Restaurant_Orders",
        "dbo.Checks_Checks"
    ];

    public static readonly string[] ReportProcedures =
    [
        "GetReport_Orders", "GetReport_OrderDetailsSmall", "GetReport_OrdersReturn", "GetReport_Purches",
        "GetReport_PurchesDetails", "GetReport_VatReport", "Ledger_Account", "Get_ProfitAndLossAccount",
        "GetReport_MovementsDailyReport", "GetQuantityFromItem_ByItemCode_StoreId", "GetAllBranches",
        "GetReport_OrdersBySalesMan", "GetReport_MovementItemBetweenToDate", "Select_SearchAccountTran",
        "Get_ContractCustomer"
    ];

    public static readonly HashSet<string> EditableTables = new(StringComparer.OrdinalIgnoreCase)
    {
        "dbo.Account_Accounts","dbo.Account_CustSup","dbo.Item_Items","dbo.Item_Unit",
        "dbo.Item_Groups","dbo.Item_Class","dbo.Account_CostCenters","dbo.Contract_Contract","dbo.Emp_Employee"
    };
}