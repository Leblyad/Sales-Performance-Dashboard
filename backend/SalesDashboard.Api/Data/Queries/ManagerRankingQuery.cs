using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Views;

namespace SalesDashboard.Data.Queries;

public enum ManagerRankingMode
{
    GrossProfit,
    AverageCheck,
}

public static class ManagerRankingQuery
{
    public static Task<List<ManagerRanking>> GetAsync(
        AppDbContext db,
        ManagerRankingMode mode,
        int skip,
        int take)
    {
        IQueryable<ManagerRanking> rankings = mode switch
        {
            ManagerRankingMode.GrossProfit => db.ManagerRankings.OrderByDescending(ranking => ranking.GrossProfit),
            ManagerRankingMode.AverageCheck => db.ManagerRankings.OrderByDescending(ranking => ranking.AverageCheck),
            _ => throw new ArgumentOutOfRangeException(nameof(mode)),
        };

        return rankings.Skip(skip).Take(take).ToListAsync();
    }
}
