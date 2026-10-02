using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesDashboard.Migrations
{
    /// <inheritdoc />
    public partial class ManagerDynamics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE FUNCTION manager_dynamics(manager_id uuid, date_from date, date_to date)
                RETURNS TABLE (
                    "Date" date,
                    "Revenue" numeric,
                    "GrossProfit" numeric,
                    "SalesCount" bigint
                )
                LANGUAGE sql
                AS $$
                    SELECT
                        sale."Date"::date AS "Date",
                        SUM(item."Price" * item."Quantity") AS "Revenue",
                        SUM(item."Price" * item."Quantity") - SUM(item."Cost" * item."Quantity") AS "GrossProfit",
                        COUNT(DISTINCT sale."Id") AS "SalesCount"
                    FROM sales AS sale
                    INNER JOIN sale_items AS item ON item."SaleId" = sale."Id"
                    WHERE sale."ManagerId" = manager_id
                        AND sale."Status" = 0
                    GROUP BY sale."Date"::date
                    ORDER BY "Date";
                $$;
                """);

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

            migrationBuilder.Sql(
                """
                DROP FUNCTION manager_dynamics(uuid, date, date);
                """);
        }
    }
}
