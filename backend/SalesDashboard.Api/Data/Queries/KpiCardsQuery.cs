using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;

namespace SalesDashboard.Data.Queries;

public static class KpiCardsQuery
{
    public static Task<KpiCards> GetAsync(AppDbContext db, DateTime periodFrom, DateTime periodTo)
    {
        return db.Database
            .SqlQuery<KpiCards>($"SELECT * FROM kpi_cards({periodFrom}, {periodTo})")
            .SingleAsync();
    }
}
