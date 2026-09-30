using Mapster;
using SalesDashboard.Domain;
using SalesDashboard.Dto;

namespace SalesDashboard.Mapping;

public sealed class MappingRegister : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<CreateItemDto, Item>();
        config.NewConfig<Item, ItemDto>();
    }
}
