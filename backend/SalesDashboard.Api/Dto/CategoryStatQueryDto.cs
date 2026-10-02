using SalesDashboard.Data.Queries;

namespace SalesDashboard.Dto;

public class CategoryStatQueryDto
{
    public DateTime DateFrom { get; set; }

    public DateTime DateTo { get; set; }

    public CategoryStatMode Mode { get; set; }

    public int Skip { get; set; }

    public int Take { get; set; }
}
