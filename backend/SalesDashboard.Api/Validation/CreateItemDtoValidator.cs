using FluentValidation;
using SalesDashboard.Dto;

namespace SalesDashboard.Validation;

public sealed class CreateItemDtoValidator : AbstractValidator<CreateItemDto>
{
    public CreateItemDtoValidator()
    {
        RuleFor(x => x.ExternalId)
            .NotEmpty();

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(256);

        RuleFor(x => x.Description)
            .MaximumLength(1024);
    }
}
