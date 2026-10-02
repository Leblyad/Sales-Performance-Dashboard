using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesDashboard.Migrations
{
    /// <inheritdoc />
    public partial class MarginNullOnZeroDivide : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE OR REPLACE FUNCTION kpi_cards(period_from timestamp with time zone, period_to timestamp with time zone)
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
                    SELECT
                        SUM(item."Price" * item."Quantity") AS "Revenue",
                        SUM(item."Cost" * item."Quantity") AS "Cost",
                        SUM(item."Price" * item."Quantity") - SUM(item."Cost" * item."Quantity") AS "GrossProfit",
                        (SUM(item."Price" * item."Quantity") - SUM(item."Cost" * item."Quantity"))
                            / NULLIF(SUM(item."Price" * item."Quantity"), 0) AS "Margin",
                        COUNT(DISTINCT sale."Id") AS "SalesCount",
                        (
                            SELECT AVG(paid_sale.sale_revenue)
                            FROM (
                                SELECT SUM(line."Price" * line."Quantity") AS sale_revenue
                                FROM sales AS paid
                                INNER JOIN sale_items AS line ON line."SaleId" = paid."Id"
                                WHERE paid."Status" = 0
                                GROUP BY paid."Id"
                            ) AS paid_sale
                        ) AS "AverageCheck"
                    FROM sales AS sale
                    INNER JOIN sale_items AS item ON item."SaleId" = sale."Id"
                    WHERE sale."Status" = 0;
                $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE OR REPLACE FUNCTION kpi_cards(period_from timestamp with time zone, period_to timestamp with time zone)
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
                    SELECT
                        SUM(item."Price" * item."Quantity") AS "Revenue",
                        SUM(item."Cost" * item."Quantity") AS "Cost",
                        SUM(item."Price" * item."Quantity") - SUM(item."Cost" * item."Quantity") AS "GrossProfit",
                        (SUM(item."Price" * item."Quantity") - SUM(item."Cost" * item."Quantity")) / SUM(item."Price" * item."Quantity") AS "Margin",
                        COUNT(DISTINCT sale."Id") AS "SalesCount",
                        (
                            SELECT AVG(paid_sale.sale_revenue)
                            FROM (
                                SELECT SUM(line."Price" * line."Quantity") AS sale_revenue
                                FROM sales AS paid
                                INNER JOIN sale_items AS line ON line."SaleId" = paid."Id"
                                WHERE paid."Status" = 0
                                GROUP BY paid."Id"
                            ) AS paid_sale
                        ) AS "AverageCheck"
                    FROM sales AS sale
                    INNER JOIN sale_items AS item ON item."SaleId" = sale."Id"
                    WHERE sale."Status" = 0;
                $$;
                """);
        }
    }
}
