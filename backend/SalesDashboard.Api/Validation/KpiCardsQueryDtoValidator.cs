using FluentValidation;
using SalesDashboard.Dto;

namespace SalesDashboard.Validation;

public sealed class KpiCardsQueryDtoValidator : AbstractValidator<KpiCardsQueryDto>
{
    public KpiCardsQueryDtoValidator()
    {
        RuleFor(query => query.PeriodFrom).NotEmpty();
        RuleFor(query => query.PeriodTo).NotEmpty();
        RuleFor(query => query.PeriodTo).GreaterThanOrEqualTo(query => query.PeriodFrom);
    }
}
