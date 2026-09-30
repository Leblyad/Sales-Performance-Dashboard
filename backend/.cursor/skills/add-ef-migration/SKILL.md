---
name: add-ef-migration
description: >-
  Adds an EF Core migration with dotnet ef when the user asks for one.
  Use for "добавь миграцию", "dotnet ef migrations", "снапшот модели",
  "обнови схему PostgreSQL", "add a migration", "update the PostgreSQL schema".
---

# Add EF migration

## When to use

The user explicitly asks for a migration. A new `DbSet` by itself does not start one.

## Steps

1. Change the model in `SalesDashboard.Api`. Do not add a second `DbContext`.
2. From `backend/`, run `dotnet ef migrations add <Name> --project SalesDashboard.Api --startup-project SalesDashboard.Api`.
3. Do not hand-write the migration file. Do not edit the generated snapshot unless the command already ran and a fix is required for the build.
4. Then follow `../.cursor/skills/update-vault-note/SKILL.md` (path from the `backend/` directory) and add a line to `vault/17 Миграции БД/Что фиксировать.md`.

## Notes

Run `dotnet ef database update` only when the user asks to apply the migration to the database.
