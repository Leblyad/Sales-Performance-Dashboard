using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesDashboard.Migrations
{
    /// <inheritdoc />
    public partial class KpiCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE FUNCTION kpi_cards(period_from timestamp with time zone, period_to timestamp with time zone)
                RETURNS TABLE (
                    "Revenue" numeric,
                    "Cost" numeric,
                    "GrossProfit" numeric,
                    "Margin" numeric,
                    "SalesCount" bigint,
                    "AverageCheck" numeric
                )
                LANGUAGE sql
                AS $$
                    WITH paid_sales AS (
                        SELECT
                            SUM(item."Price" * item."Quantity") AS sale_revenue,
                            SUM(item."Cost" * item."Quantity") AS sale_cost
                        FROM sales AS sale
                        INNER JOIN sale_items AS item ON item."SaleId" = sale."Id"
                        WHERE sale."Status" = 0
                        GROUP BY sale."Id"
                    )
                    SELECT
                        SUM(paid_sales.sale_revenue) AS "Revenue",
                        SUM(paid_sales.sale_cost) AS "Cost",
                        SUM(paid_sales.sale_revenue) - SUM(paid_sales.sale_cost) AS "GrossProfit",
                        (SUM(paid_sales.sale_revenue) - SUM(paid_sales.sale_cost)) / SUM(paid_sales.sale_revenue) AS "Margin",
                        COUNT(*) AS "SalesCount",
                        AVG(paid_sales.sale_revenue) AS "AverageCheck"
                    FROM paid_sales;
                $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP FUNCTION kpi_cards(timestamp with time zone, timestamp with time zone);
                """);
        }
    }
}
