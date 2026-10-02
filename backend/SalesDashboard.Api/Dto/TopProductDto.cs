namespace SalesDashboard.Dto;

public class TopProductDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Revenue { get; set; }
}
