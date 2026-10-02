using Mapster;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;
using SalesDashboard.Dto;

namespace SalesDashboard.Data.Queries;

public static class ManagerDynamicsQuery
{
    public static async Task<List<ManagerDynamicsDto>> GetAsync(AppDbContext db, ManagerDynamicsQueryDto query)
    {
        List<ManagerDynamics> rows = await db.Database
            .SqlQuery<ManagerDynamics>($"SELECT * FROM manager_dynamics({query.ManagerId}, {query.DateFrom}, {query.DateTo})")
            .ToListAsync();

        return rows.Adapt<List<ManagerDynamicsDto>>();
    }
}
