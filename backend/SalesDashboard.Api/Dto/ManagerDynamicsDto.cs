namespace SalesDashboard.Dto;

public class ManagerDynamicsDto
{
    public DateOnly Date { get; set; }

    public decimal? Revenue { get; set; }

    public decimal? GrossProfit { get; set; }

    public long SalesCount { get; set; }
}
