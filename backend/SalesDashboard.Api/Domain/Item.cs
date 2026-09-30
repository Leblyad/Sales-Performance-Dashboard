namespace SalesDashboard.Domain;

public class Item
{
    public Guid ExternalId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
