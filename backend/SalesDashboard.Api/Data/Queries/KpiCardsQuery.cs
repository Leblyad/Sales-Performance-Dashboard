using Mapster;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;
using SalesDashboard.Dto;

namespace SalesDashboard.Data.Queries;

public static class KpiCardsQuery
{
    public static async Task<KpiCardsDto> GetAsync(AppDbContext db, KpiCardsQueryDto query)
    {
        KpiCards cards = await db.Database
            .SqlQuery<KpiCards>($"SELECT * FROM kpi_cards({query.PeriodFrom}, {query.PeriodTo})")
            .SingleAsync();

        return cards.Adapt<KpiCardsDto>();
    }
}
