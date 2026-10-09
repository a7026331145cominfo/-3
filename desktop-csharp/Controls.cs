using System.Data;
using System.Drawing.Printing;
using System.Text;
using Microsoft.Data.SqlClient;

namespace AlSaqarERP.Desktop;

public interface IRefreshable
{
    void RefreshData();
}

public sealed class ScreenHeaderControl : UserControl
{
    public ScreenHeaderControl(string title, string description, Action? refresh = null)
    {
        Height = 74;
        Dock = DockStyle.Top;
        Padding = new Padding(12, 8, 12, 6);
        RightToLeft = RightToLeft.Yes;
        var layout = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, RowCount = 2 };
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        layout.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        var heading = new Label { Text = title, AutoSize = true, Font = new Font("Segoe UI", 15, FontStyle.Bold), Dock = DockStyle.Fill };
        var sub = new Label { Text = description, AutoSize = true, ForeColor = Color.DimGray, Font = new Font("Segoe UI", 9), Dock = DockStyle.Fill };
        layout.Controls.Add(heading, 0, 0);
        layout.Controls.Add(sub, 0, 1);
        if (refresh is not null)
        {
            var button = new Button { Text = "تحديث", AutoSize = true, Dock = DockStyle.Fill };
            button.Click += (_, _) => refresh();
            layout.Controls.Add(button, 1, 0);
            layout.SetRowSpan(button, 2);
        }
        Controls.Add(layout);
    }
}

public sealed class TableBrowserControl : UserControl, IRefreshable
{
    private readonly SqlServerService _db;
    private readonly string[] _preferredTables;
    private readonly bool _masterDataEditRequested;
    private readonly ComboBox _tableSelector = new() { DropDownStyle = ComboBoxStyle.DropDownList, Width = 340 };
    private readonly TextBox _search = new() { Width = 280, PlaceholderText = "بحث في السجلات المعروضة" };
    private readonly DataGridView _grid = new()
    {
        Dock = DockStyle.Fill,
        AutoGenerateColumns = true,
        AllowUserToAddRows = false,
        AllowUserToDeleteRows = false,
        RowHeadersVisible = false,
        AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.DisplayedCells,
        SelectionMode = DataGridViewSelectionMode.CellSelect,
        MultiSelect = false,
        BackgroundColor = Color.White
    };
    private readonly Label _status = new() { AutoSize = true, Text = "جاهز" };
    private readonly Button _save = new() { Text = "حفظ بيانات أساسية", AutoSize = true, Visible = false };
    private readonly Button _newRow = new() { Text = "صف جديد", AutoSize = true, Visible = false };
    private DataTable? _data;
    private bool _loading;

    public TableBrowserControl(SqlServerService db, IEnumerable<string>? preferredTables = null, bool allowMasterDataEdit = false)
    {
        _db = db;
        _preferredTables = preferredTables?.ToArray() ?? [];
        _masterDataEditRequested = allowMasterDataEdit;
        Dock = DockStyle.Fill;
        RightToLeft = RightToLeft.Yes;
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 3, Padding = new Padding(8) };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        var toolbar = new FlowLayoutPanel { Dock = DockStyle.Fill, AutoSize = true, WrapContents = true, FlowDirection = FlowDirection.RightToLeft };
        toolbar.Controls.Add(new Label { Text = "الجدول", AutoSize = true, Padding = new Padding(4, 8, 0, 0) });
        toolbar.Controls.Add(_tableSelector);
        toolbar.Controls.Add(_search);
        var find = new Button { Text = "بحث", AutoSize = true };
        find.Click += (_, _) => RefreshData();
        _search.KeyDown += (_, e) => { if (e.KeyCode == Keys.Enter) { RefreshData(); e.SuppressKeyPress = true; } };
        _tableSelector.SelectedIndexChanged += (_, _) => UpdateEditState();
        toolbar.Controls.Add(find);
        var refresh = new Button { Text = "إعادة تحميل", AutoSize = true };
        refresh.Click += (_, _) => RefreshData();
        toolbar.Controls.Add(refresh);
        var export = new Button { Text = "تصدير CSV", AutoSize = true };
        export.Click += (_, _) => ExportCsv();
        toolbar.Controls.Add(export);
        _newRow.Click += (_, _) => AddBlankRow();
        _save.Click += (_, _) => SaveChanges();
        toolbar.Controls.Add(_newRow);
        toolbar.Controls.Add(_save);
        root.Controls.Add(toolbar, 0, 0);
        root.Controls.Add(_grid, 0, 1);
        root.Controls.Add(_status, 0, 2);
        Controls.Add(root);
        Load += (_, _) => PopulateTables();
    }

    public void RefreshData()
    {
        if (_loading) return;
        var selected = _tableSelector.SelectedItem?.ToString();
        if (string.IsNullOrWhiteSpace(selected)) return;
        _loading = true;
        try
        {
            _grid.EndEdit();
            if (_grid.DataSource is BindingSource bs) bs.EndEdit();
            _data = _db.ReadTable(selected, _search.Text, 1000);
            _grid.DataSource = _data;
            UpdateEditState();
            _status.Text = $"الجدول: {selected} — السجلات المحمّلة: {_data.Rows.Count:N0}";
        }
        catch (Exception ex) { ShowError("تعذر تحميل البيانات", ex); }
        finally { _loading = false; }
    }

    private void PopulateTables()
    {
        try
        {
            var all = _db.ListTables();
            var ordered = new List<string>();
            foreach (var name in _preferredTables)
                if (all.Contains(name, StringComparer.OrdinalIgnoreCase) && !ordered.Contains(name, StringComparer.OrdinalIgnoreCase))
                    ordered.Add(name);
            foreach (var name in all)
                if (!ordered.Contains(name, StringComparer.OrdinalIgnoreCase)) ordered.Add(name);
            _tableSelector.Items.Clear();
            _tableSelector.Items.AddRange(ordered.Cast<object>().ToArray());
            if (_tableSelector.Items.Count > 0)
            {
                _tableSelector.SelectedIndex = 0;
                RefreshData();
            }
            else _status.Text = "لم يُعثر على جداول قابلة للعرض.";
        }
        catch (Exception ex)
        {
            _status.Text = "تعذر الاتصال بقاعدة البيانات — افتح إعدادات الاتصال.";
            _tableSelector.Items.Clear();
            _tableSelector.Items.AddRange(_preferredTables.Cast<object>().ToArray());
            if (_tableSelector.Items.Count > 0) _tableSelector.SelectedIndex = 0;
            if (DesignMode) return;
            ShowError("الاتصال بقاعدة البيانات", ex, silent: true);
        }
    }

    private void UpdateEditState()
    {
        var table = _tableSelector.SelectedItem?.ToString() ?? "";
        var canEdit = _masterDataEditRequested && ErpScreenCatalog.EditableTables.Contains(table);
        _grid.ReadOnly = !canEdit;
        _grid.AllowUserToAddRows = canEdit;
        _newRow.Visible = canEdit;
        _save.Visible = canEdit;
        _status.ForeColor = canEdit ? Color.DarkSlateBlue : Color.DimGray;
        if (!canEdit && _masterDataEditRequested)
            _status.Text = "وضع القراءة: التعديل المباشر مقيّد بجدول البيانات الرئيسي المسموح.";
    }

    private void AddBlankRow()
    {
        if (_data is null || !CanEdit()) return;
        var row = _data.NewRow();
        _data.Rows.Add(row);
        if (_grid.Rows.Count > 0)
        {
            var index = _grid.Rows.Count - 1;
            _grid.CurrentCell = _grid.Rows[index].Cells.Cast<DataGridViewCell>().FirstOrDefault(c => c.Visible);
            _grid.BeginEdit(true);
        }
    }

    private bool CanEdit() => _masterDataEditRequested &&
        ErpScreenCatalog.EditableTables.Contains(_tableSelector.SelectedItem?.ToString() ?? "");

    private void SaveChanges()
    {
        if (_data is null || !CanEdit()) return;
        try
        {
            _grid.EndEdit();
            if (_grid.DataSource is BindingSource bs) bs.EndEdit();
            var changed = _data.Rows.Cast<DataRow>().Any(r => r.RowState is DataRowState.Added or DataRowState.Modified);
            if (!changed) { _status.Text = "لا توجد تغييرات للحفظ."; return; }
            var count = _db.SaveMasterData(_tableSelector.SelectedItem!.ToString()!, _data);
            _status.Text = $"تم حفظ {count:N0} تغييرًا بنجاح.";
            RefreshData();
        }
        catch (Exception ex) { ShowError("فشل حفظ التغييرات", ex); }
    }

    private void ExportCsv()
    {
        if (_data is null) { MessageBox.Show("لا توجد بيانات للتصدير."); return; }
        using var dialog = new SaveFileDialog { Filter = "CSV UTF-8 (*.csv)|*.csv", FileName = "AlSaqarERP-export.csv" };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        try
        {
            using var writer = new StreamWriter(dialog.FileName, false, new UTF8Encoding(true));
            writer.WriteLine(string.Join(",", _data.Columns.Cast<DataColumn>().Select(c => Csv(c.ColumnName))));
            foreach (DataRow row in _data.Rows)
                writer.WriteLine(string.Join(",", _data.Columns.Cast<DataColumn>().Select(c => Csv(row[c] == DBNull.Value ? "" : Convert.ToString(row[c]) ?? ""))));
            _status.Text = $"تم التصدير إلى {dialog.FileName}";
        }
        catch (Exception ex) { ShowError("فشل تصدير CSV", ex); }
    }

    private static string Csv(string value) => "\"" + value.Replace("\"", "\"\"") + "\"";
    private void ShowError(string title, Exception ex, bool silent = false)
    {
        _status.Text = ex.Message;
        if (!silent) MessageBox.Show(this, ex.Message, title, MessageBoxButtons.OK, MessageBoxIcon.Error);
    }
}

public sealed class ProcedureReportControl : UserControl, IRefreshable
{
    private readonly SqlServerService _db;
    private readonly ComboBox _procedure = new() { Width = 430, DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly DataGridView _grid = new()
    {
        Dock = DockStyle.Fill, AutoGenerateColumns = true, ReadOnly = true, RowHeadersVisible = false,
        AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.DisplayedCells, BackgroundColor = Color.White
    };
    private readonly Label _status = new() { AutoSize = true, Text = "اختر تقريرًا متاحًا ثم أدخل معلماته." };

    public ProcedureReportControl(SqlServerService db)
    {
        _db = db;
        Dock = DockStyle.Fill;
        RightToLeft = RightToLeft.Yes;
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 3, Padding = new Padding(8) };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        var toolbar = new FlowLayoutPanel { Dock = DockStyle.Fill, AutoSize = true, WrapContents = true, FlowDirection = FlowDirection.RightToLeft };
        toolbar.Controls.Add(new Label { Text = "إجراء التقرير", AutoSize = true, Padding = new Padding(4, 8, 0, 0) });
        toolbar.Controls.Add(_procedure);
        var run = new Button { Text = "عرض التقرير", AutoSize = true };
        run.Click += (_, _) => RunSelected();
        toolbar.Controls.Add(run);
        var export = new Button { Text = "تصدير CSV", AutoSize = true };
        export.Click += (_, _) => Export();
        toolbar.Controls.Add(export);
        root.Controls.Add(toolbar, 0, 0);
        root.Controls.Add(_grid, 0, 1);
        root.Controls.Add(_status, 0, 2);
        Controls.Add(root);
        Load += (_, _) => RefreshData();
    }

    public void RefreshData()
    {
        try
        {
            var procedures = _db.ListReportProcedures();
            _procedure.Items.Clear();
            _procedure.Items.AddRange(procedures.Cast<object>().ToArray());
            if (_procedure.Items.Count > 0 && _procedure.SelectedIndex < 0) _procedure.SelectedIndex = 0;
            _status.Text = $"الإجراءات المسموح بها والمتوفرة في قاعدة البيانات: {procedures.Count}";
        }
        catch (Exception ex) { _status.Text = "تعذر تحميل التقارير: " + ex.Message; }
    }

    private void RunSelected()
    {
        if (_procedure.SelectedItem is not string name) return;
        try
        {
            var parameters = _db.GetProcedureParameters(name);
            using var dialog = new ProcedureParametersDialog(name, parameters);
            if (dialog.ShowDialog(this) != DialogResult.OK) return;
            var result = _db.RunReport(name, dialog.Values);
            _grid.DataSource = result;
            _status.Text = $"التقرير {name} — عدد الصفوف: {result.Rows.Count:N0}";
        }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "تعذر تشغيل التقرير", MessageBoxButtons.OK, MessageBoxIcon.Error); }
    }

    private void Export()
    {
        if (_grid.DataSource is not DataTable data) { MessageBox.Show("شغّل التقرير أولًا."); return; }
        using var dialog = new SaveFileDialog { Filter = "CSV UTF-8 (*.csv)|*.csv", FileName = "AlSaqarERP-report.csv" };
        if (dialog.ShowDialog(this) != DialogResult.OK) return;
        using var writer = new StreamWriter(dialog.FileName, false, new UTF8Encoding(true));
        writer.WriteLine(string.Join(",", data.Columns.Cast<DataColumn>().Select(c => Csv(c.ColumnName))));
        foreach (DataRow row in data.Rows)
            writer.WriteLine(string.Join(",", data.Columns.Cast<DataColumn>().Select(c => Csv(row[c] == DBNull.Value ? "" : Convert.ToString(row[c]) ?? ""))));
        _status.Text = "تم تصدير التقرير.";
    }

    private static string Csv(string value) => "\"" + value.Replace("\"", "\"\"") + "\"";
}

public sealed class ProcedureParametersDialog : Form
{
    private readonly Dictionary<string, TextBox> _inputs = new(StringComparer.OrdinalIgnoreCase);
    public IReadOnlyDictionary<string, string> Values => _inputs.ToDictionary(k => k.Key, v => v.Value.Text, StringComparer.OrdinalIgnoreCase);

    public ProcedureParametersDialog(string procedureName, IReadOnlyList<DbProcedureParameter> parameters)
    {
        Text = "معلمات التقرير — " + procedureName;
        Width = 620; Height = Math.Clamp(160 + parameters.Count * 54, 240, 760);
        StartPosition = FormStartPosition.CenterParent; RightToLeft = RightToLeft.Yes; RightToLeftLayout = true;
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, RowCount = parameters.Count + 2, Padding = new Padding(12), AutoScroll = true };
        root.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 170));
        root.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        var info = new Label { Text = "املأ معلمات الإجراء وفق الفترة والفرع المطلوبين. اترك المعلمة فارغة فقط إذا كان الإجراء يقبل NULL.", AutoSize = true, MaximumSize = new Size(550, 60) };
        root.Controls.Add(info, 0, 0); root.SetColumnSpan(info, 2);
        var row = 1;
        foreach (var p in parameters.Where(p => !p.IsOutput))
        {
            var label = new Label { Text = $"{p.Name} ({p.SqlType})", AutoSize = true, Anchor = AnchorStyles.Right, Padding = new Padding(0, 7, 0, 0) };
            var input = new TextBox { Dock = DockStyle.Fill };
            if (p.Name.Contains("date", StringComparison.OrdinalIgnoreCase) && p.SqlType.Contains("date", StringComparison.OrdinalIgnoreCase))
                input.Text = DateTime.Today.ToString("yyyy-MM-dd");
            root.Controls.Add(label, 0, row); root.Controls.Add(input, 1, row);
            _inputs[p.Name] = input; row++;
        }
        var buttons = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, Dock = DockStyle.Fill, AutoSize = true };
        var execute = new Button { Text = "تنفيذ التقرير", AutoSize = true };
        execute.Click += (_, _) => { DialogResult = DialogResult.OK; Close(); };
        var cancel = new Button { Text = "إلغاء", AutoSize = true };
        cancel.Click += (_, _) => { DialogResult = DialogResult.Cancel; Close(); };
        buttons.Controls.Add(execute); buttons.Controls.Add(cancel);
        root.Controls.Add(buttons, 0, row); root.SetColumnSpan(buttons, 2);
        Controls.Add(root);
    }
}

public sealed class RecordPickerDialog : Form
{
    private readonly DataGridView _grid = new() { Dock = DockStyle.Fill, ReadOnly = true, AutoGenerateColumns = true, SelectionMode = DataGridViewSelectionMode.FullRowSelect, MultiSelect = false };
    private readonly TextBox _search = new() { Width = 260, PlaceholderText = "ابحث في السجل" };
    private readonly SqlServerService _db;
    private readonly string _table;
    private DataTable? _data;
    public DataRow? SelectedRecord => _grid.CurrentRow?.DataBoundItem is DataRowView view ? view.Row : null;

    public RecordPickerDialog(SqlServerService db, string table)
    {
        _db = db; _table = table;
        Text = "اختيار سجل — " + table; Width = 950; Height = 620; StartPosition = FormStartPosition.CenterParent;
        RightToLeft = RightToLeft.Yes; RightToLeftLayout = true;
        var root = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, RowCount = 3, Padding = new Padding(8) };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize)); root.RowStyles.Add(new RowStyle(SizeType.Percent, 100)); root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        var bar = new FlowLayoutPanel { AutoSize = true, Dock = DockStyle.Fill, FlowDirection = FlowDirection.RightToLeft };
        bar.Controls.Add(_search);
        var find = new Button { Text = "بحث", AutoSize = true }; find.Click += (_, _) => LoadRows();
        bar.Controls.Add(find);
        var ok = new Button { Text = "اختيار", AutoSize = true }; ok.Click += (_, _) => { if (_grid.CurrentRow is not null) DialogResult = DialogResult.OK; else MessageBox.Show("اختر سجلًا."); };
        var cancel = new Button { Text = "إلغاء", AutoSize = true }; cancel.Click += (_, _) => DialogResult = DialogResult.Cancel;
        var footer = new FlowLayoutPanel { AutoSize = true, Dock = DockStyle.Fill, FlowDirection = FlowDirection.LeftToRight };
        footer.Controls.Add(ok); footer.Controls.Add(cancel);
        root.Controls.Add(bar, 0, 0); root.Controls.Add(_grid, 0, 1); root.Controls.Add(footer, 0, 2);
        Controls.Add(root);
        Load += (_, _) => LoadRows();
        _search.KeyDown += (_, e) => { if (e.KeyCode == Keys.Enter) { LoadRows(); e.SuppressKeyPress = true; } };
        _grid.CellDoubleClick += (_, _) => { if (_grid.CurrentRow is not null) DialogResult = DialogResult.OK; };
    }

    private void LoadRows()
    {
        try { _data = _db.ReadTable(_table, _search.Text); _grid.DataSource = _data; }
        catch (Exception ex) { MessageBox.Show(this, ex.Message, "البحث عن سجل", MessageBoxButtons.OK, MessageBoxIcon.Error); }
    }
}

public sealed class VoucherPrintDialog : Form
{
    private readonly string _title;
    private readonly DataTable _data;
    public VoucherPrintDialog(string title, DataTable data)
    {
        _title = title; _data = data;
        Text = "معاينة الطباعة"; Width = 1000; Height = 700; StartPosition = FormStartPosition.CenterParent;
        RightToLeft = RightToLeft.Yes; RightToLeftLayout = true;
        var grid = new DataGridView { Dock = DockStyle.Fill, ReadOnly = true, AutoGenerateColumns = true, DataSource = data, AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.DisplayedCells };
        var button = new Button { Text = "طباعة", AutoSize = true, Dock = DockStyle.Top };
        button.Click += (_, _) => Print();
        Controls.Add(grid); Controls.Add(button);
    }
    private void Print()
    {
        using var doc = new PrintDocument();
        var rowIndex = 0;
        doc.DocumentName = _title;
        doc.PrintPage += (_, e) =>
        {
            var y = 60f;
            e.Graphics!.DrawString(_title, new Font("Segoe UI", 15, FontStyle.Bold), Brushes.Black, 40, y); y += 42;
            for (int c = 0; c < _data.Columns.Count; c++)
                e.Graphics!.DrawString(_data.Columns[c].ColumnName, new Font("Segoe UI", 8, FontStyle.Bold), Brushes.Black, 40 + c * 110, y);
            y += 22;
            while (rowIndex < _data.Rows.Count && y < e.MarginBounds.Bottom)
            {
                for (int c = 0; c < _data.Columns.Count; c++)
                    e.Graphics!.DrawString(Convert.ToString(_data.Rows[rowIndex][c]) ?? "", new Font("Segoe UI", 8), Brushes.Black, 40 + c * 110, y);
                rowIndex++; y += 20;
            }
            e.HasMorePages = rowIndex < _data.Rows.Count;
        };
        using var preview = new PrintPreviewDialog { Document = doc, Width = 1100, Height = 800 };
        preview.ShowDialog(this);
    }
}

public sealed class ExportProjectDialog : Form
{
    public ExportProjectDialog()
    {
        Text = "معلومات تشغيل مشروع C#"; Width = 680; Height = 300; StartPosition = FormStartPosition.CenterParent;
        RightToLeft = RightToLeft.Yes; RightToLeftLayout = true;
        var text = new TextBox
        {
            Dock = DockStyle.Fill, Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Vertical,
            Text = "تطبيق سطح مكتب Windows Forms بـ C# و.NET 8.\r\nافتح AlSaqarERP.Desktop.csproj في Visual Studio.\r\nيستخدم Microsoft.Data.SqlClient للوصول إلى SQL Server.\r\nملفات الواجهة الأصلية كانت React/TypeScript؛ تم نقل الشاشات المشتركة ووحدات العمل إلى عناصر C# مستقلة."
        };
        Controls.Add(text);
    }
}