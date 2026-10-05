using SalesDashboard.Data.Queries;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Tests;

[Collection(QueryDbCollection.Name)]
public sealed class RecentSalesQueryTest : QueryTest
{
    public RecentSalesQueryTest(QueryDb database) : base(database)
    {
    }

    [Fact]
    public async Task GetAsync_SeveralSales_ReturnsNewestFirst()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(manager, customer, Utc(2026, 3, 10), SaleStatus.Paid, (product, 1, 10m, 4m));
        AddSale(manager, customer, Utc(2026, 3, 12), SaleStatus.Paid, (product, 1, 30m, 4m));
        AddSale(manager, customer, Utc(2026, 3, 11), SaleStatus.Cancelled, (product, 1, 20m, 4m));
        await SaveAsync();
        var query = new RecentSalesQueryDto
        {
            Skip = 0,
            Take = 10,
        };

        //Act
        PageDto<RecentSaleDto> actual = await RecentSalesQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(0, actual.Skip);
        Assert.Equal(10, actual.Take);
        Assert.Equal(
            [Utc(2026, 3, 12), Utc(2026, 3, 11), Utc(2026, 3, 10)],
            actual.Items.Select(item => item.Date).ToArray());
        Assert.Equal(SaleStatus.Cancelled, actual.Items[1].Status);
        Assert.Equal(manager.Id, actual.Items[0].Manager.Id);
        Assert.Equal("Ann", actual.Items[0].Manager.Name);
        Assert.Equal("Ann.png", actual.Items[0].Manager.Avatar);
        Assert.Equal(customer.Id, actual.Items[0].Customer.Id);
        Assert.Equal("Acme", actual.Items[0].Customer.Name);
    }

    [Fact]
    public async Task GetAsync_SaleWithSeveralItems_ReturnsAmountAndGrossProfit()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Category category = AddCategory("Tools");
        Product drill = AddProduct(category, "Drill");
        Product bit = AddProduct(category, "Bit");
        AddSale(
            manager,
            customer,
            Utc(2026, 3, 15),
            SaleStatus.Paid,
            (drill, 2, 20m, 10m),
            (bit, 1, 5m, 5m));
        await SaveAsync();
        var query = new RecentSalesQueryDto
        {
            Skip = 0,
            Take = 10,
        };

        //Act
        PageDto<RecentSaleDto> actual = await RecentSalesQuery.GetAsync(Db, query);

        //Assert
        RecentSaleDto item = Assert.Single(actual.Items);
        Assert.Equal(45m, item.Amount);
        Assert.Equal(20m, item.GrossProfit);
        Assert.Equal(2, item.Products.Count);
        Assert.Contains(item.Products, product => product.Id == drill.Id && product.Name == "Drill");
        Assert.Contains(item.Products, product => product.Id == bit.Id && product.Name == "Bit");
    }

    [Fact]
    public async Task GetAsync_CategoryId_ReturnsSalesWithThatCategory()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Category tools = AddCategory("Tools");
        Category food = AddCategory("Food");
        Product drill = AddProduct(tools, "Drill");
        Product bread = AddProduct(food, "Bread");
        AddSale(
            manager,
            customer,
            Utc(2026, 3, 15),
            SaleStatus.Paid,
            (drill, 1, 10m, 4m),
            (bread, 1, 5m, 1m));
        AddSale(manager, customer, Utc(2026, 3, 16), SaleStatus.Paid, (bread, 1, 8m, 2m));
        await SaveAsync();
        var query = new RecentSalesQueryDto
        {
            CategoryId = tools.Id,
            Skip = 0,
            Take = 10,
        };

        //Act
        PageDto<RecentSaleDto> actual = await RecentSalesQuery.GetAsync(Db, query);

        //Assert
        RecentSaleDto item = Assert.Single(actual.Items);
        Assert.Equal(Utc(2026, 3, 15), item.Date);
        Assert.Equal(15m, item.Amount);
        Assert.Equal(10m, item.GrossProfit);
    }

    [Fact]
    public async Task GetAsync_UnknownCategoryId_ReturnsEmptyPage()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(manager, customer, Utc(2026, 3, 15), SaleStatus.Paid, (product, 1, 10m, 4m));
        await SaveAsync();
        var query = new RecentSalesQueryDto
        {
            CategoryId = Guid.NewGuid(),
            Skip = 2,
            Take = 5,
        };

        //Act
        PageDto<RecentSaleDto> actual = await RecentSalesQuery.GetAsync(Db, query);

        //Assert
        Assert.Empty(actual.Items);
        Assert.Equal(2, actual.Skip);
        Assert.Equal(5, actual.Take);
    }

    [Fact]
    public async Task GetAsync_SkipAndTake_ReturnsPage()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(manager, customer, Utc(2026, 3, 10), SaleStatus.Paid, (product, 1, 10m, 4m));
        AddSale(manager, customer, Utc(2026, 3, 12), SaleStatus.Paid, (product, 1, 30m, 4m));
        AddSale(manager, customer, Utc(2026, 3, 11), SaleStatus.Paid, (product, 1, 20m, 4m));
        await SaveAsync();
        var query = new RecentSalesQueryDto
        {
            Skip = 1,
            Take = 1,
        };

        //Act
        PageDto<RecentSaleDto> actual = await RecentSalesQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(1, actual.Skip);
        Assert.Equal(1, actual.Take);
        RecentSaleDto item = Assert.Single(actual.Items);
        Assert.Equal(Utc(2026, 3, 11), item.Date);
        Assert.Equal(20m, item.Amount);
    }
}
