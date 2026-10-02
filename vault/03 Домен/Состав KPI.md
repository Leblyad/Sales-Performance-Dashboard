---
title: Состав KPI
tags: [domain, rule]
role: all
area: sales-dashboard
status: draft
updated: 2026-10-02
---

# Состав KPI

> Revenue, Cost, GrossProfit, Margin, SalesCount и AverageCheck считаются только по продажам со статусом Paid. AverageCheck — среднее их Revenue.

## Context

Пункт 1 в [[Разбор задания/03 Домен/Открытые решения]] спрашивает, как `Refunded` влияет на Revenue, Cost, Gross Profit и количество продаж. Пункт 2 спрашивает, входит ли `Cancelled` в количество продаж и в знаменатель Average Check.

## Details

- Revenue, Cost, GrossProfit, Margin, SalesCount и AverageCheck считаются только по Paid.
- Revenue — сумма этих продаж. Revenue одной продажи — сумма `Price * Quantity` по её позициям.
- Cost — сумма Cost этих же оплаченных продаж. Cost одной продажи — [[03 Домен/Себестоимость]].
- GrossProfit — Revenue − Cost.
- Margin — GrossProfit / Revenue. Подстановку при нулевой выручке не задавать.
- SalesCount — число этих продаж.
- AverageCheck — среднее Revenue оплаченных продаж. Дальше используется эта же трактовка.
- Продажи не в статусе Paid в эти поля не входят.
- Пример. Две оплаченные продажи. Первая: Price 20×2 и 5×1, Cost 10×2 и 5×1 — Revenue продажи 45, Cost 25. Вторая: Price 15×1, Cost 5×1 — Revenue продажи 15, Cost 5. Строка: Revenue 60, Cost 30, GrossProfit 30, Margin 30 / 60, SalesCount 2, AverageCheck 30. Продажа не в статусе Paid в эти поля не входит.

## Decisions

Пункты 1 и 2 в [[Разбор задания/03 Домен/Открытые решения]] — «принято». Строка в [[03 Домен/Принятые правила]] ведёт сюда. Пункт 4 остаётся открытым: подстановка при нулевой выручке не задана.

## Related

- [[03 Домен/Принятые правила]]
- [[03 Домен/Себестоимость]]
- [[03 Домен/Возврат]]
- [[Разбор задания/03 Домен/Показатели и статусы]]
- [[Разбор задания/03 Домен/Открытые решения]]
- [[Разбор задания/07 Тестирование/Объём проверок]]
