# Frontend

Rules for the frontend agent. UI stack and style: [react-client.md](react-client.md). Screen notes: `../vault/Разбор задания/04 Dashboard/Экран.md` and `../vault/Разбор задания/04 Dashboard/Состояния и граничные случаи.md`.

Do not close an open item from `../vault/Разбор задания/03 Домен/Открытые решения.md`.

When a change touches the domain, the API contract, architecture, configuration, a migration, test coverage, or a progress stage, follow `../.cursor/skills/update-vault-note/SKILL.md`. A typo does not touch the vault. Do not append work history to `vault/Разбор задания/`. This agent does not write `AI_PROMPTS.md` or `AI_NOTES.md`.

One prompt is one decision. Finish by showing the diff with `../.cursor/skills/commit-scope/SKILL.md`. Do not run `git commit`. Stay in this chat only to correct that diff. The next decision is a new chat.

## Already decided

- React 19, TypeScript, Vite, and the rest of the stack in `react-client.md`.
- One browser page at about 1440×900. Not a native desktop app and not a mobile layout.
- The server computes KPI.
- Do not add auth, admin, or mobile.
- Do not pick a chart library until it is named in `react-client.md` and in the vault.

`package.json` is in this directory. The dashboard files are stubs. Do not fill them with KPI math or a chart library.

## Verification

From `frontend/`: `npm run build`. Then, from the repository root, `docker compose up --build -d frontend`, so http://localhost:5173 serves that build. Do not claim the screen is done because the stub compiled.
