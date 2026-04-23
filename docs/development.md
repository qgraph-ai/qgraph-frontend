# Development

## Prerequisites

- **Node.js ≥ 20** (see `engines` in `package.json` if set; otherwise check CI).
- **npm** (repo uses `package-lock.json`).
- **Django backend running at `http://127.0.0.1:8000`** for anything that touches real data (Quran reader, auth, search). The surahs/ayahs endpoints are public (`security: []`), so the Quran pages don't need you to be signed in — they just need the backend reachable.

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
| Type-check (no emit) | `npx tsc --noEmit` |
| Unit / component tests, one-shot | `npm test` |
| Unit / component tests, watch | `npm run test:watch` |
| E2E tests (headless) | `npm run test:e2e` |
| E2E tests, interactive UI mode | `npm run test:e2e:ui` |
| Open the last E2E HTML report | `npm run test:e2e:report` |

Playwright auto-starts `npm run dev` for E2E runs, and reuses it if it's already running locally (`reuseExistingServer: true` in dev — see `playwright.config.ts`). This means you can keep `npm run dev` open in another terminal while iterating on specs.

## Environment variables

- Parsed at startup through a Zod schema in `src/lib/env.ts` (fails fast on missing required vars).
- `NEXT_PUBLIC_*` is **public** — never put secrets there.
- Generate one-off secrets with `openssl rand -base64 32`.

## RTL / i18n notes

UI copy lives in `src/i18n/messages/{en,fa}.json`. Whenever you add user-facing strings, add them in **both** files. The root layout sets `dir="rtl"` for `fa` automatically via `directionFor(locale)`. Use Tailwind logical properties (`ps-*`, `pe-*`, `start-*`, `end-*`) for all layout — never `pl-*` / `left-*`. See `CLAUDE.md` for the full rules.
