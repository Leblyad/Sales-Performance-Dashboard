---
name: draft-agent-prompt
description: >-
  Drafts one prompt for a separate backend or frontend chat and waits for
  acceptance before the journal or a build. Use for "напиши промпт",
  "поставь задачу агенту", "промпт на backend", "промпт на frontend",
  "разбей задачу по агентам", "write a prompt", "prompt for the backend",
  "prompt for the frontend".
---

# Draft agent prompt

## When to use

The work should go to the backend or frontend agent. This chat does not write that code and does not start the build.

## Steps

1. Pick one agent. If the API contract changes, the backend prompt comes first. The frontend prompt is the next one and points at the recorded contract.
2. Read one or two vault notes on the subject. Do not retell the PDF. Do not present an open item from `vault/Разбор задания/03 Домен/Открытые решения.md` as decided.
3. Write the prompt. It names one decision in one sentence: what the future commit will record. Include file paths, the vault links, what not to do (`vault/Разбор задания/09 Вне scope.md`), which items stay open, the done check, and the verify command. The last line tells the other chat to finish by showing the diff with `.cursor/skills/commit-scope/SKILL.md`.
4. Backend verify command: `dotnet build SalesDashboard.slnx` from `backend/`. Frontend: the script in `package.json` once that file exists. A frontend prompt also tells that chat to update the container with `.cursor/skills/update-containers/SKILL.md` after the build: frontend only, not `api` or `postgres`.
5. Show the full prompt. Stop. Wait for an edit or an explicit "ok" or "build".
6. After acceptance, tell the user which new chat to open and what to paste. Do not open the chat and do not paste into it. Do not append the drafted prompt to `AI_PROMPTS.md`.
7. If the user's own message is not yet in `AI_PROMPTS.md`, append that message only, using the journal rule in the root `AGENTS.md`. Do not repeat the format here.

## Notes

Do not copy stack or code style into the prompt. The backend chat reads `backend/AGENTS.md`. The frontend chat reads `frontend/AGENTS.md` and `frontend/react-client.md`.
