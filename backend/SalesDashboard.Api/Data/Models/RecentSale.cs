using SalesDashboard.Domain;

namespace SalesDashboard.Data.Models;

public class RecentSale
{
    public DateTime Date { get; set; }

    public RecentSaleManager Manager { get; set; } = new();

    public RecentSaleCustomer Customer { get; set; } = new();

    public List<RecentSaleProduct> Products { get; set; } = [];

    public SaleStatus Status { get; set; }

    public decimal Amount { get; set; }

    public decimal GrossProfit { get; set; }
}

public class RecentSaleManager
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Avatar { get; set; } = string.Empty;
}

public class RecentSaleCustomer
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;
}
