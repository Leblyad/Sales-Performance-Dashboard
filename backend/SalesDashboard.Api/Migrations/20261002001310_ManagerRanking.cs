using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SalesDashboard.Migrations
{
    /// <inheritdoc />
    public partial class ManagerRanking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                CREATE VIEW manager_rankings AS
                WITH paid_sales AS (
                    SELECT
                        sale."Id" AS sale_id,
                        sale."ManagerId" AS manager_id,
                        SUM(item."Price" * item."Quantity") AS sale_revenue,
                        SUM(item."Cost" * item."Quantity") AS sale_cost
                    FROM sales AS sale
                    INNER JOIN sale_items AS item ON item."SaleId" = sale."Id"
                    WHERE sale."Status" = 0
                    GROUP BY sale."Id", sale."ManagerId"
                )
                SELECT
                    manager."Id" AS "ManagerId",
                    manager."Name" AS "Name",
                    manager."Avatar" AS "Avatar",
                    manager."IsActive" AS "IsActive",
                    team."Name" AS "TeamName",
                    position."Name" AS "PositionName",
                    SUM(paid_sales.sale_revenue) - SUM(paid_sales.sale_cost) AS "GrossProfit",
                    AVG(paid_sales.sale_revenue) AS "AverageCheck"
                FROM paid_sales
                INNER JOIN managers AS manager ON manager."Id" = paid_sales.manager_id
                INNER JOIN teams AS team ON team."Id" = manager."TeamId"
                INNER JOIN positions AS position ON position."Id" = manager."PositionId"
                GROUP BY
                    manager."Id",
                    manager."Name",
                    manager."Avatar",
                    manager."IsActive",
                    team."Name",
                    position."Name";
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DROP VIEW manager_rankings;
                """);
        }
    }
}
