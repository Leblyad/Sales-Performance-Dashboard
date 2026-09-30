---
name: dashboard-states
description: >-
  Builds the dashboard screen from the assignment notes and react-client.md.
  Use for "сделай dashboard", "экран KPI", "рейтинг менеджеров",
  "график продаж", "состояние загрузки", "пустой период",
  "ошибка API на экране", "dashboard screen", "loading state", "empty period".
---

# Dashboard states

## When to use

The user asks for the screen, a dashboard block, or the loading, error, and empty-period states. Do not add packages until the user asks to build the client.

## Steps

1. Read `frontend/react-client.md` and the two notes `vault/Разбор задания/04 Dashboard/Экран.md` and `vault/Разбор задания/04 Dashboard/Состояния и граничные случаи.md`.
2. Take KPI values from the API. Do not recompute them in the browser.
3. Cover the required screen blocks before extra charts. Do not pick a chart library.
4. On the blocks you touch, show loading, error, and empty period.
5. Do not close open items from `vault/Разбор задания/03 Домен/Открытые решения.md`.
6. Verify with a script from `frontend/package.json` when that file exists. If it does not, say so.

## Notes

Do not swap the stack. Do not add auth, mobile, or admin.
