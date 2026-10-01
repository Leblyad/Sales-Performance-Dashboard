namespace SalesDashboard.Domain;

public class Manager
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public Guid TeamId { get; set; }

    public Team Team { get; set; } = null!;

    public Guid PositionId { get; set; }

    public Position Position { get; set; } = null!;

    public bool IsActive { get; set; }

    public string Avatar { get; set; } = string.Empty;
}
