# QGraph Frontend

The Next.js 16 (App Router) frontend for QGraph — a toolkit for studying the Qur'ān (read, segment, search) that talks to a Django backend and, later, a separate AI service.

## Quick start

```bash
npm install
npx playwright install chromium   # one-time, for E2E tests
npm run dev                       # http://127.0.0.1:3000
```

The dev server expects a Django backend at `http://127.0.0.1:8000` for anything data-driven.

## Documentation

- **[docs/development.md](./docs/development.md)** — running locally, command cheat-sheet, env vars.
- **[docs/testing.md](./docs/testing.md)** — unit (Vitest) + E2E (Playwright): how to run, how to write.
- **[docs/architecture.md](./docs/architecture.md)** — tour of `src/` (routes, features, services, lib, i18n).
- **[CLAUDE.md](./CLAUDE.md)** — operational rules and conventions (authoritative).
- **[.ai/bootstrap/](./.ai/bootstrap/)** — longer-form bootstrap docs (project overview, backend contract, frontend best practices).

## Most-used commands

| What | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type-check | `npx tsc --noEmit` |
| Unit tests | `npm test` |
| E2E tests | `npm run test:e2e` |

Full list in [docs/development.md](./docs/development.md).
