using SalesDashboard.Domain;

namespace SalesDashboard.Dto;

public class RecentSaleDto
{
    public DateTime Date { get; set; }

    public RecentSaleManagerDto Manager { get; set; } = new();

    public RecentSaleCustomerDto Customer { get; set; } = new();

    public List<RecentSaleProductDto> Products { get; set; } = [];

    public SaleStatus Status { get; set; }

    public decimal Amount { get; set; }

    public decimal GrossProfit { get; set; }
}

public class RecentSaleManagerDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Avatar { get; set; } = string.Empty;
}

public class RecentSaleCustomerDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;
}

public class RecentSaleProductDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;
}
