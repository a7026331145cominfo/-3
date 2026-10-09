using System.Drawing;

namespace AlSaqarERP.Desktop;

public sealed class MainForm : Form
{
    private readonly AppSettings _settings;
    private readonly SqlServerService _db;
    private readonly TabControl _tabs = new() { Dock = DockStyle.Fill };
    private readonly ToolStripStatusLabel _status = new() { Spring = true, TextAlign = ContentAlignment.MiddleRight };
    private readonly ToolStripStatusLabel _dbStatus = new() { Text = "قاعدة البيانات: غير متصلة" };

    public MainForm()
    {
        _settings = AppSettings.Load();
        _db = new SqlServerService(_settings);
        Text = "الصقر ERP — تطبيق سطح المكتب C#";
        Width = 1500; Height = 920; WindowState = FormWindowState.Maximized;
        StartPosition = FormStartPosition.CenterScreen;
        RightToLeft = RightToLeft.Yes; RightToLeftLayout = true;
        Font = new Font("Segoe UI", 9);
        BuildShell();
        OpenScreen("dashboard");
    }

    private void BuildShell()
    {
        var menu = new MenuStrip { Dock = DockStyle.Top, RightToLeft = RightToLeft.Yes };
        foreach (var group in ErpScreenCatalog.Screens.Where(s => s.Key != "connection").GroupBy(s => s.Category))
        {
            var category = new ToolStripMenuItem(group.Key);
            foreach (var screen in group)
            {
                var item = new ToolStripMenuItem(screen.Title) { ToolTipText = screen.Description };
                var key = screen.Key;
                item.Click += (_, _) => OpenScreen(key);
                category.DropDownItems.Add(item);
            }
            menu.Items.Add(category);
        }
        var settingsMenu = new ToolStripMenuItem("الإعدادات");
        var connection = new ToolStripMenuItem("إعداد الاتصال بقاعدة البيانات");
        connection.Click += (_, _) => ShowConnectionSettings();
        var info = new ToolStripMenuItem("معلومات المشروع");
        info.Click += (_, _) => { using var dialog = new ExportProjectDialog(); dialog.ShowDialog(this); };
        var refresh = new ToolStripMenuItem("تحديث الشاشة الحالية");
        refresh.Click += (_, _) => RefreshCurrentScreen();
        var close = new ToolStripMenuItem("إغلاق الشاشة الحالية");
        close.Click += (_, _) => CloseCurrentTab();
        settingsMenu.DropDownItems.Add(connection);
        settingsMenu.DropDownItems.Add(refresh);
        settingsMenu.DropDownItems.Add(close);
        settingsMenu.DropDownItems.Add(new ToolStripSeparator());
        settingsMenu.DropDownItems.Add(info);
        menu.Items.Add(settingsMenu);

        var status = new StatusStrip();
        status.Items.Add(_status);
        status.Items.Add(_dbStatus);
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 3, Margin = Padding.Empty };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.Controls.Add(menu, 0, 0);
        root.Controls.Add(_tabs, 0, 1);
        root.Controls.Add(status, 0, 2);
        Controls.Add(root);
        MainMenuStrip = menu;
        _tabs.SelectedIndexChanged += (_, _) => UpdateStatus();
        var context = new ContextMenuStrip();
        var closeTab = new ToolStripMenuItem("إغلاق علامة التبويب الحالية");
        closeTab.Click += (_, _) => CloseCurrentTab();
        context.Items.Add(closeTab);
        _tabs.ContextMenuStrip = context;
        Shown += (_, _) => CheckConnectionQuietly();
    }

    public void OpenScreen(string key)
    {
        if (key == "connection") { ShowConnectionSettings(); return; }
        var existing = _tabs.TabPages.Cast<TabPage>().FirstOrDefault(t => string.Equals(t.Tag as string, key, StringComparison.OrdinalIgnoreCase));
        if (existing is not null) { _tabs.SelectedTab = existing; return; }
        var definition = ErpScreenCatalog.Screens.FirstOrDefault(s => s.Key == key);
        if (definition is null) return;
        UserControl view = key switch
        {
            "dashboard" => new DashboardScreen(_db),
            "accounting" => new AccountingCenterScreen(_db),
            "vouchers" => new FinancialVouchersScreen(_db),
            "sales" => new SalesEntryScreen(_db),
            "purchases" => new PurchaseEntryScreen(_db),
            "inventory" => new InventoryCenterScreen(_db),
            "domains" => new DomainCentersScreen(_db),
            "reports" => new ReportsScreen(_db),
            "security" => new SecurityAdminScreen(_db),
            "schema" => new SchemaExplorerScreen(_db),
            "links" => CreateLinkScreen(),
            _ => new WorkspaceScreen(_db, definition, definition.AllowMasterDataEdit)
        };
        var page = new TabPage(definition.Title) { Tag = key, Padding = new Padding(2) };
        page.Controls.Add(view);
        view.Dock = DockStyle.Fill;
        _tabs.TabPages.Add(page);
        _tabs.SelectedTab = page;
        _status.Text = definition.Description;
        UpdateStatus();
    }

    private UserControl CreateLinkScreen()
    {
        var links = new FullSystemLinkScreen(_db);
        links.OpenScreenRequested += OpenScreen;
        return links;
    }

    private void ShowConnectionSettings()
    {
        using var form = new ConnectionSettingsForm(_settings, CheckConnectionQuietly);
        form.ShowDialog(this);
        UpdateStatus();
    }

    private void CheckConnectionQuietly()
    {
        try
        {
            var server = _db.TestConnection();
            _dbStatus.Text = "متصل: " + server;
            _dbStatus.ForeColor = Color.DarkGreen;
            foreach (TabPage tab in _tabs.TabPages)
                if (tab.Controls.Count > 0 && tab.Controls[0] is IRefreshable refreshable)
                    refreshable.RefreshData();
        }
        catch (Exception ex)
        {
            _dbStatus.Text = "قاعدة البيانات: غير متصلة";
            _dbStatus.ForeColor = Color.DarkRed;
            _status.Text = ex.Message;
        }
    }

    private void RefreshCurrentScreen()
    {
        if (_tabs.SelectedTab?.Controls.Count > 0 && _tabs.SelectedTab.Controls[0] is IRefreshable refreshable)
            refreshable.RefreshData();
        UpdateStatus();
    }

    private void CloseCurrentTab()
    {
        if (_tabs.SelectedTab is null || string.Equals(_tabs.SelectedTab.Tag as string, "dashboard", StringComparison.OrdinalIgnoreCase))
            return;
        var tab = _tabs.SelectedTab;
        _tabs.TabPages.Remove(tab);
        tab.Dispose();
        UpdateStatus();
    }

    private void UpdateStatus()
    {
        if (_tabs.SelectedTab is null) return;
        _status.Text = _tabs.SelectedTab.Text;
    }
}