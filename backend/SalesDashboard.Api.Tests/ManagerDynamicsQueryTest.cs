using SalesDashboard.Data.Queries;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Tests;

[Collection(QueryDbCollection.Name)]
public sealed class ManagerDynamicsQueryTest : QueryTest
{
    public ManagerDynamicsQueryTest(QueryDb database) : base(database)
    {
    }

    [Fact]
    public async Task GetAsync_TwoDaysOfPaidSales_ReturnsTotalsByDate()
    {
        //Arrange
        Manager ann = AddManager("Ann");
        Manager bob = AddManager("Bob");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(ann, customer, Utc(2026, 3, 10), SaleStatus.Paid, (product, 2, 20m, 10m), (product, 1, 5m, 5m));
        AddSale(ann, customer, Utc(2026, 3, 10), SaleStatus.Paid, (product, 1, 15m, 5m));
        AddSale(ann, customer, Utc(2026, 3, 11), SaleStatus.Paid, (product, 1, 10m, 4m));
        AddSale(bob, customer, Utc(2026, 3, 10), SaleStatus.Paid, (product, 1, 500m, 1m));
        AddSale(ann, customer, Utc(2026, 3, 10), SaleStatus.Cancelled, (product, 1, 500m, 1m));
        await SaveAsync();
        var query = new ManagerDynamicsQueryDto
        {
            ManagerId = ann.Id,
            DateFrom = new DateOnly(2026, 3, 10),
            DateTo = new DateOnly(2026, 3, 11),
        };

        //Act
        List<ManagerDynamicsDto> actual = await ManagerDynamicsQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(2, actual.Count);
        Assert.Equal(new DateOnly(2026, 3, 10), actual[0].Date);
        Assert.Equal(60m, actual[0].Revenue);
        Assert.Equal(30m, actual[0].GrossProfit);
        Assert.Equal(2L, actual[0].SalesCount);
        Assert.Equal(new DateOnly(2026, 3, 11), actual[1].Date);
        Assert.Equal(10m, actual[1].Revenue);
        Assert.Equal(6m, actual[1].GrossProfit);
        Assert.Equal(1L, actual[1].SalesCount);
    }

    [Fact]
    public async Task GetAsync_InclusiveDateRange_ReturnsDaysInsideRange()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(manager, customer, Utc(2026, 4, 9), SaleStatus.Paid, (product, 1, 100m, 1m));
        AddSale(manager, customer, Utc(2026, 4, 10), SaleStatus.Paid, (product, 1, 10m, 4m));
        AddSale(manager, customer, Utc(2026, 4, 12), SaleStatus.Paid, (product, 1, 20m, 8m));
        AddSale(manager, customer, Utc(2026, 4, 13), SaleStatus.Paid, (product, 1, 100m, 1m));
        await SaveAsync();
        var query = new ManagerDynamicsQueryDto
        {
            ManagerId = manager.Id,
            DateFrom = new DateOnly(2026, 4, 10),
            DateTo = new DateOnly(2026, 4, 12),
        };

        //Act
        List<ManagerDynamicsDto> actual = await ManagerDynamicsQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(2, actual.Count);
        Assert.Equal(new DateOnly(2026, 4, 10), actual[0].Date);
        Assert.Equal(10m, actual[0].Revenue);
        Assert.Equal(new DateOnly(2026, 4, 12), actual[1].Date);
        Assert.Equal(20m, actual[1].Revenue);
    }

    [Fact]
    public async Task GetAsync_EmptyRange_ReturnsEmptyList()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        await SaveAsync();
        var query = new ManagerDynamicsQueryDto
        {
            ManagerId = manager.Id,
            DateFrom = new DateOnly(2026, 5, 1),
            DateTo = new DateOnly(2026, 5, 31),
        };

        //Act
        List<ManagerDynamicsDto> actual = await ManagerDynamicsQuery.GetAsync(Db, query);

        //Assert
        Assert.Empty(actual);
    }
}
