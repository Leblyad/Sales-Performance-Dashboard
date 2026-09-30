namespace SalesDashboard.Exceptions;

public sealed class ItemNotFoundException : AppException
{
    public const string ERROR_CODE = "ITEM_NOT_FOUND";

    public Guid ItemExternalId { get; }

    public ItemNotFoundException(Guid itemExternalId)
        : base(ERROR_CODE, $"Item '{itemExternalId}' was not found.", StatusCodes.NotFound)
    {
        ItemExternalId = itemExternalId;
    }

    public ItemNotFoundException(Guid itemExternalId, Exception innerException)
        : base(ERROR_CODE, $"Item '{itemExternalId}' was not found.", StatusCodes.NotFound, innerException)
    {
        ItemExternalId = itemExternalId;
    }
}
