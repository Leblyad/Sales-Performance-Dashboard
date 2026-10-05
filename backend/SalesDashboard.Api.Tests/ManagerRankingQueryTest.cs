using SalesDashboard.Data.Queries;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Tests;

[Collection(QueryDbCollection.Name)]
public sealed class ManagerRankingQueryTest : QueryTest
{
    public ManagerRankingQueryTest(QueryDb database) : base(database)
    {
    }

    [Fact]
    public async Task GetAsync_GrossProfitMode_ReturnsOrderedByGrossProfit()
    {
        //Arrange
        await SeedRanking();
        var query = new ManagerRankingQueryDto
        {
            Mode = ManagerRankingMode.GrossProfit,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<ManagerRankingDto, ManagerRankingMode> actual = await ManagerRankingQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(ManagerRankingMode.GrossProfit, actual.Sort);
        Assert.Equal(0, actual.Skip);
        Assert.Equal(10, actual.Take);
        Assert.Equal(2, actual.Items.Count);
        Assert.Equal("Ann", actual.Items[0].Name);
        Assert.Equal(30m, actual.Items[0].GrossProfit);
        Assert.Equal(30m, actual.Items[0].AverageCheck);
        Assert.Equal("Bob", actual.Items[1].Name);
        Assert.Equal(9m, actual.Items[1].GrossProfit);
        Assert.Equal(10m, actual.Items[1].AverageCheck);
    }

    [Fact]
    public async Task GetAsync_AverageCheckMode_ReturnsOrderedByAverageCheck()
    {
        //Arrange
        await SeedRanking();
        var query = new ManagerRankingQueryDto
        {
            Mode = ManagerRankingMode.AverageCheck,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<ManagerRankingDto, ManagerRankingMode> actual = await ManagerRankingQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(ManagerRankingMode.AverageCheck, actual.Sort);
        Assert.Equal(["Ann", "Bob"], actual.Items.Select(item => item.Name).ToArray());
        Assert.Equal(30m, actual.Items[0].AverageCheck);
        Assert.Equal(10m, actual.Items[1].AverageCheck);
    }

    [Fact]
    public async Task GetAsync_SkipAndTake_ReturnsPage()
    {
        //Arrange
        await SeedRanking();
        var query = new ManagerRankingQueryDto
        {
            Mode = ManagerRankingMode.GrossProfit,
            Skip = 1,
            Take = 1,
        };

        //Act
        SortedPageDto<ManagerRankingDto, ManagerRankingMode> actual = await ManagerRankingQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(1, actual.Skip);
        Assert.Equal(1, actual.Take);
        Assert.Equal("Bob", Assert.Single(actual.Items).Name);
    }

    [Fact]
    public async Task GetAsync_InvalidMode_ThrowsArgumentOutOfRangeException()
    {
        //Arrange
        var query = new ManagerRankingQueryDto
        {
            Mode = (ManagerRankingMode)99,
            Skip = 0,
            Take = 10,
        };
        var getRanking = async () => await ManagerRankingQuery.GetAsync(Db, query);

        //Act
        ArgumentOutOfRangeException exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(getRanking);

        //Assert
        Assert.Equal("Mode", exception.ParamName);
    }

    [Fact]
    public async Task GetAsync_NoPaidSales_ReturnsEmptyPage()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(manager, customer, Utc(2026, 3, 15), SaleStatus.Cancelled, (product, 1, 100m, 1m));
        AddSale(manager, customer, Utc(2026, 3, 16), SaleStatus.Refunded, (product, 1, 40m, 10m));
        await SaveAsync();
        var query = new ManagerRankingQueryDto
        {
            Mode = ManagerRankingMode.GrossProfit,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<ManagerRankingDto, ManagerRankingMode> actual = await ManagerRankingQuery.GetAsync(Db, query);

        //Assert
        Assert.Empty(actual.Items);
    }

    async Task SeedRanking()
    {
        Manager ann = AddManager("Ann");
        Manager bob = AddManager("Bob");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        AddSale(ann, customer, Utc(2026, 3, 15), SaleStatus.Paid, (product, 2, 20m, 10m), (product, 1, 5m, 5m));
        AddSale(ann, customer, Utc(2026, 3, 16), SaleStatus.Paid, (product, 1, 15m, 5m));
        AddSale(ann, customer, Utc(2026, 3, 17), SaleStatus.Cancelled, (product, 1, 1000m, 1m));
        AddSale(bob, customer, Utc(2026, 3, 15), SaleStatus.Paid, (product, 1, 10m, 1m));
        AddSale(bob, customer, Utc(2026, 3, 16), SaleStatus.Refunded, (product, 1, 400m, 1m));
        await SaveAsync();
    }
}
