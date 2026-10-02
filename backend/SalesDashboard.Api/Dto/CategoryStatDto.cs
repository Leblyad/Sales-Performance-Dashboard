namespace SalesDashboard.Dto;

public class CategoryStatDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int SalesCount { get; set; }

    public decimal Revenue { get; set; }
}
