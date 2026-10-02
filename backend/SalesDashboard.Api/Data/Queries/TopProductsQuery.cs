using Mapster;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Data.Queries;

public static class TopProductsQuery
{
    public static async Task<List<TopProductDto>> GetAsync(AppDbContext db)
    {
        List<TopProduct> products = await db.Products
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

        return products.Adapt<List<TopProductDto>>();
    }
}
