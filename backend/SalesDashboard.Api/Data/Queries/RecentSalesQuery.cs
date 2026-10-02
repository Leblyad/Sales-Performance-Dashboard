using Mapster;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data.Models;
using SalesDashboard.Dto;

namespace SalesDashboard.Data.Queries;

public static class RecentSalesQuery
{
    public static async Task<PageDto<RecentSaleDto>> GetAsync(AppDbContext db, RecentSalesQueryDto query)
    {
        List<RecentSale> sales = await db.Sales
            .OrderByDescending(sale => sale.Date)
            .Select(sale => new RecentSale
            {
                Date = sale.Date,
                Status = sale.Status,
                Manager = new RecentSaleManager
                {
                    Id = sale.Manager.Id,
                    Name = sale.Manager.Name,
                    Avatar = sale.Manager.Avatar,
                },
                Customer = new RecentSaleCustomer
                {
                    Id = sale.Customer.Id,
                    Name = sale.Customer.Name,
                },
                Products = sale.Items
                    .Select(item => new RecentSaleProduct
                    {
                        Id = item.Product.Id,
                        Name = item.Product.Name,
                    })
                    .ToList(),
                Amount = sale.Items.Sum(item => item.Price * item.Quantity),
                GrossProfit = sale.Items.Sum(item => item.Price * item.Quantity)
                    - sale.Items.Sum(item => item.Cost * item.Quantity),
            })
            .Skip(query.Skip)
            .Take(query.Take)
            .ToListAsync();

        return new PageDto<RecentSaleDto>
        {
            Items = sales.Adapt<List<RecentSaleDto>>(),
            Skip = query.Skip,
            Take = query.Take,
        };
    }
}
