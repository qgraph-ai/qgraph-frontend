@AGENTS.md

# CLAUDE.md — QGraph Frontend

Operational rules for Claude working in this repo. This file is the project-memory baseline; the bootstrap and best-practices docs are authoritative for full rationale.

## Required reading (before non-trivial work)

Read in this order, picking what's relevant to the task:

1. `.ai/bootstrap/project_overview.md` — what QGraph is, the three-service architecture, where the frontend fits
2. `.ai/bootstrap/about_django_backend.md` — Django backend shape, endpoints, auth model, guest token flow, search lifecycle
3. `.ai/bootstrap/django_docs/index.md` (then relevant subdocs under `.ai/bootstrap/django_docs/`)
4. `.ai/best_practices/01_frontend_best_practices.md`
5. `.ai/best_practices/02_frontend_security_and_auth_additions.md`
6. `docs/architecture.md`
7. `docs/development.md`
8. `docs/testing.md`
9. `docs/observability.md`

If task context involves prior audits or closure status, also read:
- `.ai/reviews/README.md`
- `.ai/reviews/07_implementation_status_after_hardening.md`

For API schema, do targeted lookups in `.ai/bootstrap/django_docs/QGraph API.yaml`.

Do not assume old Next.js behavior. This codebase uses modern App Router patterns and may differ from training-era conventions. When uncertain, check `node_modules/next/dist/docs/` and heed deprecation notices.

## Architecture invariants (non-negotiable)

- System shape:
  - `qgraph-frontend` (this repo) is the UI/client layer
  - `qgraph-backend` (Django) is the backend source of truth
  - `qgraph-ai-service` is a separate AI backend
- Frontend talks **only to the Django backend**. It must **not** call the AI backend directly.
- Layering: route/components → feature modules → typed services → shared `apiClient`.
- Respect existing contracts before introducing new abstractions.

## Framework and code rules

- **Next.js App Router, TypeScript-first.**
- **Server Components by default.** Add `"use client"` only where browser interactivity is required, and push the boundary as far down the tree as possible.
- **Internal navigation:** use `next/link` for links, `useRouter().push/replace` for programmatic navigation. Plain `<a>` only for external URLs.
- Avoid `any` unless unavoidable and documented.
- Prefer clear, maintainable code over clever patterns.

## Stack policy (current)

| Concern | Tool |
| --- | --- |
| Styling | Tailwind CSS v4 (+ `@tailwindcss/typography` where used) |
| UI primitives | `shadcn/ui` on top of Radix UI |
| Icons | `lucide-react` (default) |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (single shared instance in `src/lib/api`) |
| Server state | TanStack Query |
| Tables | TanStack Table |
| Charts | Recharts |
| i18n | `next-intl` |
| Theming | `next-themes` + CSS variables |
| Toasts | `react-hot-toast` |
| Skeletons | `react-loading-skeleton` or shadcn `Skeleton` |
| Sanitization | DOMPurify |
| Unit/component tests | Vitest + React Testing Library (+ MSW) |
| E2E tests | Playwright |
| Observability | centralized logger + env-gated Sentry (`@sentry/nextjs`) |

Do not introduce competing alternatives (e.g. SWR instead of TanStack Query, Formik instead of React Hook Form, Chakra instead of shadcn/Radix) without explicit user approval.

## Data access and service-layer rules

- All backend calls go through the shared `apiClient` in `src/lib/api`, with interceptors for:
  - `Authorization: Bearer <access_token>` for authed requests
  - `X-Search-Guest-Token` for guest search reads
  - error normalization
- Typed service modules live in `src/services/<django-app>/` (e.g. `src/services/search/`). Route and UI code call services — not Axios directly.
- Mirror backend enums as TS unions; never retype status strings inline. Relevant enums are in `.ai/bootstrap/about_django_backend.md`.
- Use shared constants for endpoints, statuses, and query keys.
- Search async flow: submit → on `202`, poll `poll_url` until terminal, then fetch `response_url`. If the response endpoint returns `409`, keep polling. Handle `201` (sync) and `202` (async) distinctly.
- Prefer boundary validation (Zod) for drift-prone external data where practical.

## Security and auth rules

- Never trust raw `next`/return URL query params. Use `sanitizeReturnTo` for auth redirects and guest-back links.
- Reject external/protocol-relative redirect targets.
- Keep 401 refresh-retry behavior consistent:
  - allow retry for safe idempotent authenticated reads (e.g. `/api/auth/users/me/`)
  - do **not** retry login/refresh/logout/csrf/google auth endpoints
- Enforce protected auth pages at the server boundary where available.
- Never log tokens, emails, passwords, cookies, CSRF values, JWTs, guest tokens, or raw auth payloads.
- Prefer normalized safe errors over dumping backend responses.
- Keep auth error UX specific and truthful (e.g. don't show an activation-specific CTA for generic invalid credentials).

## Observability and logging rules

- Use `src/lib/observability/logger.ts` instead of ad-hoc `console.*`.
- Keep logs high-signal: auth state transitions, unexpected API failures, mutation failures.
- Redaction-first logging is required.
- Sentry: disabled locally by default; gated by env vars (`NEXT_PUBLIC_ENABLE_SENTRY`, DSNs). Do not force activation without environment setup.

## i18n, RTL, Quran text, and theming requirements

- **i18n is mandatory** (currently `en`, `fa`). Add user-facing strings to both locale message files. Avoid hardcoded user-facing text in components.
- **RTL correctness is mandatory:**
  - Use Tailwind logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `rounded-s-*`, `rounded-e-*`).
  - Do **not** use physical `pl-*`, `pr-*`, `ml-*`, `mr-*`, `left-*`, `right-*` for content layout.
  - Set `dir` and `lang` correctly on subtrees containing Arabic/Persian text, even inside an otherwise-LTR UI.
  - Directional icons (arrows, chevrons) must flip or swap in RTL contexts.
  - Do not manually reorder characters; rely on the Unicode bidi algorithm with correct `lang`.
- **Fonts:** use `next/font` to self-host Arabic/Persian fonts. Keep a separate font-family CSS variable for Quran/Arabic text vs UI text.
- **Dark + light mode is mandatory** for new UI. Use `next-themes` (class-based Tailwind strategy) with semantic tokens (`bg-background`, `text-foreground`, `border-border`, …) — never hardcode colors that differ per theme. Test in both themes before calling work done. Respect `prefers-color-scheme` on first load; allow an explicit toggle.

## Code-quality rules

- **No magic strings.** Extract repeated or meaningful literals (status values, API paths, query keys, storage keys, event names) into typed constants or `as const` unions.
- **Validate at boundaries.** Use Zod for form schemas, env-var parsing, and response parsing where schema drift is a real risk.
- **Always handle loading / empty / error states** for async UI. A blank screen during load is a bug.
- **Sanitize HTML** with DOMPurify before `dangerouslySetInnerHTML`. Prefer structured data from the backend over HTML fragments when possible.
- **No comments that restate the code.** Only comment non-obvious *why*.
- **No abstractions for hypothetical future needs.** Three similar lines is fine; premature generalization is not.

## Accessibility and UX standards

- Accessibility is required, not optional.
- Semantic HTML; labels on all form controls; keyboard reachability on every interactive element.
- WCAG AA contrast in both themes; respect `prefers-reduced-motion`.
- Do not undo Radix's a11y with custom wrappers.
- Cover loading, empty, and error states for async views.

## Folder conventions

- `src/app` — routes, layouts, `loading.tsx`, `error.tsx`
- `src/components/ui` — shadcn primitives (copied in, editable)
- `src/components` — shared presentational components
- `src/features/<feature>` — feature-scoped code (preferred once a feature has >2 files)
- `src/services/<django-app>` — typed backend clients
- `src/lib` — shared utilities, Axios client, helpers (incl. `src/lib/observability/logger.ts`)
- `src/hooks` — genuinely shared hooks
- `src/types` — shared TS types
- `src/styles` — global CSS, Tailwind layers
- `tests/e2e` — Playwright tests

Favor feature folders over type-based folders once a feature grows.

## Secrets and environment variables

- Never put backend secrets in `NEXT_PUBLIC_*` — those are public.
- Parse `process.env` at startup through a Zod schema; fail fast on missing required vars.
- Generate cryptographic secrets with `openssl rand -base64 32`.
- Do not log JWTs, guest tokens, or raw user input.

## Testing and quality gates

- Unit-first: default to Vitest + React Testing Library (+ MSW).
- Add E2E **only** when a scenario cannot be meaningfully covered at the unit level (real browser behavior, real navigation, real integration).
- Keep E2E focused on core happy paths and key regressions; prune E2E that duplicates unit coverage.
- Tests must not depend on each other's state.
- Test behavior, not implementation details (no everything-snapshots, no shallow rendering).
- **Coverage thresholds (enforced in Vitest):** statements ≥ 85, lines ≥ 85, functions ≥ 85, branches ≥ 75.
- Pre-commit: lint-staged + typecheck.

## CI and runtime expectations

- CI runs lint, typecheck, unit coverage, build, audit, and Playwright smoke.
- CI Node runtime is currently pinned to **24** in workflow.
- Playwright E2E uses:
  - frontend on `127.0.0.1:3000`
  - mock backend on `127.0.0.1:18000`
- E2E should not require Django backend running on `:8000`.

## Product status and delivery expectations

Current surface:
- landing page implemented
- auth flows implemented
- Quran pages implemented
- `/search` and `/segmentation` are intentional coming-soon routes

Do not treat coming-soon pages as missing/broken unless the task explicitly asks to implement full feature logic.

## Already resolved in hardening pass (do not re-open by default)

- open-redirect risk in auth `next` flow
- missing refresh-retry behavior for `users/me`
- client-only account route guard
- excessive auth debug logging
- password toggle keyboard-access issue
- hardcoded Quran accessibility labels
- missing `/segmentation` route placeholder
- missing baseline SEO outputs (`robots.ts`, `sitemap.ts`)
- missing pre-commit and CI quality-gate baseline

See `.ai/reviews/07_implementation_status_after_hardening.md` for closure details.

## Known follow-up areas (open unless task targets them)

- global eager auth bootstrap optimization
- possible `cache()` key improvements for object params
- broader runtime schema validation at service boundaries
- full advanced search and full segmentation implementation
- optional visual regression matrix for theme/viewport combinations
- optional offline-friendly font strategy for strict isolated environments

## Working style

- Make focused, minimal-risk changes. Do not bundle unrelated edits.
- Small, focused commits with meaningful messages.
- Ask before destructive actions (force-push, branch deletion, dependency downgrades, schema-level changes).
- If a load-bearing decision isn't obvious from the code, note it in the PR description or the relevant doc under `.ai/` — not as an inline comment.
- If a rule here conflicts with newer authoritative docs in `.ai/bootstrap`, `.ai/best_practices`, or `docs/`, call it out and follow the newer source.
