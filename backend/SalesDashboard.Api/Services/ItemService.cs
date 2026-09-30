using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using SalesDashboard.Data;
using SalesDashboard.Domain;
using SalesDashboard.Dto;
using SalesDashboard.Exceptions;

namespace SalesDashboard.Services;

public class ItemService(AppDbContext db, IMapper mapper) : IItemService
{
    public async Task<Guid> CreateItemAsync(CreateItemDto createItemDto, CancellationToken cancellationToken = default)
    {
        var existing = await db.Items
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalId == createItemDto.ExternalId, cancellationToken);

        if (existing is not null)
        {
            return existing.ExternalId;
        }

        var item = mapper.Map<Item>(createItemDto);
        db.Items.Add(item);
        await db.SaveChangesAsync(cancellationToken);

        return item.ExternalId;
    }

    public async Task<ItemDto> GetItemAsync(Guid externalId, CancellationToken cancellationToken = default)
    {
        var item = await db.Items
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalId == externalId, cancellationToken)
            ?? throw new ItemNotFoundException(externalId);

        return mapper.Map<ItemDto>(item);
    }
}
