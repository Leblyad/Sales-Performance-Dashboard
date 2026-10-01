namespace SalesDashboard.Domain;

public class Sale
{
    public Guid Id { get; set; }

    public Guid ManagerId { get; set; }

    public Manager Manager { get; set; } = null!;

    public Guid CustomerId { get; set; }

    public Customer Customer { get; set; } = null!;

    public DateTime Date { get; set; }

    public SaleStatus Status { get; set; }

    public List<SaleItem> Items { get; set; } = [];
}
