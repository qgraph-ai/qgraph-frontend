# Development

## Prerequisites

- **Node.js ≥ 20** (see `engines` in `package.json` if set; otherwise check CI).
- **npm** (repo uses `package-lock.json`).
- **Django backend running at `http://127.0.0.1:8000`** for anything that touches real data (Quran reader, auth, search). The surahs/ayahs endpoints are public (`security: []`), so the Quran pages don't need you to be signed in — they just need the backend reachable.
- **Playwright E2E does not require Django** by default; it uses a dedicated mock backend on `http://127.0.0.1:18000`.

The backend URL is set via `NEXT_PUBLIC_API_URL` in `.env.local`. Default used in tests: `http://127.0.0.1:8000`.

## First-time setup

```bash
npm install
npx playwright install chromium   # one-time browser download for E2E
```

## Commands cheat-sheet

| What | Command |
| --- | --- |
| Run the dev server | `npm run dev` (binds `127.0.0.1:3000`) |
| Production build | `npm run build` |
| Serve a built app | `npm start` |
| Lint | `npm run lint` |
| Type-check (no emit) | `npm run typecheck` |
| Unit / component tests, one-shot | `npm test` |
| Unit tests with coverage | `npm run test:coverage` |
| Unit / component tests, watch | `npm run test:watch` |
| E2E tests (headless) | `npm run test:e2e` |
| E2E tests, interactive UI mode | `npm run test:e2e:ui` |
| Open the last E2E HTML report | `npm run test:e2e:report` |

Playwright auto-starts `npm run dev` for E2E runs, and reuses it if it's already running locally (`reuseExistingServer: true` in dev — see `playwright.config.ts`). This means you can keep `npm run dev` open in another terminal while iterating on specs.
E2E also auto-starts `tests/e2e/mock-backend.mjs` on `:18000`, so it won’t collide with Django on `:8000`.

## Environment variables

- Parsed at startup through a Zod schema in `src/lib/env.ts` (fails fast on missing required vars).
- `NEXT_PUBLIC_*` is **public** — never put secrets there.
- Generate one-off secrets with `openssl rand -base64 32`.

Current frontend env vars:

- `NEXT_PUBLIC_API_URL` — Django API base URL.
- `NEXT_PUBLIC_SITE_URL` — public site origin for SEO/canonical generation.
- `NEXT_PUBLIC_ENABLE_SENTRY` — enables/disables Sentry wiring (`false` in local dev).
- `NEXT_PUBLIC_SENTRY_DSN` — optional browser DSN.
- `SENTRY_DSN` — optional server/edge DSN.
- `NEXT_PUBLIC_LOG_LEVEL` — one of `debug|info|warn|error|silent`.

## Pre-commit checks

Pre-commit hooks are configured with Husky + lint-staged:

- staged TS/TSX files: ESLint + related Vitest tests
- staged JS files: ESLint
- full repo typecheck

After cloning, run `npm install` (or `npm run prepare`) to ensure hooks are installed.

## RTL / i18n notes

UI copy lives in `src/i18n/messages/{en,fa}.json`. Whenever you add user-facing strings, add them in **both** files. The root layout sets `dir="rtl"` for `fa` automatically via `directionFor(locale)`. Use Tailwind logical properties (`ps-*`, `pe-*`, `start-*`, `end-*`) for all layout — never `pl-*` / `left-*`. See `CLAUDE.md` for the full rules.
