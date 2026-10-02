using FluentValidation;
using SalesDashboard.Dto;

namespace SalesDashboard.Validation;

public sealed class ManagerDynamicsQueryDtoValidator : AbstractValidator<ManagerDynamicsQueryDto>
{
    public ManagerDynamicsQueryDtoValidator()
    {
        RuleFor(query => query.DateFrom).NotEmpty();
        RuleFor(query => query.DateTo).NotEmpty();
        RuleFor(query => query.DateTo).GreaterThanOrEqualTo(query => query.DateFrom);
    }
}
