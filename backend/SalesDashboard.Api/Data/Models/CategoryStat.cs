namespace SalesDashboard.Data.Models;

public class CategoryStat
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int SalesCount { get; set; }

    public decimal Revenue { get; set; }
}
