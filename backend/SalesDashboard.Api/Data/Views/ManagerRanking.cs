namespace SalesDashboard.Data.Views;

public class ManagerRanking
{
    public Guid ManagerId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Avatar { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public string TeamName { get; set; } = string.Empty;

    public string PositionName { get; set; } = string.Empty;

    public decimal GrossProfit { get; set; }

    public decimal AverageCheck { get; set; }
}
