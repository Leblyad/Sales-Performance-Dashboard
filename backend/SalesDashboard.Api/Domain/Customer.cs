namespace SalesDashboard.Domain;

public class Customer
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Company { get; set; } = string.Empty;

    public string Segment { get; set; } = string.Empty;
}
