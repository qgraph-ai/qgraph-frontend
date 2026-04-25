# Architecture

A quick tour of the Next.js frontend. For conventions and rules, see `CLAUDE.md` and `.ai/best_practices/01_frontend_best_practices.md` — they're authoritative.

## Top-level layout

```
src/
├── app/            Next.js App Router — routes, layouts, loading/error boundaries
├── components/     Shared presentational components (site chrome, primitives)
│   └── ui/           shadcn/ui primitives (editable, copied in)
├── features/       Feature-scoped code (once a feature has >2 files)
│   ├── auth/
│   ├── landing/
│   └── quran/
├── services/       Typed backend clients (one folder per Django app)
│   ├── auth/
│   └── quran/
├── lib/            Shared utilities (Axios client, env parsing, helpers)
│   └── api/          Shared apiClient + interceptors + CSRF + refresh
├── hooks/          Genuinely shared hooks (none yet)
├── types/          Shared TS types (none yet)
├── i18n/           next-intl config, messages/{en,fa}.json, locale helpers
└── styles/         Global CSS, Tailwind layers
tests/
├── setup.ts        jest-dom, global mocks, MSW lifecycle
├── test-utils.tsx  renderWithProviders
├── msw/            MSW handlers + server
└── e2e/            Playwright specs
```

## Routing model

All routes under `src/app/`. Pages are **server components by default**; `"use client"` is added only where interactivity is needed, and the boundary is pushed as deep as possible.

| Segment | Purpose |
| --- | --- |
| `src/app/layout.tsx` | Root layout — locale, dir, font variables, providers |
| `src/app/page.tsx` | Landing page |
| `src/app/auth/` | Auth flows (sign-in, sign-up, activate, …) |
| `src/app/quran/` | Surah index + `[surah]/` reader |
| `src/app/search/` | Search coming-soon route |
| `src/app/segmentation/` | Segmentation coming-soon route |

`loading.tsx`, `error.tsx`, and `not-found.tsx` live next to their `page.tsx` per Next's conventions.

## Data flow

```
page.tsx (server)          ← Renders UI
    │
    ▼
features/<feature>/*       ← Feature-scoped server/client components
    │
    ▼
services/<django-app>/*    ← Typed backend calls (Axios + React cache())
    │
    ▼
lib/api/apiClient          ← Shared Axios instance with interceptors:
                             • CSRF attach on unsafe methods
                             • 401 → refresh → retry
                             • Error normalization to NormalizedApiError
    │
    ▼
Django backend (127.0.0.1:8000)
```

- Services are **thin** wrappers: call `apiClient`, return typed data. No ad-hoc HTTP inside pages or components.
- Types in `src/services/<app>/types.ts` mirror the OpenAPI schema. Enums become TS unions (e.g. `RevelationPlace = "meccan" | "medinan"`).
- Read-heavy service functions (e.g. `getSurah`, `listSurahs`) are wrapped with React's `cache()` so multiple calls in a single server render dedupe.

## Client-side state

- **Server state** — TanStack Query. Default config in `src/components/providers/query-provider.tsx` (60s stale, 5min gc, 1 retry, no refetch-on-focus).
- **Query keys** — per-feature `query-keys.ts` arrays ending with `as const`. E.g. `AUTH_QUERY_KEYS`, `QURAN_QUERY_KEYS`.
- **Forms** — React Hook Form + Zod.
- **Theming** — next-themes (class-based) + CSS variable tokens (`bg-background`, `text-foreground`, …). OKLCH for both themes.

## i18n and RTL

- `src/i18n/locales.ts` — `LOCALES = ["en", "fa"]`, `directionFor(locale)` returns `"rtl"` for `fa`.
- Messages in `src/i18n/messages/{en,fa}.json`. Types are inferred from `en.json` via `src/i18n/types.d.ts`.
- Arabic/Persian fonts (`Amiri` for Quranic text, `Vazirmatn` for Persian UI) are loaded via `next/font/google` in `src/lib/fonts.ts`.
- `html[lang="fa"]` switches the body to `var(--font-sans-fa)` automatically (see `globals.css`).
- **Logical Tailwind properties only** (`ps-*`, `pe-*`, `start-*`, `end-*`) for layout — never `pl-*` / `left-*`.

## Testing surfaces

- Unit/component — Vitest + RTL + MSW. Co-located under `__tests__/` next to source.
- E2E — Playwright under `tests/e2e/`.
- See `docs/testing.md` for the full guide.

## Where non-obvious decisions live

- **`CLAUDE.md` (root)** — hard rules for the codebase (framework version, RTL, dark mode, backend integration, accessibility).
- **`.ai/best_practices/01_frontend_best_practices.md`** — longer-form conventions with rationale.
- **`.ai/best_practices/02_frontend_security_and_auth_additions.md`** — additional security/auth practices.
- **`.ai/bootstrap/about_django_backend.md`** — backend shape, auth flow, async job pattern.
- **`.ai/bootstrap/django_docs/QGraph API.yaml`** — OpenAPI spec; canonical source for request/response shapes.
