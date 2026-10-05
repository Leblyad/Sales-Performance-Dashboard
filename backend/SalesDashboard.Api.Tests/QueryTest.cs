using SalesDashboard.Data;
using SalesDashboard.Domain;

namespace SalesDashboard.Tests;

public abstract class QueryTest : IAsyncLifetime
{
    readonly QueryDb database;

    protected AppDbContext Db { get; private set; } = null!;

    protected QueryTest(QueryDb database) => this.database = database;

    public async Task InitializeAsync()
    {
        await database.ClearAsync();
        Db = database.CreateContext();
    }

    public async Task DisposeAsync() => await Db.DisposeAsync();

    protected static DateTime Utc(int year, int month, int day) =>
        new(year, month, day, 12, 0, 0, DateTimeKind.Utc);

    protected Manager AddManager(string name)
    {
        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = name + " team",
        };
        var position = new Position
        {
            Id = Guid.NewGuid(),
            Name = name + " position",
        };
        var manager = new Manager
        {
            Id = Guid.NewGuid(),
            Name = name,
            Avatar = name + ".png",
            IsActive = true,
            Team = team,
            Position = position,
        };
        Db.AddRange(team, position, manager);
        return manager;
    }

    protected Customer AddCustomer(string name)
    {
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Name = name,
            Company = name,
            Segment = "B2B",
        };
        Db.Customers.Add(customer);
        return customer;
    }

    protected Category AddCategory(string name)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = name,
        };
        Db.Categories.Add(category);
        return category;
    }

    protected Product AddProduct(Category category, string name)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = name,
            Category = category,
        };
        Db.Products.Add(product);
        return product;
    }

    protected Sale AddSale(
        Manager manager,
        Customer customer,
        DateTime date,
        SaleStatus status,
        params (Product Product, int Quantity, decimal Price, decimal Cost)[] lines)
    {
        var sale = new Sale
        {
            Id = Guid.NewGuid(),
            Manager = manager,
            Customer = customer,
            Date = date,
            Status = status,
            Items = lines.Select(line => new SaleItem
            {
                Id = Guid.NewGuid(),
                Product = line.Product,
                Quantity = line.Quantity,
                Price = line.Price,
                Cost = line.Cost,
            }).ToList(),
        };
        Db.Sales.Add(sale);
        return sale;
    }

    protected Task SaveAsync() => Db.SaveChangesAsync();
}
