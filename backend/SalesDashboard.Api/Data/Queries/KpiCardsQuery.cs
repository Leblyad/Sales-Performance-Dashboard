using Mapster;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;
using SalesDashboard.Dto;

namespace SalesDashboard.Data.Queries;

public static class KpiCardsQuery
{
    public static async Task<KpiCardsDto> GetAsync(AppDbContext db, KpiCardsQueryDto query)
    {
        DateTime periodFrom = AsUtcTimestamp(query.PeriodFrom);
        DateTime periodTo = AsUtcTimestamp(query.PeriodTo);
        KpiCards cards = await db.Database
            .SqlQuery<KpiCards>($"SELECT * FROM kpi_cards({periodFrom}, {periodTo})")
            .SingleAsync();

        return cards.Adapt<KpiCardsDto>();
    }

    static DateTime AsUtcTimestamp(DateTime value) =>
        value.Kind == DateTimeKind.Local
            ? value.ToUniversalTime()
            : DateTime.SpecifyKind(value, DateTimeKind.Utc);
}
