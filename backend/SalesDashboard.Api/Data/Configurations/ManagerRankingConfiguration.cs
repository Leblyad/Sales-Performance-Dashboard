using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SalesDashboard.Data.Views;

namespace SalesDashboard.Data.Configurations;

public sealed class ManagerRankingConfiguration : IEntityTypeConfiguration<ManagerRanking>
{
    public void Configure(EntityTypeBuilder<ManagerRanking> builder)
    {
        builder.HasNoKey();
        builder.ToView("manager_rankings");
    }
}
