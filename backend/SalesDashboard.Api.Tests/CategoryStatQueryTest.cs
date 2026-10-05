using SalesDashboard.Data.Queries;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Tests;

[Collection(QueryDbCollection.Name)]
public sealed class CategoryStatQueryTest : QueryTest
{
    public CategoryStatQueryTest(QueryDb database) : base(database)
    {
    }

    [Fact]
    public async Task GetAsync_SalesCountMode_ReturnsOrderedBySalesCount()
    {
        //Arrange
        await SeedCategories();
        var query = new CategoryStatQueryDto
        {
            DateFrom = Utc(2026, 3, 1),
            DateTo = Utc(2026, 3, 31),
            Mode = CategoryStatMode.SalesCount,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<CategoryStatDto, CategoryStatMode> actual = await CategoryStatQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(CategoryStatMode.SalesCount, actual.Sort);
        Assert.Equal(["Many", "Big"], actual.Items.Select(item => item.Name).ToArray());
        Assert.Equal(3, actual.Items[0].SalesCount);
        Assert.Equal(300m, actual.Items[0].Revenue);
        Assert.Equal(1, actual.Items[1].SalesCount);
        Assert.Equal(1000m, actual.Items[1].Revenue);
    }

    [Fact]
    public async Task GetAsync_RevenueMode_ReturnsOrderedByRevenue()
    {
        //Arrange
        await SeedCategories();
        var query = new CategoryStatQueryDto
        {
            DateFrom = Utc(2026, 3, 1),
            DateTo = Utc(2026, 3, 31),
            Mode = CategoryStatMode.Revenue,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<CategoryStatDto, CategoryStatMode> actual = await CategoryStatQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(CategoryStatMode.Revenue, actual.Sort);
        Assert.Equal(["Big", "Many"], actual.Items.Select(item => item.Name).ToArray());
        Assert.Equal(1000m, actual.Items[0].Revenue);
        Assert.Equal(300m, actual.Items[1].Revenue);
    }

    [Fact]
    public async Task GetAsync_TwoItemsOneSale_CountsSaleOnce()
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
            (bit, 1, 5m, 1m));
        await SaveAsync();
        var query = new CategoryStatQueryDto
        {
            DateFrom = Utc(2026, 3, 1),
            DateTo = Utc(2026, 3, 31),
            Mode = CategoryStatMode.Revenue,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<CategoryStatDto, CategoryStatMode> actual = await CategoryStatQuery.GetAsync(Db, query);

        //Assert
        CategoryStatDto item = Assert.Single(actual.Items);
        Assert.Equal("Tools", item.Name);
        Assert.Equal(1, item.SalesCount);
        Assert.Equal(45m, item.Revenue);
    }

    [Fact]
    public async Task GetAsync_CancelledAndRefunded_ExcludesThoseSales()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        DateTime date = Utc(2026, 3, 15);
        AddSale(manager, customer, date, SaleStatus.Paid, (product, 1, 10m, 4m));
        AddSale(manager, customer, date, SaleStatus.Cancelled, (product, 1, 1000m, 1m));
        AddSale(manager, customer, date, SaleStatus.Refunded, (product, 1, 400m, 1m));
        await SaveAsync();
        var query = new CategoryStatQueryDto
        {
            DateFrom = Utc(2026, 3, 1),
            DateTo = Utc(2026, 3, 31),
            Mode = CategoryStatMode.Revenue,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<CategoryStatDto, CategoryStatMode> actual = await CategoryStatQuery.GetAsync(Db, query);

        //Assert
        CategoryStatDto item = Assert.Single(actual.Items);
        Assert.Equal(1, item.SalesCount);
        Assert.Equal(10m, item.Revenue);
    }

    [Fact]
    public async Task GetAsync_DatesOnPeriodBounds_IncludesSales()
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
        var query = new CategoryStatQueryDto
        {
            DateFrom = from,
            DateTo = to,
            Mode = CategoryStatMode.Revenue,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<CategoryStatDto, CategoryStatMode> actual = await CategoryStatQuery.GetAsync(Db, query);

        //Assert
        CategoryStatDto item = Assert.Single(actual.Items);
        Assert.Equal(2, item.SalesCount);
        Assert.Equal(30m, item.Revenue);
    }

    [Fact]
    public async Task GetAsync_DatesOutsidePeriod_ExcludesSales()
    {
        //Arrange
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product product = AddProduct(AddCategory("Tools"), "Drill");
        DateTime from = Utc(2026, 5, 1);
        DateTime to = Utc(2026, 5, 31);
        AddSale(manager, customer, from.AddHours(-1), SaleStatus.Paid, (product, 1, 100m, 1m));
        AddSale(manager, customer, Utc(2026, 5, 15), SaleStatus.Paid, (product, 1, 10m, 4m));
        AddSale(manager, customer, to.AddHours(1), SaleStatus.Paid, (product, 1, 100m, 1m));
        await SaveAsync();
        var query = new CategoryStatQueryDto
        {
            DateFrom = from,
            DateTo = to,
            Mode = CategoryStatMode.Revenue,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<CategoryStatDto, CategoryStatMode> actual = await CategoryStatQuery.GetAsync(Db, query);

        //Assert
        CategoryStatDto item = Assert.Single(actual.Items);
        Assert.Equal(1, item.SalesCount);
        Assert.Equal(10m, item.Revenue);
    }

    [Fact]
    public async Task GetAsync_SkipAndTake_ReturnsPage()
    {
        //Arrange
        await SeedCategories();
        var query = new CategoryStatQueryDto
        {
            DateFrom = Utc(2026, 3, 1),
            DateTo = Utc(2026, 3, 31),
            Mode = CategoryStatMode.Revenue,
            Skip = 1,
            Take = 1,
        };

        //Act
        SortedPageDto<CategoryStatDto, CategoryStatMode> actual = await CategoryStatQuery.GetAsync(Db, query);

        //Assert
        Assert.Equal(1, actual.Skip);
        Assert.Equal(1, actual.Take);
        Assert.Equal("Many", Assert.Single(actual.Items).Name);
    }

    [Fact]
    public async Task GetAsync_EmptyPeriod_ReturnsEmptyPage()
    {
        //Arrange
        var query = new CategoryStatQueryDto
        {
            DateFrom = Utc(2026, 6, 1),
            DateTo = Utc(2026, 6, 30),
            Mode = CategoryStatMode.Revenue,
            Skip = 0,
            Take = 10,
        };

        //Act
        SortedPageDto<CategoryStatDto, CategoryStatMode> actual = await CategoryStatQuery.GetAsync(Db, query);

        //Assert
        Assert.Empty(actual.Items);
        Assert.Equal(0, actual.Skip);
        Assert.Equal(10, actual.Take);
    }

    [Fact]
    public async Task GetAsync_InvalidMode_ThrowsArgumentOutOfRangeException()
    {
        //Arrange
        var query = new CategoryStatQueryDto
        {
            DateFrom = Utc(2026, 3, 1),
            DateTo = Utc(2026, 3, 31),
            Mode = (CategoryStatMode)99,
            Skip = 0,
            Take = 10,
        };
        var getCategories = async () => await CategoryStatQuery.GetAsync(Db, query);

        //Act
        ArgumentOutOfRangeException exception = await Assert.ThrowsAsync<ArgumentOutOfRangeException>(getCategories);

        //Assert
        Assert.Equal("Mode", exception.ParamName);
    }

    async Task SeedCategories()
    {
        Manager manager = AddManager("Ann");
        Customer customer = AddCustomer("Acme");
        Product big = AddProduct(AddCategory("Big"), "Press");
        Product many = AddProduct(AddCategory("Many"), "Screw");
        AddSale(manager, customer, Utc(2026, 3, 10), SaleStatus.Paid, (big, 1, 1000m, 100m));
        AddSale(manager, customer, Utc(2026, 3, 11), SaleStatus.Paid, (many, 1, 100m, 10m));
        AddSale(manager, customer, Utc(2026, 3, 12), SaleStatus.Paid, (many, 1, 100m, 10m));
        AddSale(manager, customer, Utc(2026, 3, 13), SaleStatus.Paid, (many, 1, 100m, 10m));
        AddSale(manager, customer, Utc(2026, 3, 14), SaleStatus.Cancelled, (many, 1, 9000m, 1m));
        await SaveAsync();
    }
}
