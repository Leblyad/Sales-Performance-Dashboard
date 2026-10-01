# Agent coding rules

Behavioral guidelines for the single ASP.NET Core project `SalesDashboard.Api`.

**Tradeoff:** These guidelines bias toward caution, clarity, and minimal changes over speed. For trivial tasks, use judgment.

## 0. General answering rules

Be useful. Be clear. Do not expose private reasoning.

- Use the language of the user's message.
- Answer naturally, clearly, and like a human.
- Keep internal reasoning private.
- Prefer concise engineering communication for coding, commits, and IDE work. No role banners, no motivational filler.
- When reporting code changes, say what changed and how it was verified.

When the request can genuinely be solved in **different ways**:

- Present the distinct options briefly (tradeoffs, not a wall of text).
- Do not silently pick one when the choice is material to architecture, data model, or API contracts.
- After the user chooses (or when the choice is already fixed by a vault decision), implement that path only.

When introducing a **new approach** (pattern, library, storage model) that is not already established in the repo:

- Describe it before or while applying it: what it is, why it fits, what it costs.
- If it changes domain, API, or architecture, follow the vault skill `update-vault-note` at the repo root.

## 1. Think before coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State important assumptions explicitly.
- If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so.
- Push back when warranted.

If something is unclear and blocks progress, stop. Name what's confusing. Ask.

If the ambiguity does not block progress:

- State the assumption briefly.
- Continue with the safest reasonable interpretation.

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Skip the plan for trivial tasks.

## 2. Simplicity first

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- No cleverness when simple code is enough.
- Prefer extending existing logic over adding parallel new paths when the current flow can absorb the change.
- Keep tiny one-off logic inline; extract private methods or helpers when a method grows large or the logic is reused.

If you write 200 lines and it could be 50, rewrite it.

Ask yourself: *Would a senior engineer say this is overcomplicated?* If yes, simplify.

## 3. Surgical changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Don't rename things without need.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Avoid creating new files unless they are genuinely necessary for the task.
- Prefer modifying existing files and flows over introducing new modules, helpers, or wrappers.

When your changes create orphans:

- Remove imports, variables, functions, files, or dependencies that **your** changes made unused.
- Don't remove pre-existing dead code unless asked.

**The test:** Every changed line should trace directly to the user's request.

## 4. Goal-driven execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" → write/check invalid input cases, then make them pass.
- "Fix the bug" → reproduce the bug, then make it pass.
- "Refactor X" → ensure behavior stays the same before and after.
- "Add feature Y" → define expected behavior, implement only that behavior, verify it.

For multi-step work:

- Continue until the success criteria are met.
- Stop only if blocked by missing information, permissions, or unavailable tooling.

If blocked, say clearly: what was completed; what is blocking completion; what was verified; what still needs to be decided.

## 5. Verification

Don't claim it works unless you checked.

For this project the check is `dotnet build SalesDashboard.slnx` from `backend/`. There is no test project and no compose file; do not invent a runner for them.

`GET /health` counts only when the app is already running. A successful build does not mean PostgreSQL is available.

Do not add tests unless the user explicitly requests them, **or** the change touches calculation / schema formulas that the project requires tests for, **or** the task cannot be completed without updating tests.

If verification is not possible: say what could not be run; say what should be run to verify it.

## 6. Output discipline

Report the result, not the whole thought process.

When reporting back, include only useful information: what changed; why it changed; how it was verified; what was not completed or not verified.

Avoid: large diffs unless requested; private reasoning; unnecessary ceremony; generic advice; unrelated next steps.

## 7. Code style and scope

- **Style hierarchy:** Match the current file first, then the same folder in `SalesDashboard.Api`.
- **Preserve existing logic:** Do not alter business flows unless required by the task.
- **Extend, don't fork:** Adapt the existing implementation instead of adding a parallel path.
- **Constants:** Match the identifier style of the current file (`ErrorCode`). Error-code string values stay `UPPER_SNAKE` (`EXTERNAL_SERVICE_ERROR`).
- **Method size:** Split large methods; extract helpers when logic is reused or hard to read.
- **No trivial wrappers:** Do not wrap a few lines just for structure.
- **Business exceptions:** Throw a subclass of `AppException` with `Code` and `StatusCode`. Sample: `Exceptions/AppException.cs`. `AppExceptionHandler` maps it to ProblemDetails. Do not use bare `Exception` / `KeyNotFoundException` / `InvalidOperationException` for expected business failures.
- **No new comments by default:** including XML docs — unless the current file already uses the same kind nearby.
- **DI:** Register next to the existing `Add*` calls in `Program.cs`. Do not add a per-layer `Extensions/` folder.
- **Minimal deletion:** Delete only what your changes made unused or what breaks the new behavior.

## 8. Code generation order

Before writing code:

1. Does this need to exist? → if no, skip (YAGNI)
2. Already in this codebase? → reuse it
3. .NET / ASP.NET / EF does it? → use it
4. Already referenced package? → use it
5. One clear statement? → keep it local
6. Only then: the minimum that works

## 9. Git

- Do not run `git commit`. The user commits when the diff matches the decision.
- Do not force-push or amend unless the user explicitly requests it.
- To show the scope, follow `.cursor/skills/commit-scope/SKILL.md` at the repository root: `git diff` and a one-line message. That skill does not commit.

Do not restore outbox, HttpClient, repositories, or separate assemblies.
