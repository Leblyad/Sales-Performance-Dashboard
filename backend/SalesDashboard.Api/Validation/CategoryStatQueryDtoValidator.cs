using FluentValidation;
using SalesDashboard.Dto;

namespace SalesDashboard.Validation;

public sealed class CategoryStatQueryDtoValidator : AbstractValidator<CategoryStatQueryDto>
{
    public CategoryStatQueryDtoValidator()
    {
        RuleFor(query => query.DateFrom).NotEmpty();
        RuleFor(query => query.DateTo).NotEmpty();
        RuleFor(query => query.DateTo).GreaterThanOrEqualTo(query => query.DateFrom);
    }
}
