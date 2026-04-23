# Testing

Two layers: **Vitest** for unit/component tests (the default), **Playwright** for E2E. Matches the stack listed in `CLAUDE.md` — unit-first, E2E only for scenarios that can't be meaningfully covered at the unit level.

## Commands

| What | Command |
| --- | --- |
| Run all unit/component tests once | `npm test` |
| Watch mode | `npm run test:watch` |
| Run a single unit test file | `npx vitest run path/to/file.test.ts` |
| Filter by test name | `npx vitest run -t "renders the hero"` |
| Run all E2E tests (headless) | `npm run test:e2e` |
| Run E2E with interactive UI | `npm run test:e2e:ui` |
| Open the last E2E HTML report | `npm run test:e2e:report` |
| Run one E2E file | `npx playwright test tests/e2e/landing.spec.ts` |
| Run E2E in headed browser (see the window) | `npx playwright test --headed` |
| Debug a single E2E step | `npx playwright test --debug` |

Playwright auto-starts `npm run dev` and reuses an existing dev server when present. No manual server orchestration needed.

## Unit / component tests (Vitest)

### Layout

```
tests/
├── setup.ts            # jest-dom, next/navigation mock, next-intl/server mock, MSW lifecycle
├── test-utils.tsx      # renderWithProviders (NextIntl + QueryClient), re-exports from RTL
└── msw/
    ├── server.ts       # Node MSW server
    └── handlers.ts     # Default request handlers (auth + quran)

src/**/__tests__/*.test.{ts,tsx}   # Co-located with the code under test
```

### Where to put a new test

- A function or hook → `__tests__/` sibling folder next to the source, file suffixed `.test.ts`.
- A component → same pattern with `.test.tsx`.
- A service → `src/services/<app>/__tests__/*.test.ts`.

### What we already mock globally (`tests/setup.ts`)

- `next/navigation`'s `useRouter`, `usePathname`, `useSearchParams` — the `mockRouter` is exported from `tests/setup.ts` if you need to assert navigation calls.
- `next-intl/server`'s `getTranslations`, `getLocale`, `getMessages` — backed by the real `en.json` messages. This lets async server components render in jsdom.
- MSW intercepts all `apiClient` traffic. Default handlers are in `tests/msw/handlers.ts`; override per-test with `server.use(http.get(...))`.

### Patterns worth knowing

**Rendering a client component with providers:**

```ts
import { renderWithProviders, screen } from "../../../../tests/test-utils"

renderWithProviders(<MyComponent prop="x" />)
expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument()
```

**Rendering an async server component:**

```ts
const el = await MyAsyncServerComponent({ prop: "x" })
renderWithProviders(el)
```

Keep async only at the top of the tree you're rendering. If you nest an async component inside a sync one, jsdom can't resolve it — hoist the `await` to the parent and pass resolved data in as props (see how `SurahIndex` passes `revelationLabel` to the sync `SurahRow`).

**Overriding an HTTP response for one test:**

```ts
import { http, HttpResponse } from "msw"
import { server } from "../../../../tests/msw/server"

server.use(
  http.get(`${API_URL}/api/v1/quran/surahs/`, () =>
    HttpResponse.json({ count: 0, next: null, previous: null, results: [] })
  )
)
```

Handlers reset between tests automatically (see `afterEach` in `tests/setup.ts`).

## E2E tests (Playwright)

### Layout

```
tests/e2e/
└── landing.spec.ts     # one sample spec today
playwright.config.ts    # repo root
```

Specs end in `.spec.ts` (matches `testMatch: /.*\.spec\.ts$/`). Vitest explicitly excludes `tests/e2e/**` so the two runners don't cross-match.

### What's in `playwright.config.ts`

- `testDir: "./tests/e2e"`, chromium-only (add firefox/webkit later if needed).
- `baseURL: http://127.0.0.1:3000` — use `page.goto("/quran")` not an absolute URL.
- `webServer` auto-runs `npm run dev`; `reuseExistingServer: true` in dev; `120s` startup timeout.
- `trace: "on-first-retry"`, `screenshot: "only-on-failure"`, `video: "retain-on-failure"`.
- `forbidOnly: true` + `retries: 2` in CI (via the `CI` env var).

### When to add an E2E test

Only for behavior that can't be meaningfully checked at the unit level:

- Real Next.js routing and SSR boundaries (navigating across real pages).
- Real browser behavior (focus management, scroll restoration, clipboard, `<details>` / `<dialog>`).
- End-to-end integration touching the real backend (auth flows, cookie-based sessions, CSRF).

Keep E2E on happy paths. Edge cases go in unit tests — they're faster and less flaky.

### Patterns worth knowing

```ts
import { expect, test } from "@playwright/test"

test.describe("quran reader", () => {
  test("opens a surah from the index", async ({ page }) => {
    await page.goto("/quran")
    await page.getByRole("link", { name: /Al-Fātiḥah/ }).click()
    await expect(page).toHaveURL(/\/quran\/1$/)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })
})
```

**Backend dependency.** The webServer inherits your shell env, so Next.js will hit whatever `NEXT_PUBLIC_API_URL` points at. For E2E specs that need backend data, either run Django locally first or stub HTTP per-test with `page.route(...)`:

```ts
await page.route("**/api/v1/quran/surahs/", (route) =>
  route.fulfill({ json: { count: 0, next: null, previous: null, results: [] } })
)
```

### Debugging

- **`npm run test:e2e:ui`** — interactive runner. Best path for writing new specs.
- **`npx playwright test --debug`** — step through with Playwright Inspector.
- **`npm run test:e2e:report`** — open the HTML report from the last run (traces, screenshots, video for failures).

## Guardrails (from `CLAUDE.md`)

- Default to unit/component tests.
- Add E2E only when the unit level can't meaningfully cover it.
- Focus E2E on happy paths — they're slow and brittle.
- When extending tests, actively prune E2E coverage that duplicates unit coverage.
- Tests must not depend on each other's state (MSW resets, but mind React's `cache()` — use unique inputs per test if a cached function would otherwise return stale data).
- Test behavior, not implementation details. No everything-snapshots. No shallow rendering.
