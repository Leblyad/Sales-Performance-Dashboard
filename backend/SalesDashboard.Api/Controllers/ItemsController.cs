using Microsoft.AspNetCore.Mvc;
using SalesDashboard.Dto;
using SalesDashboard.Services;

namespace SalesDashboard.Controllers;

[ApiController]
[Route("api/items")]
[Produces("application/json")]
public class ItemsController(IItemService itemService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(Guid), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<Guid>> Create(
        [FromBody] CreateItemDto createItemDto,
        CancellationToken cancellationToken)
    {
        var externalId = await itemService.CreateItemAsync(createItemDto, cancellationToken);
        return CreatedAtAction(nameof(GetByExternalId), new { externalId }, externalId);
    }

    [HttpGet("{externalId:guid}")]
    [ProducesResponseType(typeof(ItemDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItemDto>> GetByExternalId(
        Guid externalId,
        CancellationToken cancellationToken)
    {
        var item = await itemService.GetItemAsync(externalId, cancellationToken);
        return Ok(item);
    }
}
