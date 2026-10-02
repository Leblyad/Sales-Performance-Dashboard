namespace SalesDashboard.Dto;

public class PageDto<T>
{
    public List<T> Items { get; set; } = [];

    public int Skip { get; set; }

    public int Take { get; set; }
}
