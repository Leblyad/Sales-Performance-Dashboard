using SalesDashboard.Data.Queries;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Tests;

[Collection(QueryDbCollection.Name)]
public sealed class KpiCardsQueryTest : QueryTest
{
    public KpiCardsQueryTest(QueryDb database) : base(database)
    {
    }

    [Fact]
    public async Task GetAsync_PaidCancelledAndRefunded_ReturnsPaidKpi()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        DateTime date = Utc(2026, 3, 15);
        AddSale(manager, customer, date, SaleStatus.Paid, (product, 2, 20m, 10m), (product, 1, 5m, 5m));
        AddSale(manager, customer, date, SaleStatus.Paid, (product, 1, 15m, 5m));
        AddSale(manager, customer, date, SaleStatus.Cancelled, (product, 1, 1000m, 1m));
        AddSale(manager, customer, date, SaleStatus.Refunded, (product, 1, 400m, 100m));
        await SaveAsync();
        var query = new KpiCardsQueryDto
        {
            PeriodFrom = Utc(2026, 3, 1),
            PeriodTo = Utc(2026, 3, 31),
        };

        //Act
        KpiCardsDto actual = await KpiCardsQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(60m, actual.Revenue);
        Assert.Equal(30m, actual.Cost);
        Assert.Equal(30m, actual.GrossProfit);
        Assert.Equal(0.5m, actual.Margin);
        Assert.Equal(2L, actual.SalesCount);
        Assert.Equal(30m, actual.AverageCheck);
    }

    [Fact]
    public async Task GetAsync_SalesOnPeriodBounds_IncludesSales()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        DateTime from = Utc(2026, 4, 1);
        DateTime to = Utc(2026, 4, 30);
        AddSale(manager, customer, from, SaleStatus.Paid, (product, 1, 10m, 4m));
        AddSale(manager, customer, to, SaleStatus.Paid, (product, 1, 20m, 8m));
        await SaveAsync();
        var query = new KpiCardsQueryDto
        {
            PeriodFrom = from,
            PeriodTo = to,
        };

        //Act
        KpiCardsDto actual = await KpiCardsQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(30m, actual.Revenue);
        Assert.Equal(12m, actual.Cost);
        Assert.Equal(18m, actual.GrossProfit);
        Assert.Equal(0.6m, actual.Margin);
        Assert.Equal(2L, actual.SalesCount);
        Assert.Equal(15m, actual.AverageCheck);
    }

    [Fact]
    public async Task GetAsync_SalesOutsidePeriod_ExcludesSales()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        DateTime from = Utc(2026, 5, 1);
        DateTime to = Utc(2026, 5, 31);
        AddSale(manager, customer, from.AddHours(-1), SaleStatus.Paid, (product, 1, 100m, 1m));
        AddSale(manager, customer, Utc(2026, 5, 15), SaleStatus.Paid, (product, 1, 10m, 2m));
        AddSale(manager, customer, to.AddHours(1), SaleStatus.Paid, (product, 1, 100m, 1m));
        await SaveAsync();
        var query = new KpiCardsQueryDto
        {
            PeriodFrom = from,
            PeriodTo = to,
        };

        //Act
        KpiCardsDto actual = await KpiCardsQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(10m, actual.Revenue);
        Assert.Equal(2m, actual.Cost);
        Assert.Equal(8m, actual.GrossProfit);
        Assert.Equal(0.8m, actual.Margin);
        Assert.Equal(1L, actual.SalesCount);
        Assert.Equal(10m, actual.AverageCheck);
    }

    [Fact]
    public async Task GetAsync_EmptyPeriod_ReturnsNullMargin()
    {
        //Arrange
        var query = new KpiCardsQueryDto
        {
            PeriodFrom = Utc(2026, 6, 1),
            PeriodTo = Utc(2026, 6, 30),
        };

        //Act
        KpiCardsDto actual = await KpiCardsQuery.GetAsync(Db, query);

        //Assert
        Assert.Null(actual.Revenue);
        Assert.Null(actual.Cost);
        Assert.Null(actual.GrossProfit);
        Assert.Null(actual.Margin);
        Assert.Equal(0L, actual.SalesCount);
        Assert.Null(actual.AverageCheck);
    }

    [Fact]
    public async Task GetAsync_ZeroRevenue_ReturnsNullMargin()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(manager, customer, Utc(2026, 7, 10), SaleStatus.Paid, (product, 1, 0m, 5m));
        await SaveAsync();
        var query = new KpiCardsQueryDto
        {
            PeriodFrom = Utc(2026, 7, 1),
            PeriodTo = Utc(2026, 7, 31),
        };

        //Act
        KpiCardsDto actual = await KpiCardsQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(0m, actual.Revenue);
        Assert.Equal(5m, actual.Cost);
        Assert.Equal(-5m, actual.GrossProfit);
        Assert.Null(actual.Margin);
        Assert.Equal(1L, actual.SalesCount);
        Assert.Equal(0m, actual.AverageCheck);
    }
}
