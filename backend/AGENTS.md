# Backend

Rules for the backend agent. Behavior and code style: [AGENTS/coding-rules.md](AGENTS/coding-rules.md). Domain: `../vault/00 Индекс.md`.

Do not close an open item from `../vault/Разбор задания/03 Домен/Открытые решения.md`.

When a change touches the domain, the API contract, architecture, configuration, a migration, test coverage, or a progress stage, follow `../.cursor/skills/update-vault-note/SKILL.md`. A typo does not touch the vault. Do not append work history to `vault/Разбор задания/`. This agent does not write `AI_PROMPTS.md` or `AI_NOTES.md`.

One prompt is one decision. Finish by showing the diff with `../.cursor/skills/commit-scope/SKILL.md`. Do not run `git commit`. Stay in this chat only to correct that diff. The next decision is a new chat.

## Project

One project, `SalesDashboard.Api`.

```
SalesDashboard.Api/
  Domain/        Team, Position, Manager, Customer, Category, Product, Sale, SaleItem, SaleStatus
  Data/          AppDbContext, Configurations
  Dto/           PageDto, SortedPageDto, результаты и параметры запросов dashboard
  Mapping/       DashboardRegister
  Exceptions/    AppException, ExternalService, AppExceptionHandler
  Migrations/
  nlog.config    console, file, Metrics channel
```

Register services in `Program.cs`, next to the existing `Add*` calls. NLog is wired there.

Do not restore outbox, HttpClient, repositories, or separate assemblies. Do not add auth, mobile, admin, or Kubernetes.

## Verification

From `backend/`:

```bash
dotnet build SalesDashboard.slnx
```

There is no test project and no compose file. Call `GET /health` only when the process is already running. A successful build does not mean PostgreSQL is available.
