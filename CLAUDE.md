@AGENTS.md

# CLAUDE.md — QGraph Frontend

Operational rules for Claude working in this repo. This is the short, actionable reference. For the full rationale, read the bootstrap docs listed under "Required reading".

## Required reading

Before making any non-trivial change, read (or re-read) the relevant bootstrap document:

- `docs/bootstrap/project_overview.md` — what QGraph is, the three-service architecture, where the frontend fits
- `docs/bootstrap/about_django_backend.md` — Django backend shape, endpoints, auth model, guest token flow, search lifecycle
- `docs/bootstrap/frontend_best_practices.md` — full frontend conventions with rationale

These files are authoritative. Prefer them over pre-trained assumptions.

## Framework rules

- **Next.js 16+, App Router.** APIs and conventions differ from older Next.js. Read `node_modules/next/dist/docs/` before using a Next.js feature you are not 100% sure about. Heed deprecation notices.
- **TypeScript everywhere.** No `any` without a clear reason.
- **Server Components by default.** Add `"use client"` only where interactivity is needed, and push the boundary as far down the tree as possible.
- **Never break client-side navigation.** Use `next/link` for internal links; `useRouter().push()` for programmatic navigation; plain `<a>` only for external URLs.

## Stack (fixed for now)

| Concern | Tool |
| --- | --- |
| Styling | Tailwind CSS v4 + `@tailwindcss/typography` |
| UI primitives | `shadcn/ui` on top of Radix UI |
| Icons | `lucide-react` (default) |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (single shared instance in `src/lib/api`) |
| Server state | TanStack Query |
| Tables | TanStack Table |
| Charts | Recharts |
| Theming | `next-themes` + CSS variables |
| Toasts | `react-hot-toast` |
| Skeletons | `react-loading-skeleton` or shadcn `Skeleton` |
| Sanitization | DOMPurify |
| Unit/component tests | Vitest + React Testing Library (+ MSW) |
| E2E tests | Playwright |
| Error monitoring | Sentry (`@sentry/nextjs`) in staging/production |

Do not introduce an alternative (e.g. SWR instead of TanStack Query, Formik instead of React Hook Form, Chakra instead of shadcn/Radix) without asking first.

## Backend integration rules

- The frontend talks **only to the Django backend**. It does **not** call the AI backend directly.
- Put all Django calls behind the shared Axios instance in `src/lib/api` with interceptors for:
  - `Authorization: Bearer <access_token>` for authed requests
  - `X-Search-Guest-Token` for guest search reads
  - error normalization
- Typed service modules live in `src/services/<django-app>/` (e.g. `src/services/search/`). Route and UI code call these services — not Axios directly.
- Mirror backend enums as TS unions. Never retype status strings inline. Relevant enums are in `about_django_backend.md`.
- Search async flow: submit → if 202, poll `poll_url` until terminal, then fetch `response_url`. If the response endpoint returns 409, keep polling. Handle `201` (sync) and `202` (async) distinctly.

## QGraph-specific requirements

### RTL + Arabic/Persian support is mandatory

- Use Tailwind **logical properties** (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `rounded-s-*`, `rounded-e-*`). Do **not** use `pl-*`, `pr-*`, `ml-*`, `mr-*`, `left-*`, `right-*` for content layout.
- Set `dir` and `lang` correctly on subtrees that contain Arabic/Persian text, even inside an otherwise-LTR UI.
- Directional icons (arrows, chevrons) must flip or swap in RTL contexts.
- Use `next/font` to self-host appropriate Arabic/Persian fonts. Keep a separate font-family CSS variable for Quran/Arabic text vs UI text.
- Do not manually reorder characters; rely on the Unicode bidi algorithm with correct `lang`.

### Dark + light mode is mandatory

- Use `next-themes` with the class-based Tailwind strategy.
- Use semantic color tokens (`bg-background`, `text-foreground`, `border-border`, etc.) — never hardcode colors that differ per theme.
- Test every new component in both themes before calling it done.
- Respect `prefers-color-scheme` on first load; allow an explicit toggle.

## Code-quality rules

- **No magic strings.** Extract repeated or meaningful literals (status values, API paths, query keys, storage keys, event names) into typed constants or `as const` unions.
- **Validate at boundaries.** Use Zod for form schemas, env var parsing, and any response parsing where schema drift is a real risk.
- **Always handle loading / empty / error states** for async UI. A blank screen during load is a bug.
- **Sanitize HTML** with DOMPurify before `dangerouslySetInnerHTML`. Prefer structured data from the backend over HTML fragments when possible.
- **Accessibility is not optional.** Use semantic HTML; labels on all form controls; keyboard access on every interactive element; WCAG AA contrast in both themes; respect `prefers-reduced-motion`. Do not undo Radix's a11y with custom wrappers.
- **No comments that restate the code.** Only comment non-obvious *why*.
- **Do not add abstractions for hypothetical future needs.** Three similar lines is fine; premature generalization is not.

## Folder conventions

- `src/app` — routes, layouts, `loading.tsx`, `error.tsx`
- `src/components/ui` — shadcn primitives (copied in, editable)
- `src/components` — shared presentational components
- `src/features/<feature>` — feature-scoped code (preferred once a feature has >2 files)
- `src/services/<django-app>` — typed backend clients
- `src/lib` — shared utilities, Axios client, helpers
- `src/hooks` — genuinely shared hooks
- `src/types` — shared TS types
- `src/styles` — global CSS, Tailwind layers
- `tests/e2e` — Playwright tests

Favor feature folders over type-based folders once a feature grows.

## Testing rules

- Default to unit/component tests with Vitest + React Testing Library.
- Add an E2E test **only** when a scenario cannot be meaningfully covered at the unit level (real browser behavior, real navigation, real integration).
- Focus E2E on happy paths; E2E tests are slow and brittle, so keep them targeted.
- When extending tests, actively prune E2E coverage that duplicates unit coverage.
- Tests must not depend on each other's state.
- Test behavior, not implementation details (no everything-snapshots, no shallow rendering).

## Secrets and environment variables

- Never put backend secrets in `NEXT_PUBLIC_*` — those are public.
- Parse `process.env` at startup through a Zod schema; fail fast on missing required vars.
- Generate cryptographic secrets (e.g. NextAuth secret, if added later) with `openssl rand -base64 32`.
- Do not log JWTs, guest tokens, or raw user input.

## Working style

- Ask before making destructive changes (force-push, branch deletion, dependency downgrades, schema-level changes).
- Small, focused commits with meaningful messages. Do not commit unrelated changes together.
- If a decision is load-bearing and not obvious from the code, add a short note in the PR description or the relevant bootstrap doc — not an inline comment.
- If a rule in this file contradicts something in `docs/bootstrap/`, trust the bootstrap doc and flag the discrepancy.
