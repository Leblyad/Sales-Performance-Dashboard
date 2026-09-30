using Microsoft.EntityFrameworkCore;
using SalesDashboard.Domain;

namespace SalesDashboard.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Item> Items => Set<Item>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var item = modelBuilder.Entity<Item>();
        item.ToTable("items");
        item.HasKey(x => x.ExternalId);
        item.Property(x => x.ExternalId).ValueGeneratedNever();
        item.Property(x => x.Name).HasMaxLength(256).IsRequired();
        item.Property(x => x.Description).HasMaxLength(1024);
    }
}
