using System.Data;
using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;

namespace AlSaqarERP.Desktop;

public sealed record DbColumnInfo(
    string Name, string SqlType, bool Nullable, bool Identity, bool Computed,
    bool HasDefault, bool PrimaryKey, bool Searchable);

public sealed record DbProcedureParameter(string Name, string SqlType, short MaxLength, bool IsOutput);

public sealed class SqlServerService
{
    private readonly AppSettings _settings;
    private static readonly Regex NamePattern = new(@"^(?:\[?(?<schema>[A-Za-z_][A-Za-z0-9_]*)\]?\.)?\[?(?<table>[A-Za-z_][A-Za-z0-9_]*)\]?$", RegexOptions.Compiled);

    public SqlServerService(AppSettings settings) => _settings = settings;

    public SqlConnection CreateConnection() => new(_settings.BuildConnectionString());

    public string TestConnection()
    {
        using var connection = CreateConnection();
        connection.Open();
        using var cmd = new SqlCommand("SELECT CONCAT(@@SERVERNAME, N' / ', DB_NAME())", connection);
        return Convert.ToString(cmd.ExecuteScalar()) ?? "اتصال ناجح";
    }

    public IReadOnlyList<string> ListTables()
    {
        using var connection = CreateConnection();
        connection.Open();
        using var cmd = new SqlCommand("""
            SELECT s.name + N'.' + t.name
            FROM sys.tables t
            JOIN sys.schemas s ON s.schema_id=t.schema_id
            WHERE t.is_ms_shipped=0
            ORDER BY s.name,t.name
            """, connection);
        var result = new List<string>();
        using var reader = cmd.ExecuteReader();
        while (reader.Read()) result.Add(reader.GetString(0));
        return result;
    }

    public IReadOnlyList<DbColumnInfo> GetColumns(string qualifiedName)
    {
        var (schema, table) = ParseName(qualifiedName);
        using var connection = CreateConnection();
        connection.Open();
        using var cmd = new SqlCommand("""
            SELECT c.name, ty.name, c.is_nullable, c.is_identity, c.is_computed,
                   CASE WHEN dc.object_id IS NULL THEN CAST(0 AS bit) ELSE CAST(1 AS bit) END AS HasDefault,
                   CASE WHEN pk.column_id IS NULL THEN CAST(0 AS bit) ELSE CAST(1 AS bit) END AS IsPrimaryKey,
                   CASE WHEN ty.name IN ('char','nchar','varchar','nvarchar','text','ntext','uniqueidentifier') THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END AS Searchable
            FROM sys.tables t
            JOIN sys.schemas s ON s.schema_id=t.schema_id
            JOIN sys.columns c ON c.object_id=t.object_id
            JOIN sys.types ty ON ty.user_type_id=c.user_type_id
            LEFT JOIN sys.default_constraints dc ON dc.parent_object_id=c.object_id AND dc.parent_column_id=c.column_id
            LEFT JOIN (
                SELECT ic.object_id, ic.column_id
                FROM sys.indexes i
                JOIN sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id
                WHERE i.is_primary_key=1
            ) pk ON pk.object_id=c.object_id AND pk.column_id=c.column_id
            WHERE s.name=@schema AND t.name=@table
            ORDER BY c.column_id
            """, connection);
        cmd.Parameters.Add("@schema", SqlDbType.NVarChar, 128).Value = schema;
        cmd.Parameters.Add("@table", SqlDbType.NVarChar, 128).Value = table;
        using var reader = cmd.ExecuteReader();
        var cols = new List<DbColumnInfo>();
        while (reader.Read())
        {
            cols.Add(new DbColumnInfo(
                reader.GetString(0), reader.GetString(1), reader.GetBoolean(2),
                reader.GetBoolean(3), reader.GetBoolean(4), reader.GetBoolean(5),
                reader.GetBoolean(6), reader.GetBoolean(7)));
        }
        if (cols.Count == 0) throw new InvalidOperationException($"الجدول {qualifiedName} غير موجود أو لا توجد صلاحية لقراءته.");
        return cols;
    }

    public DataTable ReadTable(string qualifiedName, string? search = null, int top = 500)
    {
        var (schema, table) = ParseName(qualifiedName);
        var known = ListTables();
        var canonical = $"{schema}.{table}";
        if (!known.Contains(canonical, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("يجب اختيار جدول موجود في قاعدة البيانات.");
        var columns = GetColumns(canonical);
        var searchable = columns.Where(c => c.Searchable).Select(c => c.Name).ToArray();
        using var connection = CreateConnection();
        connection.Open();
        var sql = $"SELECT TOP ({Math.Clamp(top, 1, 2000)}) * FROM {Quote(schema)}.{Quote(table)}";
        if (!string.IsNullOrWhiteSpace(search) && searchable.Length > 0)
            sql += " WHERE " + string.Join(" OR ", searchable.Select(c => $"TRY_CONVERT(nvarchar(4000), {Quote(c)}) LIKE @search"));
        sql += " ORDER BY (SELECT NULL)";
        using var cmd = new SqlCommand(sql, connection);
        if (!string.IsNullOrWhiteSpace(search) && searchable.Length > 0)
            cmd.Parameters.Add("@search", SqlDbType.NVarChar, 4000).Value = "%" + search.Trim() + "%";
        using var adapter = new SqlDataAdapter(cmd);
        var result = new DataTable(canonical);
        adapter.Fill(result);
        return result;
    }

    public DataTable ReadSchemaCatalog()
    {
        using var connection = CreateConnection();
        connection.Open();
        using var cmd = new SqlCommand("""
            SELECT s.name AS [Schema], t.name AS [Table], c.column_id AS [Position],
                   c.name AS [Column], ty.name AS [SQL Type], c.max_length AS [Max Length],
                   c.precision AS [Precision], c.scale AS [Scale], c.is_nullable AS [Nullable],
                   c.is_identity AS [Identity], c.is_computed AS [Computed],
                   CASE WHEN pk.column_id IS NULL THEN CAST(0 AS bit) ELSE CAST(1 AS bit) END AS [Primary Key]
            FROM sys.tables t
            JOIN sys.schemas s ON s.schema_id=t.schema_id
            JOIN sys.columns c ON c.object_id=t.object_id
            JOIN sys.types ty ON ty.user_type_id=c.user_type_id
            LEFT JOIN (
                SELECT ic.object_id, ic.column_id FROM sys.indexes i
                JOIN sys.index_columns ic ON ic.object_id=i.object_id AND ic.index_id=i.index_id
                WHERE i.is_primary_key=1
            ) pk ON pk.object_id=c.object_id AND pk.column_id=c.column_id
            WHERE t.is_ms_shipped=0
            ORDER BY s.name,t.name,c.column_id
            """, connection);
        using var adapter = new SqlDataAdapter(cmd);
        var result = new DataTable("DatabaseSchema");
        adapter.Fill(result);
        return result;
    }

    public IReadOnlyList<string> ListReportProcedures()
    {
        var actual = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        using var connection = CreateConnection();
        connection.Open();
        using var cmd = new SqlCommand("SELECT s.name + N'.' + p.name FROM sys.procedures p JOIN sys.schemas s ON s.schema_id=p.schema_id WHERE p.is_ms_shipped=0", connection);
        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            var fullName = reader.GetString(0);
            var shortName = fullName[(fullName.LastIndexOf('.') + 1)..];
            if (ErpScreenCatalog.ReportProcedures.Contains(shortName, StringComparer.OrdinalIgnoreCase))
                actual.Add(fullName);
        }
        return actual.OrderBy(n => n).ToArray();
    }

    public IReadOnlyList<DbProcedureParameter> GetProcedureParameters(string qualifiedProcedure)
    {
        var (schema, name) = ParseName(qualifiedProcedure);
        if (!ErpScreenCatalog.ReportProcedures.Contains(name, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("هذا الإجراء ليس ضمن قائمة التقارير المسموح بتنفيذها.");
        using var connection = CreateConnection();
        connection.Open();
        using var cmd = new SqlCommand("""
            SELECT p.name, ty.name, p.max_length, p.is_output
            FROM sys.parameters p
            JOIN sys.procedures pr ON pr.object_id=p.object_id
            JOIN sys.schemas s ON s.schema_id=pr.schema_id
            JOIN sys.types ty ON ty.user_type_id=p.user_type_id
            WHERE s.name=@schema AND pr.name=@name AND p.parameter_id>0
            ORDER BY p.parameter_id
            """, connection);
        cmd.Parameters.Add("@schema", SqlDbType.NVarChar, 128).Value = schema;
        cmd.Parameters.Add("@name", SqlDbType.NVarChar, 128).Value = name;
        using var reader = cmd.ExecuteReader();
        var list = new List<DbProcedureParameter>();
        while (reader.Read())
            list.Add(new DbProcedureParameter(reader.GetString(0), reader.GetString(1), reader.GetInt16(2), reader.GetBoolean(3)));
        return list;
    }

    public DataTable RunReport(string qualifiedProcedure, IReadOnlyDictionary<string, string> values)
    {
        var (schema, name) = ParseName(qualifiedProcedure);
        if (!ErpScreenCatalog.ReportProcedures.Contains(name, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("رفض تنفيذ إجراء غير موجود في قائمة التقارير المعتمدة.");
        var parameters = GetProcedureParameters(qualifiedProcedure);
        using var connection = CreateConnection();
        connection.Open();
        using var cmd = new SqlCommand($"{Quote(schema)}.{Quote(name)}", connection) { CommandType = CommandType.StoredProcedure, CommandTimeout = 60 };
        foreach (var p in parameters.Where(p => !p.IsOutput))
        {
            values.TryGetValue(p.Name, out var raw);
            var parameter = cmd.Parameters.Add(p.Name, MapSqlType(p.SqlType));
            var trimmed = raw?.Trim() ?? "";
            parameter.Value = trimmed.Length == 0 ? DBNull.Value : ConvertParameter(trimmed, p.SqlType);
            if (p.MaxLength > 0 && p.MaxLength != -1) parameter.Size = Math.Clamp((int)p.MaxLength, 1, 4000);
        }
        using var adapter = new SqlDataAdapter(cmd);
        var data = new DataTable(name);
        adapter.Fill(data);
        return data;
    }

    public int SaveMasterData(string qualifiedName, DataTable table)
    {
        if (!ErpScreenCatalog.EditableTables.Contains(qualifiedName))
            throw new InvalidOperationException("الحفظ المباشر غير مسموح لهذا الجدول. الفواتير والسندات يجب أن تمر عبر إجراءات الترحيل المعتمدة.");
        var columns = GetColumns(qualifiedName);
        var keys = columns.Where(c => c.PrimaryKey).ToArray();
        if (keys.Length == 0) throw new InvalidOperationException("لا يمكن التعديل بأمان لأن الجدول لا يحتوي مفتاحًا أساسيًا.");
        var (schema, name) = ParseName(qualifiedName);
        var writable = columns.Where(c => !c.Identity && !c.Computed && !c.PrimaryKey).ToArray();
        using var connection = CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();
        var saved = 0;
        try
        {
            foreach (DataRow row in table.Rows)
            {
                if (row.RowState == DataRowState.Added)
                {
                    var insertCols = columns.Where(c => !c.Identity && !c.Computed && row.Table.Columns.Contains(c.Name) && row[c.Name] != DBNull.Value).ToArray();
                    if (insertCols.Length == 0) throw new InvalidOperationException("أدخل قيمًا في الصف الجديد قبل الحفظ.");
                    var columnList = string.Join(", ", insertCols.Select(c => Quote(c.Name)));
                    var parameterList = string.Join(", ", insertCols.Select((c, i) => "@v" + i));
                    var sql = $"INSERT INTO {Quote(schema)}.{Quote(name)} ({columnList}) VALUES ({parameterList})";
                    using var command = new SqlCommand(sql, connection, transaction);
                    for (int i = 0; i < insertCols.Length; i++) command.Parameters.AddWithValue("@v" + i, row[insertCols[i].Name] ?? DBNull.Value);
                    saved += command.ExecuteNonQuery();
                }
                else if (row.RowState == DataRowState.Modified)
                {
                    var changed = writable.Where(c => row.Table.Columns.Contains(c.Name) &&
                        !Equals(row[c.Name, DataRowVersion.Current], row[c.Name, DataRowVersion.Original])).ToArray();
                    if (changed.Length == 0) continue;
                    var assignments = string.Join(", ", changed.Select((c, i) => $"{Quote(c.Name)}=@v{i}"));
                    var where = string.Join(" AND ", keys.Select((c, i) => $"{Quote(c.Name)}=@pk{i}"));
                    using var command = new SqlCommand($"UPDATE {Quote(schema)}.{Quote(name)} SET {assignments} WHERE {where}", connection, transaction);
                    for (int i = 0; i < changed.Length; i++) command.Parameters.AddWithValue("@v" + i, row[changed[i].Name, DataRowVersion.Current] ?? DBNull.Value);
                    for (int i = 0; i < keys.Length; i++) command.Parameters.AddWithValue("@pk" + i, row[keys[i].Name, DataRowVersion.Original] ?? DBNull.Value);
                    saved += command.ExecuteNonQuery();
                }
            }
            transaction.Commit();
            table.AcceptChanges();
            return saved;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public int CountRows(string qualifiedName)
    {
        var (schema, name) = ParseName(qualifiedName);
        using var connection = CreateConnection();
        connection.Open();
        using var cmd = new SqlCommand($"SELECT COUNT_BIG(*) FROM {Quote(schema)}.{Quote(name)}", connection);
        return checked((int)Math.Min(Convert.ToInt64(cmd.ExecuteScalar()), int.MaxValue));
    }

    public bool TableExists(string qualifiedName)
    {
        try { return ListTables().Contains(qualifiedName, StringComparer.OrdinalIgnoreCase); }
        catch { return false; }
    }

    private static (string Schema, string Name) ParseName(string qualified)
    {
        var match = NamePattern.Match(qualified.Trim());
        if (!match.Success) throw new ArgumentException("اسم جدول أو إجراء غير صالح.");
        return (string.IsNullOrEmpty(match.Groups["schema"].Value) ? "dbo" : match.Groups["schema"].Value,
            match.Groups["table"].Value);
    }

    private static string Quote(string identifier) => "[" + identifier.Replace("]", "]]") + "]";

    private static SqlDbType MapSqlType(string type) => type.ToLowerInvariant() switch
    {
        "bigint" => SqlDbType.BigInt, "int" => SqlDbType.Int, "smallint" => SqlDbType.SmallInt,
        "tinyint" => SqlDbType.TinyInt, "bit" => SqlDbType.Bit, "decimal" or "numeric" or "money" or "smallmoney" => SqlDbType.Decimal,
        "float" => SqlDbType.Float, "real" => SqlDbType.Real, "date" => SqlDbType.Date,
        "datetime" or "datetime2" or "smalldatetime" => SqlDbType.DateTime,
        "datetimeoffset" => SqlDbType.DateTimeOffset, "time" => SqlDbType.Time,
        "uniqueidentifier" => SqlDbType.UniqueIdentifier, "binary" or "varbinary" or "image" => SqlDbType.VarBinary,
        "char" => SqlDbType.Char, "nchar" => SqlDbType.NChar, "varchar" or "text" => SqlDbType.VarChar,
        _ => SqlDbType.NVarChar
    };

    private static object ConvertParameter(string raw, string type) => type.ToLowerInvariant() switch
    {
        "int" => int.Parse(raw), "bigint" => long.Parse(raw), "smallint" => short.Parse(raw),
        "tinyint" => byte.Parse(raw), "bit" => bool.Parse(raw), "decimal" or "numeric" or "money" or "smallmoney" => decimal.Parse(raw),
        "float" => double.Parse(raw), "real" => float.Parse(raw), "date" or "datetime" or "datetime2" or "smalldatetime" => DateTime.Parse(raw),
        "uniqueidentifier" => Guid.Parse(raw), _ => raw
    };
}