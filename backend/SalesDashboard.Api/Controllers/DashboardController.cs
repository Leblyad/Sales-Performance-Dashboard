using Microsoft.AspNetCore.Mvc;
using SalesDashboard.Data;
using SalesDashboard.Data.Queries;
using SalesDashboard.Dto;

namespace SalesDashboard.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController(AppDbContext db) : ControllerBase
{
    /// <summary>Карточки KPI за переданный период.</summary>
    /// <response code="200">Карточки KPI.</response>
    /// <response code="400">Пустая дата или конец диапазона раньше начала.</response>
    [HttpGet("kpi")]
    [ProducesResponseType<KpiCardsDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public Task<KpiCardsDto> Kpi([FromQuery] KpiCardsQueryDto query)
    {
        return KpiCardsQuery.GetAsync(db, query);
    }

    /// <summary>Страница рейтинга менеджеров.</summary>
    /// <response code="200">Страница рейтинга.</response>
    [HttpGet("ranking")]
    [ProducesResponseType<SortedPageDto<ManagerRankingDto, ManagerRankingMode>>(StatusCodes.Status200OK)]
    public Task<SortedPageDto<ManagerRankingDto, ManagerRankingMode>> Ranking([FromQuery] ManagerRankingQueryDto query)
    {
        return ManagerRankingQuery.GetAsync(db, query);
    }

    /// <summary>Динамика одного менеджера.</summary>
    /// <response code="200">Строки динамики по дням.</response>
    /// <response code="400">Пустая дата или конец диапазона раньше начала.</response>
    [HttpGet("dynamics")]
    [ProducesResponseType<List<ManagerDynamicsDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public Task<List<ManagerDynamicsDto>> Dynamics([FromQuery] ManagerDynamicsQueryDto query)
    {
        return ManagerDynamicsQuery.GetAsync(db, query);
    }

    /// <summary>Страница категорий за переданный период.</summary>
    /// <response code="200">Страница категорий.</response>
    /// <response code="400">Пустая дата или конец диапазона раньше начала.</response>
    [HttpGet("categories")]
    [ProducesResponseType<SortedPageDto<CategoryStatDto, CategoryStatMode>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public Task<SortedPageDto<CategoryStatDto, CategoryStatMode>> Categories([FromQuery] CategoryStatQueryDto query)
    {
        return CategoryStatQuery.GetAsync(db, query);
    }

    /// <summary>Пять продуктов с наибольшей выручкой.</summary>
    /// <response code="200">Список продуктов.</response>
    [HttpGet("products")]
    [ProducesResponseType<List<TopProductDto>>(StatusCodes.Status200OK)]
    public Task<List<TopProductDto>> Products()
    {
        return TopProductsQuery.GetAsync(db);
    }

    /// <summary>Страница последних продаж.</summary>
    /// <response code="200">Страница продаж.</response>
    [HttpGet("sales")]
    [ProducesResponseType<PageDto<RecentSaleDto>>(StatusCodes.Status200OK)]
    public Task<PageDto<RecentSaleDto>> Sales([FromQuery] RecentSalesQueryDto query)
    {
        return RecentSalesQuery.GetAsync(db, query);
    }
}
