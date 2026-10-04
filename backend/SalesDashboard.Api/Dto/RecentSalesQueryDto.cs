namespace SalesDashboard.Dto;

public class RecentSalesQueryDto
{
    public Guid? CategoryId { get; set; }

    public int Skip { get; set; }

    public int Take { get; set; }
}
