namespace SalesDashboard.Dto;

public class ItemDto
{
    public Guid ExternalId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
