# Sales Dashboard API

Один проект ASP.NET Core. Образец `Item` лежит в `Domain`, `Dto`, `Services`, `Validation` и `Mapping`. Ошибки — `AppException` и `AppExceptionHandler`. Логи — NLog (`nlog.config`).

```bash
dotnet build SalesDashboard.slnx
dotnet run --project SalesDashboard.Api
```

- Health: `GET /health`
- Swagger: `/swagger`
