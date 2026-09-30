---
name: update-vault-note
description: >-
  Updates one working vault note when the domain, API, architecture,
  configuration, a migration, tests, or a progress stage change.
  Use for "обнови vault", "зафиксируй решение", "запиши контракт",
  "сдвинь прогресс", "закрой открытый пункт", "update the vault",
  "record the contract", and together with that kind of code change.
---

# Update vault note

## When to use

A change touches the domain, the API contract, architecture, configuration, a migration, test coverage, or a progress stage. A typo or a style edit does not.

## Steps

1. Open `vault/01 Онбординг/Как вести заметки.md` and pick one row of the table.
2. Use a template from `vault/Шаблоны/`. A new note follows the template, with a link in the section index and, when needed, in `vault/00 Индекс.md`.
3. One fact, one place. Do not append work history to `vault/Разбор задания/`. The exception is a closed row in `vault/Разбор задания/03 Домен/Открытые решения.md`: set the status to «принято» and link the note in `vault/03 Домен/`.
4. Do not close an open item unless the user accepted it.
5. Do not copy prompts or `AI_NOTES.md` into the vault.

## Notes

Do not copy the "where to write" map into `AGENTS.md`. When a note disagrees with the code, trust the code and fix the working note.
