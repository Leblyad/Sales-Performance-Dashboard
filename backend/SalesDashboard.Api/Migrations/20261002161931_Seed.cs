using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesDashboard.Migrations
{
    /// <inheritdoc />
    public partial class Seed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            using Stream stream = typeof(Seed).Assembly.GetManifestResourceStream("SalesDashboard.seed.sql")
                ?? throw new InvalidOperationException("seed.sql is missing from the assembly.");
            using var reader = new StreamReader(stream);
            migrationBuilder.Sql(reader.ReadToEnd());
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM sale_items;
                DELETE FROM sales;
                DELETE FROM managers;
                DELETE FROM customers;
                DELETE FROM products;
                DELETE FROM categories;
                DELETE FROM positions;
                DELETE FROM teams;
                """);
        }
    }
}
