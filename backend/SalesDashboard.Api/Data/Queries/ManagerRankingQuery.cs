using Mapster;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Views;
using SalesDashboard.Dto;

namespace SalesDashboard.Data.Queries;

public enum ManagerRankingMode
{
    GrossProfit,
    AverageCheck,
}

public static class ManagerRankingQuery
{
    public static async Task<SortedPageDto<ManagerRankingDto, ManagerRankingMode>> GetAsync(
        AppDbContext db,
        ManagerRankingQueryDto query)
    {
        IQueryable<ManagerRanking> rankings = query.Mode switch
        {
            ManagerRankingMode.GrossProfit => db.ManagerRankings.OrderByDescending(ranking => ranking.GrossProfit),
            ManagerRankingMode.AverageCheck => db.ManagerRankings.OrderByDescending(ranking => ranking.AverageCheck),
            _ => throw new ArgumentOutOfRangeException(nameof(query.Mode)),
        };

        List<ManagerRanking> items = await rankings.Skip(query.Skip).Take(query.Take).ToListAsync();

        return new SortedPageDto<ManagerRankingDto, ManagerRankingMode>
        {
            Items = items.Adapt<List<ManagerRankingDto>>(),
            Skip = query.Skip,
            Take = query.Take,
            Sort = query.Mode,
        };
    }
}
