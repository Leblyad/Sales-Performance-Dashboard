using SalesDashboard.Data.Queries;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Tests;

[Collection(QueryDbCollection.Name)]
public sealed class TopProductsQueryTest : QueryTest
{
    public TopProductsQueryTest(QueryDb database) : base(database)
    {
    }

    [Fact]
    public async Task GetAsync_MoreThanFivePaidProducts_ReturnsFiveByRevenue()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Category category = AddCategory("Tools");
        decimal[] revenues = [10m, 60m, 20m, 50m, 30m, 40m];
        foreach (decimal revenue in revenues)
        {
            Product product = AddProduct(category, "p" + revenue);
            AddSale(manager, customer, Utc(2026, 3, 15), SaleStatus.Paid, (product, 1, revenue, 1m));
        }

        await SaveAsync();

        //Act
        List<TopProductDto> actual = await TopProductsQuery.GetAsync(Db);

        //Assert
        Assert.Equal(["p60", "p50", "p40", "p30", "p20"], actual.Select(item => item.Name).ToArray());
        Assert.Equal([60m, 50m, 40m, 30m, 20m], actual.Select(item => item.Revenue).ToArray());
    }

    [Fact]
    public async Task GetAsync_FewerThanFive_ReturnsAllByRevenue()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Category category = AddCategory("Tools");
        Product drill = AddProduct(category, "Drill");
        Product bit = AddProduct(category, "Bit");
        AddSale(manager, customer, Utc(2026, 3, 15), SaleStatus.Paid, (drill, 2, 20m, 10m), (drill, 1, 5m, 1m));
        AddSale(manager, customer, Utc(2026, 3, 16), SaleStatus.Paid, (bit, 1, 15m, 5m));
        await SaveAsync();

        //Act
        List<TopProductDto> actual = await TopProductsQuery.GetAsync(Db);

        //Assert
        Assert.Equal(["Drill", "Bit"], actual.Select(item => item.Name).ToArray());
        Assert.Equal(45m, actual[0].Revenue);
        Assert.Equal(15m, actual[1].Revenue);
    }

    [Fact]
    public async Task GetAsync_CancelledAndRefunded_ExcludesThoseSales()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Category category = AddCategory("Tools");
        Product drill = AddProduct(category, "Drill");
        Product bit = AddProduct(category, "Bit");
        DateTime date = Utc(2026, 3, 15);
        AddSale(manager, customer, date, SaleStatus.Paid, (drill, 1, 10m, 4m));
        AddSale(manager, customer, date, SaleStatus.Cancelled, (bit, 1, 1000m, 1m));
        AddSale(manager, customer, date, SaleStatus.Refunded, (bit, 1, 400m, 1m));
        await SaveAsync();

        //Act
        List<TopProductDto> actual = await TopProductsQuery.GetAsync(Db);

        //Assert
        TopProductDto item = Assert.Single(actual);
        Assert.Equal("Drill", item.Name);
        Assert.Equal(10m, item.Revenue);
    }

    [Fact]
    public async Task GetAsync_NoPaidSales_ReturnsEmptyList()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(manager, customer, Utc(2026, 3, 15), SaleStatus.Cancelled, (product, 1, 10m, 4m));
        await SaveAsync();

        //Act
        List<TopProductDto> actual = await TopProductsQuery.GetAsync(Db);

        //Assert
        Assert.Empty(actual);
    }
}
