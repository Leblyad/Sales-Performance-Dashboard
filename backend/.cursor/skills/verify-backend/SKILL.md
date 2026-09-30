---
name: verify-backend
description: >-
  Checks the backend by building the solution.
  Use for "проверь backend", "собери API", "dotnet build",
  "убедись что компилируется", "проверь /health", "build the API",
  "check /health".
---

# Verify backend

## When to use

Confirm that the backend project builds, or the user asks about `/health`.

## Steps

1. From `backend/`, run `dotnet build SalesDashboard.slnx`.
2. There is no test project and no compose file. Do not run `dotnet test` or `docker compose`.
3. Call `GET /health` only when a process is already listening. Do not start the API for the check unless the user asked.
4. If PostgreSQL is down, do not call that a successful check of `POST /api/items`.
5. Say what ran and how it ended.

## Notes

The build does not create the `items` table and does not apply migrations.
