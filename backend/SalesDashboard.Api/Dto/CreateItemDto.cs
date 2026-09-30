namespace SalesDashboard.Dto;

public class CreateItemDto
{
    public Guid ExternalId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
}
