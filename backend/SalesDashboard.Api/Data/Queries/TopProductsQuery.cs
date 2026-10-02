using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;
using SalesDashboard.Domain;

namespace SalesDashboard.Data.Queries;

public static class TopProductsQuery
{
    public static Task<List<TopProduct>> GetAsync(AppDbContext db)
    {
        return db.Products
            .Join(
                db.SaleItems.Where(item => item.Sale.Status == SaleStatus.Paid),
                product => product.Id,
                item => item.ProductId,
                (product, item) => new { product, item })
            .GroupBy(row => new { row.product.Id, row.product.Name })
            .Select(group => new TopProduct
            {
                Id = group.Key.Id,
                Name = group.Key.Name,
                Revenue = group.Sum(row => row.item.Price * row.item.Quantity),
            })
            .OrderByDescending(product => product.Revenue)
            .Take(5)
            .ToListAsync();
    }
}
