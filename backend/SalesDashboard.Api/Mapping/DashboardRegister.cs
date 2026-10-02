using Mapster;
using SalesDashboard.Data.Models;
using SalesDashboard.Data.Views;
using SalesDashboard.Dto;

namespace SalesDashboard.Mapping;

public sealed class DashboardRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<KpiCards, KpiCardsDto>();
        config.NewConfig<ManagerRanking, ManagerRankingDto>();
        config.NewConfig<ManagerDynamics, ManagerDynamicsDto>();
        config.NewConfig<CategoryStat, CategoryStatDto>();
        config.NewConfig<TopProduct, TopProductDto>();
        config.NewConfig<RecentSaleManager, RecentSaleManagerDto>();
        config.NewConfig<RecentSaleCustomer, RecentSaleCustomerDto>();
        config.NewConfig<RecentSaleProduct, RecentSaleProductDto>();
        config.NewConfig<RecentSale, RecentSaleDto>();
    }
}
