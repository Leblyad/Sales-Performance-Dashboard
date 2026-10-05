using System.Text.Json;
using Mapster;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SalesDashboard.Data;
using SalesDashboard.Mapping;

namespace SalesDashboard.Tests;

[CollectionDefinition(Name)]
public sealed class QueryDbCollection : ICollectionFixture<QueryDb>
{
    public const string Name = "QueryDb";
}

public sealed class QueryDb : IAsyncLifetime
{
    public const string DatabaseName = "sales_dashboard_query_tests";

    string connectionString = string.Empty;

    public async Task InitializeAsync()
    {
        connectionString = ReadTestConnectionString();
        await CreateDatabaseAsync();
        TypeAdapterConfig.GlobalSettings.Scan(typeof(DashboardRegister).Assembly);

        await using AppDbContext db = CreateContext();
        db.Database.SetCommandTimeout(TimeSpan.FromMinutes(5));
        await db.Database.MigrateAsync();
    }

    public Task DisposeAsync() => Task.CompletedTask;

    public AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;
        return new AppDbContext(options);
    }

    public async Task ClearAsync()
    {
        await using AppDbContext db = CreateContext();
        await db.Database.ExecuteSqlRawAsync(
            """
            TRUNCATE sale_items, sales, managers, customers, products, categories, positions, teams CASCADE
            """);
    }

    async Task CreateDatabaseAsync()
    {
        var adminBuilder = new NpgsqlConnectionStringBuilder(connectionString)
        {
            Database = "postgres",
        };

        await using var admin = new NpgsqlConnection(adminBuilder.ConnectionString);
        await admin.OpenAsync();
        await using var exists = new NpgsqlCommand("SELECT 1 FROM pg_database WHERE datname = @name", admin);
        exists.Parameters.AddWithValue("name", DatabaseName);
        if (await exists.ExecuteScalarAsync() is not null)
        {
            return;
        }

        await using var create = new NpgsqlCommand($"CREATE DATABASE {DatabaseName}", admin);
        await create.ExecuteNonQueryAsync();
    }

    static string ReadTestConnectionString()
    {
        string path = Path.Combine(AppContext.BaseDirectory, "appsettings.json");
        using JsonDocument document = JsonDocument.Parse(File.ReadAllText(path));
        string raw = document.RootElement.GetProperty("ConnectionStrings").GetProperty("DefaultConnection").GetString()
            ?? throw new InvalidOperationException("DefaultConnection is missing.");
        var builder = new NpgsqlConnectionStringBuilder(raw)
        {
            Database = DatabaseName,
        };
        if (builder.Database != DatabaseName)
        {
            throw new InvalidOperationException("Refusing to use the application database.");
        }

        return builder.ConnectionString;
    }
}
