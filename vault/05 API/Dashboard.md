---
title: Dashboard
tags: [api]
role: dev
area: sales-dashboard
status: draft
updated: 2026-10-02
---

# Dashboard

> Шесть GET кормят блоки экрана: KPI, рейтинг, динамика, категории, продукты, последние продажи.

## Context

Сервер считает агрегаты и отдаёт готовые DTO. Клиент не получает сырые продажи, чтобы посчитать dashboard. См. [[Разбор задания/04 Dashboard/Экран]] и [[Разбор задания/05 API/Требования]].

## Details

- `GET /api/dashboard/kpi` — `KpiCardsQueryDto`: `PeriodFrom`, `PeriodTo` (`DateTime`). Ответ `KpiCardsDto`: `Revenue`, `Cost`, `GrossProfit`, `Margin`, `SalesCount`, `AverageCheck`. Суммы — `decimal`. `Margin` — доля, которую уже считает `kpi_cards`. `SalesCount` — число продаж.
- `GET /api/dashboard/ranking` — `ManagerRankingQueryDto`: `Mode` (`GrossProfit` или `AverageCheck`), `Skip`, `Take`. Ответ `SortedPageDto`: `Items` (`ManagerId`, `Name`, `Avatar`, `IsActive`, `TeamName`, `PositionName`, `GrossProfit`, `AverageCheck`), `Skip`, `Take`, `Sort`.
- `GET /api/dashboard/dynamics` — `ManagerDynamicsQueryDto`: `ManagerId`, `DateFrom`, `DateTo` (`DateOnly`). Ответ — список `ManagerDynamicsDto`: `Date`, `Revenue`, `GrossProfit`, `SalesCount`.
- `GET /api/dashboard/categories` — `CategoryStatQueryDto`: `DateFrom`, `DateTo` (`DateTime`), `Mode` (`SalesCount` или `Revenue`), `Skip`, `Take`. Ответ `SortedPageDto`: `Items` (`Id`, `Name`, `SalesCount`, `Revenue`), `Skip`, `Take`, `Sort`.
- `GET /api/dashboard/products` — без параметров. Ответ — список `TopProductDto`: `Id`, `Name`, `Revenue`, пять строк.
- `GET /api/dashboard/sales` — `RecentSalesQueryDto`: `CategoryId` (`Guid`, необязательный), `Skip`, `Take`. Без `CategoryId` страница — все продажи. С `CategoryId` — продажи, у которых есть товар этой категории. Сумма, прибыль и список товаров остаются по всей продаже. Ответ `PageDto`: `Items` (`Date`, менеджер `Id`/`Name`/`Avatar`, клиент `Id`/`Name`, товары `Id`/`Name`, `Status`, `Amount`, `GrossProfit`), `Skip`, `Take`.
- from и to включительны, см. [[03 Домен/Границы периода]]. Сравнение по дате или по времени и часовой пояс не заданы.
- Пустая дата и конец диапазона раньше начала — 400, тело `ValidationProblemDetails`. Знак `Skip` и `Take` не проверяется. У рейтинга, продуктов и последних продаж валидатора дат нет.
- Каждый путь вызывает один `GetAsync`. KPI — `Data/Queries/KpiCardsQuery.cs`. Рейтинг — `ManagerRankingQuery.cs`. Динамика — `ManagerDynamicsQuery.cs`. Категории — `CategoryStatQuery.cs`. Продукты — `TopProductsQuery.cs`. Последние продажи — `RecentSalesQuery.cs`: менеджер, клиент и товары входят в ту же проекцию.
- Клиент не догружает продажи, менеджера, клиента и товары отдельным запросом на строку. Общего числа строк нет.

## Decisions

Агрегаты считает сервер, браузер их не собирает из сырых продаж. Авторизации на маршрутах нет. Сравнение по дате или по времени, часовой пояс и пункты 6–10 остаются открытыми.

## Related

- [[05 API/Контракты]]
- [[02 Архитектура/DTO dashboard]]
- [[02 Архитектура/Процедура kpi_cards]]
- [[02 Архитектура/Представление рейтинга]]
- [[02 Архитектура/Процедура динамики]]
- [[02 Архитектура/Проекция категорий]]
- [[02 Архитектура/Проекция продуктов]]
- [[02 Архитектура/Проекция последних продаж]]
- [[Разбор задания/05 API/Требования]]
- [[Разбор задания/04 Dashboard/Экран]]
- [[Разбор задания/04 Dashboard/Состояния и граничные случаи]]
- [[Разбор задания/03 Домен/Открытые решения]]
- [[Разбор задания/03 Домен/Показатели и статусы]]
