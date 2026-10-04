using Mapster;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Data.Queries;

public enum CategoryStatMode
{
    SalesCount,
    Revenue,
}

public static class CategoryStatQuery
{
    public static async Task<SortedPageDto<CategoryStatDto, CategoryStatMode>> GetAsync(
        AppDbContext db,
        CategoryStatQueryDto query)
    {
        DateTime dateFrom = AsUtcTimestamp(query.DateFrom);
        DateTime dateTo = AsUtcTimestamp(query.DateTo);
        IQueryable<CategoryStat> categories = db.Categories
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
            });

        IQueryable<CategoryStat> ordered = query.Mode switch
        {
            CategoryStatMode.SalesCount => categories.OrderByDescending(category => category.SalesCount),
            CategoryStatMode.Revenue => categories.OrderByDescending(category => category.Revenue),
            _ => throw new ArgumentOutOfRangeException(nameof(query.Mode)),
        };

        List<CategoryStat> items = await ordered.Skip(query.Skip).Take(query.Take).ToListAsync();

        return new SortedPageDto<CategoryStatDto, CategoryStatMode>
        {
            Items = items.Adapt<List<CategoryStatDto>>(),
            Skip = query.Skip,
            Take = query.Take,
            Sort = query.Mode,
        };
    }

    static DateTime AsUtcTimestamp(DateTime value) =>
        value.Kind == DateTimeKind.Local
            ? value.ToUniversalTime()
            : DateTime.SpecifyKind(value, DateTimeKind.Utc);
}
