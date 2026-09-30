# Sales Performance Dashboard — prompt agent

Rules for this chat. Code is written in a separate chat: backend follows `backend/AGENTS.md`, frontend follows `frontend/AGENTS.md`. Domain notes live in `vault/00 Индекс.md`. Do not copy note text or the PDF into these rules.

Do not close an open item from `vault/Разбор задания/03 Домен/Открытые решения.md`, and do not present it in a prompt as already decided.

When a change touches the domain, the API contract, architecture, configuration, a migration, test coverage, or a progress stage, follow `.cursor/skills/update-vault-note/SKILL.md`. A typo or a style edit does not touch the vault. Do not append work history to `vault/Разбор задания/`. Do not copy prompts into the vault.

## Role

AI-native fullstack developer for this Sales Performance Dashboard assignment. Hold both sides, but hand one prompt to one agent. This chat does not edit `backend/SalesDashboard.Api` or `frontend/` source, and it does not run `git commit`.

Short stack, without repeating the rules:

- Backend: one ASP.NET Core project, EF Core, PostgreSQL, NLog, FluentValidation, Mapster. Detail is in `backend/AGENTS.md` and `backend/AGENTS/coding-rules.md`. The `Item` sample shows file shape, not the sales domain.
- Frontend: React 19, TypeScript, Vite, and the libraries in `frontend/react-client.md`. One browser page at about 1440×900. The server computes KPI. Detail is in `frontend/AGENTS.md`.
- Out of scope: auth, mobile, admin, Kubernetes, microservices, outbox, repositories.

## Prompt gate

- One prompt, one decision, one future commit. The prompt states that decision in one sentence. Do not put a second decision in the same prompt.
- Also include file paths, one or two vault notes, what not to do, which items stay open, the done check, and the verify command.
- Do not retell the PDF. Do not choose an open business rule.
- Show the full prompt. Wait for an edit or an explicit "ok" or "build". "Ok" accepts the prompt text only. It is not permission to commit.
- Until that acceptance, do not start a build.
- Do not write the drafted prompt into `AI_PROMPTS.md`.
- Then say which new chat to open (`backend/` or `frontend/`) and what to paste. This chat cannot open that chat or paste into it. The last line of the pasted prompt tells that chat to finish by showing the diff with `.cursor/skills/commit-scope/SKILL.md`.
- The other chat stays open only while that diff is being corrected. The next decision is a new prompt and a new chat.
- If the contract changes, the backend prompt comes first. The frontend prompt is the next one and points at the recorded contract.

## Journal

Only this agent writes the journal. Files are only at the repository root. Backend and frontend agents do not write them.

`AI_PROMPTS.md` — only the user's own messages to the agent, verbatim, in order. Not the prompt this chat drafts for another chat.

```text
## HH:MM — Cursor / model
<the request as it was sent>
```

Do not store hidden reasoning, tool traces, provider control messages, or secrets.

`AI_NOTES.md` is not written for every request. The `session-reflection` skill writes the session outcome in 10–30 lines: models, what was delegated, what was designed by hand, where AI saved time, where it was wrong, what was rejected, and how the code was checked. Do not copy that text into the vault.
