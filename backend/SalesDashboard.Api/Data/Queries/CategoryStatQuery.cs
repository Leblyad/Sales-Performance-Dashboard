using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;
using SalesDashboard.Domain;

namespace SalesDashboard.Data.Queries;

public static class CategoryStatQuery
{
    public static Task<List<CategoryStat>> GetAsync(
        AppDbContext db,
        DateTime dateFrom,
        DateTime dateTo)
    {
        return db.Categories
            .Join(
                db.Products,
                category => category.Id,
                product => product.CategoryId,
                (category, product) => new { category, product })
            .Join(
                db.SaleItems.Where(item =>
                    item.Sale.Status == SaleStatus.Paid
                    && item.Sale.Date >= dateFrom
                    && item.Sale.Date <= dateTo),
                row => row.product.Id,
                item => item.ProductId,
                (row, item) => new { row.category, item })
            .GroupBy(row => new { row.category.Id, row.category.Name })
            .Select(group => new CategoryStat
            {
                Id = group.Key.Id,
                Name = group.Key.Name,
                SalesCount = group.Select(row => row.item.SaleId).Distinct().Count(),
                Revenue = group.Sum(row => row.item.Price * row.item.Quantity),
            })
            .ToListAsync();
    }
}
