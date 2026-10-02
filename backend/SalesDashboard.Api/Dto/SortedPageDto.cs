namespace SalesDashboard.Dto;

public class SortedPageDto<T, TSort> : PageDto<T>
{
    public TSort Sort { get; set; } = default!;
}
