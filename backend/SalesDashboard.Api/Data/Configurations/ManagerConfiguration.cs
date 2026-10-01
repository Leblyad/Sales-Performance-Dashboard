using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SalesDashboard.Domain;

namespace SalesDashboard.Data.Configurations;

public sealed class ManagerConfiguration : IEntityTypeConfiguration<Manager>
{
    public void Configure(EntityTypeBuilder<Manager> builder)
    {
        builder.ToTable("managers");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired();
        builder.Property(x => x.Avatar).IsRequired();
        builder.HasOne(x => x.Team)
            .WithMany()
            .HasForeignKey(x => x.TeamId);
        builder.HasOne(x => x.Position)
            .WithMany()
            .HasForeignKey(x => x.PositionId);
    }
}
