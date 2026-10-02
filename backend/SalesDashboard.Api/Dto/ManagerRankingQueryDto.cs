using SalesDashboard.Data.Queries;

namespace SalesDashboard.Dto;

public class ManagerRankingQueryDto
{
    public ManagerRankingMode Mode { get; set; }

    public int Skip { get; set; }

    public int Take { get; set; }
}
