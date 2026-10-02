namespace SalesDashboard.Data.Models;

public class TopProduct
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Revenue { get; set; }
}
