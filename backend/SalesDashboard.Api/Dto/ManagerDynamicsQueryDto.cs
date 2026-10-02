namespace SalesDashboard.Dto;

public class ManagerDynamicsQueryDto
{
    public Guid ManagerId { get; set; }

    public DateOnly DateFrom { get; set; }

    public DateOnly DateTo { get; set; }
}
