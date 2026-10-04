# React client rules

Rules, practices, and libraries for the Sales Performance Dashboard React client.

**Tradeoff:** caution, clarity, and minimal changes over speed. Use the stack below. For trivial UI tweaks, use judgment.

The assignment does not name a UI kit. This file is the chosen client stack. Do not pick a chart library here; none is listed.

---

## 0. Scope

- Target: **React 19 + TypeScript** client, built with **Vite**.
- One browser page at about **1440×900**. Not a native desktop app. No mobile layout.
- KPI values come from the API. Do not compute revenue, profit, margin, or average check in the browser.
- Cover loading, error, and empty-period states on the dashboard.
- There is no login. Do not add auth screens or auth test journeys.
- Do not propose Next.js or React Server Components.

---

## 1. Stack

| Layer | Library | Purpose |
|-------|---------|---------|
| Language | TypeScript | contracts, fewer runtime bugs |
| Bundler | Vite | SPA tooling |
| UI | React 19 | UI |
| Routing | TanStack Router | typed routes |
| Server state | TanStack Query | cache, retry, dedupe, invalidation |
| Client UI state | Zustand | thin shared UI state |
| HTTP | axios | thin API client |
| Schemas | Zod | runtime validation at trust boundaries |
| Forms | React Hook Form + Zod | forms |
| Styles | Tailwind + shadcn/ui | UI without a second design system |
| Unit / component tests | Vitest + Testing Library | — |
| E2E | Playwright | critical journeys, without auth |
| Network mocks | MSW | predictable tests |
| Lint / format | ESLint (react-hooks) + Prettier | — |

Do not add libraries for flexibility. Do not swap this stack unless the user asks and the vault decision is updated.

`frontend/package.json` exists. The screen is still a stub. Do not add a test runner until tests are requested. Verify with `npm run build` from `frontend/`.

---

## 2. State: choose the right bucket

| Kind of state | Where it lives | Do not |
|---------------|----------------|--------|
| Local UI | `useState` | — |
| Shared UI (theme, sidebar, wizard step) | Zustand (or rare Context) | put frequently changing server data in Context |
| Server / API data | TanStack Query | copy API responses into Zustand/`useState` as source of truth, except a KPI period already stored in the dashboard store |
| Filters / shareable view state | Router search params | duplicate the same truth in a global store |

### Zustand rules

- One store per feature domain when needed (`useUiStore`, …).
- Always select: `useStore((s) => s.field)` — never bare `useStore()`.
- Multiple fields: `useShallow`.
- Derive in the selector; do not store computed duplicates.

### TanStack Query rules

- `useQuery` for reads, `useMutation` for writes, `useInfiniteQuery` for pages.
- Query keys: `[domain, action, params]` e.g. `['dashboard', 'summary', period]`.
- On successful mutation: invalidate **scoped** keys — never blanket `invalidateQueries()` without filters unless intentional.
- Do not fetch via `useEffect` + `fetch` as the default pattern.

---

## 3. React rules and modern APIs

- Obey the **Rules of React** (pure render; do not mutate props/state while rendering).
- Prefer deriving UI from props/state in render over syncing props → state in Effects.
- Do not enable React Compiler or sprinkle `useMemo` / `useCallback` / `React.memo` unless the user asks or a profile shows they are needed.
- Use when appropriate: `startTransition`, `useDeferredValue`, `useEffectEvent`.
- Error Boundaries at page + feature level; Suspense for lazy routes / async UI.

---

## 4. Components, structure, performance

The Vite app is a stub. Screen blocks render their names only. Do not compute KPI here.

```text
Dockerfile
nginx.conf
src/
  main.tsx
  routes/__root.tsx
  routes/index.tsx
  routeTree.gen.ts
  features/dashboard/
    entities/
    stores/
    services/
    sections/
    navigation.ts
    period.ts
  lib/api.ts
```

`Dockerfile` builds the stub and nginx serves `dist` on port 80. Host mapping used for a local check is `5173:80`. That is not the reviewer URL and not `docker compose up --build`.

- Keep the route thin. Under `features/dashboard/`: `entities/` for response interfaces, `stores/` for screen state, `services/` for the six GET calls, `sections/` for the screen blocks, `navigation.ts` for the tab list. `lib/api.ts` stays the shared fetch.
- shadcn lands in `src/components/ui/` when it is added. Do not create that folder empty.
- Do not add `React.lazy` for this single route. The router plugin already sets `autoCodeSplitting`.
- Long lists (100+): virtualize (e.g. TanStack Virtual).

---

## 5. Forms, types, API boundaries

- Validate at trust boundaries with Zod (or generate types from OpenAPI).
- Map backend ProblemDetails (`code`, status) to a single UI error helper — do not ad-hoc parse in every screen.
- Env for the API base: `VITE_API_*` — no hardcoded gateway URLs.
- Secrets do not belong in the client bundle.

---

## 6. Accessibility and UX

- Semantic HTML first; “No ARIA is better than bad ARIA”.
- Keyboard and focus management for dialogs/menus.
- Respect `prefers-reduced-motion` when adding animation.
- Loading, error, and empty states at the feature level (`isPending`, skeletons) — not one global spinner only.

---

## 7. Testing and verification

Until `package.json` exists, do not invent `npm test` or claim the UI runs.

When the app exists, prefer the scripts in `package.json`: typecheck, lint, Vitest, and Playwright for critical dashboard paths. No auth journey.

Do not add Storybook or a second test framework unless asked or already in the repo.

Do not claim “it works” without running the project’s checks (or say what was not run).

---

## 8. Surgical changes

- Do not drive-by rewrite CSS approach, state library, or router.
- Do not migrate to Next while here.
- Match existing file and feature-folder style.

---

## 9. Do not

- God-Context or God-Zustand store with API + UI mixed.
- Server state in Zustand for convenience.
- Premature memoization.
- Default data loading via `useEffect` + local state.
- Unscoped query invalidation that refetches the whole app.
- Secrets in the client bundle.
- A new UI kit, state library, or router without the user agreeing and the vault decision updated.
- Client-side KPI math, mobile layout, admin, or login.

---

## 10. Handoff checklist

- [ ] Changes map to the request; no drive-by stack swaps
- [ ] Server data in Query; UI-only in `useState`/Zustand
- [ ] Zustand selectors / `useShallow` used correctly
- [ ] Mutation success invalidates the right query keys
- [ ] ProblemDetails / errors handled consistently
- [ ] Loading, error, and empty period are covered when the screen changes
- [ ] typecheck / lint / relevant tests run, or the gap is stated
- [ ] Short report: what / why / how verified
