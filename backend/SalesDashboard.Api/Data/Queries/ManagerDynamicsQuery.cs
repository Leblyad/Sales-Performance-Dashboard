using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;

namespace SalesDashboard.Data.Queries;

public static class ManagerDynamicsQuery
{
    public static Task<List<ManagerDynamics>> GetAsync(
        AppDbContext db,
        Guid managerId,
        DateOnly dateFrom,
        DateOnly dateTo)
    {
        return db.Database
            .SqlQuery<ManagerDynamics>($"SELECT * FROM manager_dynamics({managerId}, {dateFrom}, {dateTo})")
            .ToListAsync();
    }
}
