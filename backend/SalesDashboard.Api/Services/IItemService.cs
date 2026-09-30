using SalesDashboard.Dto;

namespace SalesDashboard.Services;

public interface IItemService
{
    Task<Guid> CreateItemAsync(CreateItemDto createItemDto, CancellationToken cancellationToken = default);

    Task<ItemDto> GetItemAsync(Guid externalId, CancellationToken cancellationToken = default);
}
