using System.Data;

namespace AlSaqarERP.Desktop;

public class WorkspaceScreen : UserControl, IRefreshable
{
    protected readonly SqlServerService Db;
    protected readonly ErpScreen Definition;
    protected readonly TableBrowserControl Browser;

    public WorkspaceScreen(SqlServerService db, ErpScreen definition, bool allowMasterEdit = false)
    {
        Db = db; Definition = definition;
        Dock = DockStyle.Fill; RightToLeft = RightToLeft.Yes;
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 2, Padding = new Padding(8) };
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        Browser = new TableBrowserControl(db, definition.Tables, allowMasterEdit);
        layout.Controls.Add(new ScreenHeaderControl(definition.Title, definition.Description, RefreshData), 0, 0);
        layout.Controls.Add(Browser, 0, 1);
        Controls.Add(layout);
    }

    public virtual void RefreshData() => Browser.RefreshData();
}

public sealed class AccountingCenterScreen : WorkspaceScreen
{
    public AccountingCenterScreen(SqlServerService db) : base(db, ErpScreenCatalog.Screens.Single(s => s.Key == "accounting"), allowMasterEdit: true) { }
}

public sealed class FinancialVouchersScreen : WorkspaceScreen
{
    public FinancialVouchersScreen(SqlServerService db) : base(db, ErpScreenCatalog.Screens.Single(s => s.Key == "vouchers")) { }
}

public sealed class SalesEntryScreen : WorkspaceScreen
{
    public SalesEntryScreen(SqlServerService db) : base(db, ErpScreenCatalog.Screens.Single(s => s.Key == "sales"))
    {
        // The web source stores invoices in localStorage. This desktop conversion reads the real SQL tables,
        // but deliberately does not write directly to the header/detail tables outside the ERP posting procedures.
    }
}

public sealed class PurchaseEntryScreen : WorkspaceScreen
{
    public PurchaseEntryScreen(SqlServerService db) : base(db, ErpScreenCatalog.Screens.Single(s => s.Key == "purchases")) { }
}

public sealed class InventoryCenterScreen : WorkspaceScreen
{
    public InventoryCenterScreen(SqlServerService db) : base(db, ErpScreenCatalog.Screens.Single(s => s.Key == "inventory"), allowMasterEdit: true) { }
}

public sealed class DomainCentersScreen : WorkspaceScreen
{
    public DomainCentersScreen(SqlServerService db) : base(db, ErpScreenCatalog.Screens.Single(s => s.Key == "domains"), allowMasterEdit: true) { }
}

public sealed class SecurityAdminScreen : WorkspaceScreen
{
    public SecurityAdminScreen(SqlServerService db) : base(db, ErpScreenCatalog.Screens.Single(s => s.Key == "security")) { }
}

public sealed class DashboardScreen : UserControl, IRefreshable
{
    private readonly SqlServerService _db;
    private readonly FlowLayoutPanel _cards = new() { Dock = DockStyle.Fill, AutoScroll = true, FlowDirection = FlowDirection.RightToLeft, WrapContents = true, Padding = new Padding(10) };
    private readonly Label _status = new() { AutoSize = true, Padding = new Padding(12) };

    public DashboardScreen(SqlServerService db)
    {
        _db = db; Dock = DockStyle.Fill; RightToLeft = RightToLeft.Yes;
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 3 };
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize)); layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100)); layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        var header = new ScreenHeaderControl("لوحة تشغيل الصقر ERP", "ملخص مباشر من قاعدة بيانات SQL Server — GTSdb2026.", RefreshData);
        layout.Controls.Add(header, 0, 0); layout.Controls.Add(_cards, 0, 1); layout.Controls.Add(_status, 0, 2);
        Controls.Add(layout);
        Load += (_, _) => RefreshData();
    }

    public void RefreshData()
    {
        _cards.Controls.Clear();
        var metrics = new (string Table, string Caption)[]
        {
            ("dbo.Account_Accounts","الحسابات"), ("dbo.Account_CustSup","العملاء والموردون"),
            ("dbo.Item_Items","الأصناف"), ("dbo.Order_Order","فواتير المبيعات"),
            ("dbo.Order_Purchases","فواتير المشتريات"), ("dbo.Account_Receipts","سندات القبض"),
            ("dbo.Account_Payment","سندات الصرف"), ("dbo.Tran_Tran","الحركات المحاسبية")
        };
        try
        {
            foreach (var item in metrics)
            {
                if (!_db.TableExists(item.Table)) continue;
                AddMetric(item.Caption, _db.CountRows(item.Table).ToString("N0"), item.Table);
            }
            _status.ForeColor = Color.SeaGreen;
            _status.Text = $"تم جلب الملخص في {DateTime.Now:yyyy-MM-dd HH:mm:ss} — البيانات من SQL Server وليست بيانات تجريبية داخل المتصفح.";
        }
        catch (Exception ex)
        {
            _status.ForeColor = Color.Firebrick;
            _status.Text = "تعذر جلب الملخص. افتح إعدادات الاتصال وتأكد من الخادم وقاعدة البيانات. التفاصيل: " + ex.Message;
        }
    }

    private void AddMetric(string title, string value, string table)
    {
        var card = new Panel { Width = 230, Height = 116, Margin = new Padding(8), BorderStyle = BorderStyle.FixedSingle, BackColor = Color.WhiteSmoke };
        var name = new Label { Text = title, Dock = DockStyle.Top, Height = 34, TextAlign = ContentAlignment.MiddleCenter, Font = new Font("Segoe UI", 10, FontStyle.Bold) };
        var number = new Label { Text = value, Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleCenter, Font = new Font("Segoe UI", 23, FontStyle.Bold), ForeColor = Color.DarkSlateBlue };
        var view = new LinkLabel { Text = "عرض السجلات", Dock = DockStyle.Bottom, Height = 22, TextAlign = ContentAlignment.MiddleCenter };
        view.LinkClicked += (_, _) =>
        {
            var screen = new ErpScreen("metric-" + table, title, "الرئيسية", table, [table]);
            using var form = new Form { Text = title, Width = 1100, Height = 700, StartPosition = FormStartPosition.CenterParent, RightToLeft = RightToLeft.Yes, RightToLeftLayout = true };
            form.Controls.Add(new TableBrowserControl(_db, [table]));
            form.ShowDialog(this);
        };
        card.Controls.Add(number); card.Controls.Add(name); card.Controls.Add(view); _cards.Controls.Add(card);
    }
}

public sealed class ShowDashboardView : UserControl, IRefreshable
{
    private readonly DashboardScreen _dashboard;
    public ShowDashboardView(SqlServerService db)
    {
        _dashboard = new DashboardScreen(db) { Dock = DockStyle.Fill };
        Controls.Add(_dashboard); Dock = DockStyle.Fill;
    }
    public void RefreshData() => _dashboard.RefreshData();
}

public sealed class ReportsScreen : UserControl, IRefreshable
{
    private readonly ProcedureReportControl _reports;
    public ReportsScreen(SqlServerService db)
    {
        Dock = DockStyle.Fill; RightToLeft = RightToLeft.Yes;
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 2, Padding = new Padding(8) };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize)); root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        _reports = new ProcedureReportControl(db);
        root.Controls.Add(new ScreenHeaderControl("التقارير", "تقارير من الإجراءات المخزنة المحددة في قائمة السماح.", RefreshData), 0, 0);
        root.Controls.Add(_reports, 0, 1); Controls.Add(root);
    }
    public void RefreshData() => _reports.RefreshData();
}

public sealed class SchemaExplorerScreen : UserControl, IRefreshable
{
    private readonly SqlServerService _db;
    private readonly ComboBox _table = new() { Width = 360, DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly DataGridView _grid = new() { Dock = DockStyle.Fill, AutoGenerateColumns = true, ReadOnly = true, AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.DisplayedCells, BackgroundColor = Color.White };
    private readonly Label _status = new() { AutoSize = true };
    public SchemaExplorerScreen(SqlServerService db)
    {
        _db = db; Dock = DockStyle.Fill; RightToLeft = RightToLeft.Yes;
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 3, Padding = new Padding(8) };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize)); root.RowStyles.Add(new RowStyle(SizeType.Percent, 100)); root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        var bar = new FlowLayoutPanel { AutoSize = true, Dock = DockStyle.Fill, FlowDirection = FlowDirection.RightToLeft };
        bar.Controls.Add(new Label { Text = "الجدول", AutoSize = true, Padding = new Padding(4, 8, 0, 0) }); bar.Controls.Add(_table);
        var refresh = new Button { Text = "تحديث البنية", AutoSize = true }; refresh.Click += (_, _) => RefreshData(); bar.Controls.Add(refresh);
        _table.SelectedIndexChanged += (_, _) => ShowSelected();
        root.Controls.Add(new ScreenHeaderControl("مستكشف بنية قاعدة البيانات", "قراءة أسماء الجداول والحقول والأنواع والمفاتيح الأساسية."), 0, 0);
        root.Controls.Add(_grid, 0, 1); root.Controls.Add(_status, 0, 2);
        Controls.Add(root);
        Load += (_, _) => RefreshData();
    }

    public void RefreshData()
    {
        try
        {
            var all = _db.ListTables();
            var prev = _table.SelectedItem?.ToString();
            _table.Items.Clear(); _table.Items.AddRange(all.Cast<object>().ToArray());
            if (prev is not null && all.Contains(prev)) _table.SelectedItem = prev;
            else if (_table.Items.Count > 0) _table.SelectedIndex = 0;
            ShowSelected();
        }
        catch (Exception ex) { _status.Text = "تعذر تحميل بنية قاعدة البيانات: " + ex.Message; }
    }

    private void ShowSelected()
    {
        if (_table.SelectedItem is not string table) return;
        try
        {
            var data = _db.ReadSchemaCatalog();
            var view = new DataView(data) { RowFilter = $"[Schema] = '{EscapeFilter(table.Split('.')[0])}' AND [Table] = '{EscapeFilter(table.Split('.').Last())}'" };
            _grid.DataSource = view;
            _status.Text = $"{table}: {view.Count} حقلًا.";
        }
        catch (Exception ex) { _status.Text = ex.Message; }
    }
    private static string EscapeFilter(string value) => value.Replace("'", "''");
}

public sealed class FullSystemLinkScreen : UserControl
{
    public event Action<string>? OpenScreenRequested;
    private readonly SqlServerService _db;
    private readonly ListView _screens = new() { Dock = DockStyle.Fill, View = View.Details, FullRowSelect = true, GridLines = true };
    private readonly ListView _tables = new() { Dock = DockStyle.Fill, View = View.Details, FullRowSelect = true, GridLines = true };
    private readonly ListView _procedures = new() { Dock = DockStyle.Fill, View = View.Details, FullRowSelect = true, GridLines = true };

    public FullSystemLinkScreen(SqlServerService db)
    {
        _db = db; Dock = DockStyle.Fill; RightToLeft = RightToLeft.Yes;
        var pages = new TabControl { Dock = DockStyle.Fill };
        var screensPage = new TabPage("الشاشات"); var tablesPage = new TabPage("الجداول"); var proceduresPage = new TabPage("التقارير والإجراءات");
        _screens.Columns.Add("اسم الشاشة", 330); _screens.Columns.Add("القسم", 150); _screens.Columns.Add("المفتاح", 140);
        _tables.Columns.Add("اسم الجدول", 360); _tables.Columns.Add("الوحدة", 160);
        _procedures.Columns.Add("الإجراء", 390); _procedures.Columns.Add("نوع الاستخدام", 250);
        foreach (var screen in ErpScreenCatalog.Screens)
        {
            var item = new ListViewItem(screen.Title); item.SubItems.Add(screen.Category); item.SubItems.Add(screen.Key); item.Tag = screen.Key;
            _screens.Items.Add(item);
        }
        foreach (var table in ErpScreenCatalog.KnownTables)
        {
            var item = new ListViewItem(table); item.SubItems.Add(table.Split('.').Last().Split('_')[0]); item.Tag = table;
            _tables.Items.Add(item);
        }
        foreach (var p in ErpScreenCatalog.ReportProcedures)
        {
            var item = new ListViewItem(p); item.SubItems.Add("إجراء تقرير مسموح"); item.Tag = p;
            _procedures.Items.Add(item);
        }
        screensPage.Controls.Add(_screens); tablesPage.Controls.Add(_tables); proceduresPage.Controls.Add(_procedures);
        pages.TabPages.Add(screensPage); pages.TabPages.Add(tablesPage); pages.TabPages.Add(proceduresPage);
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 2, Padding = new Padding(8) };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize)); root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        root.Controls.Add(new ScreenHeaderControl("ربط وتشغيل النظام بالكامل", "فهرس أسماء الشاشات والجداول والإجراءات المسموح بها."), 0, 0);
        root.Controls.Add(pages, 0, 1); Controls.Add(root);
        _screens.DoubleClick += (_, _) => { if (_screens.SelectedItems.Count > 0 && _screens.SelectedItems[0].Tag is string key) OpenScreenRequested?.Invoke(key); };
        _tables.DoubleClick += (_, _) => { if (_tables.SelectedItems.Count > 0 && _tables.SelectedItems[0].Tag is string table) OpenTable(table); };
        Load += (_, _) => RefreshTableState();
    }

    private void RefreshTableState()
    {
        try
        {
            var actual = new HashSet<string>(_db.ListTables(), StringComparer.OrdinalIgnoreCase);
            foreach (ListViewItem item in _tables.Items)
            {
                var exists = actual.Contains(item.Text);
                item.ForeColor = exists ? Color.DarkGreen : Color.Gray;
                item.ToolTipText = exists ? "موجود في قاعدة البيانات الحالية" : "غير موجود في قاعدة البيانات الحالية";
            }
        }
        catch { }
    }

    private void OpenTable(string table)
    {
        try
        {
            using var form = new Form { Text = table, Width = 1150, Height = 720, StartPosition = FormStartPosition.CenterParent, RightToLeft = RightToLeft.Yes, RightToLeftLayout = true };
            form.Controls.Add(new TableBrowserControl(_db, [table]));
            form.ShowDialog(this);
        }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "فتح الجدول", MessageBoxButtons.OK, MessageBoxIcon.Error); }
    }
}