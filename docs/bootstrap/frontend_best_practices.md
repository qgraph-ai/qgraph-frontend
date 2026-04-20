# Frontend Best Practices for QGraph

This document lists practical conventions and industry-standard choices for the QGraph frontend.
The goal is not to enforce every possible rule, but to provide a stable baseline for human developers and AI coding agents.

These guidelines should be followed unless there is a clear reason to do otherwise. When a section says "use X", treat it as the default — deviating is allowed, but should be a deliberate decision.

---

## 1. Use TypeScript by default

Use TypeScript for application code, components, hooks, utilities, API clients, and shared types.

Why:
- improves maintainability in medium and large codebases
- makes refactoring safer
- reduces ambiguity for AI agents and human developers
- works naturally with modern Next.js projects

Rule:
- prefer explicit types for API contracts, component props, and reusable utilities
- avoid unnecessary `any`
- keep shared domain types in a dedicated place such as `src/types`

---

## 2. Follow the App Router conventions

Use the Next.js App Router as the primary routing model.

Why:
- it is the modern standard in Next.js
- it aligns with current framework conventions
- it supports layouts, nested routing, server components, and modern data patterns

Rule:
- place route-related code under `src/app`
- respect Next.js file conventions instead of inventing custom routing patterns
- prefer framework-native patterns before adding extra abstractions

Important: QGraph uses a recent Next.js release (Next.js 16+). APIs, conventions, and file structure may differ from older tutorials or pre-trained assumptions. Always consult the in-repo docs at `node_modules/next/dist/docs/` before introducing new framework features.

---

## 3. Prefer Server Components by default

In Next.js App Router projects, prefer Server Components unless client-side interactivity is actually required.

Why:
- this is the default model in the App Router
- it helps reduce unnecessary client-side JavaScript
- it encourages clearer separation between rendering and interaction logic

Rule:
- only add `"use client"` where it is needed
- avoid making large subtrees client-side without a reason
- keep interactive logic isolated in focused client components
- push the `"use client"` boundary as far down the tree as possible

---

## 4. Use ESLint and automated formatting

The project should use linting and formatting from the start, and these checks should run automatically before commits.

Why:
- prevents style drift
- catches common mistakes early
- makes AI-generated code easier to normalize
- reduces noisy review comments

Rule:
- keep ESLint enabled
- add pre-commit hooks (e.g. `husky` + `lint-staged`) for linting and formatting
- use one formatting approach consistently across the repo (Prettier is the default baseline)

---

## 5. Use Tailwind CSS for styling

Use Tailwind CSS as the main styling approach unless there is a strong reason not to.

Why:
- it fits well with modern Next.js projects
- it keeps styling close to components
- it is fast for iteration
- it works well for dashboards, admin interfaces, and product UIs

Rule:
- use utility classes for most styling
- extract reusable UI patterns into components instead of copying very large class strings everywhere
- avoid mixing too many competing styling systems
- use the **`@tailwindcss/typography`** plugin for long-form readable text (explanations, article-like blocks, Quran context text)
- prefer logical properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`) over physical ones (`pl-*`, `pr-*`, `ml-*`, `mr-*`, `left-*`, `right-*`) so the UI works in both LTR and RTL (see section 19)

---

## 6. Use a reusable UI layer built on accessible primitives

Build a small reusable UI layer instead of styling every page from scratch.

Recommended approach:
- use **`shadcn/ui`** as the base UI system — it is copy-in, customizable, and built on top of Radix UI primitives
- customize the copied components to match QGraph needs
- keep design tokens and repeated patterns consistent
- when a primitive is missing from shadcn, reach for **Radix UI** directly rather than pulling in a third UI library

Why:
- accessible, well-structured building blocks (dialogs, menus, tooltips, tabs, etc.)
- Radix handles focus management, keyboard navigation, and ARIA wiring correctly
- forms, dialogs, buttons, tables, and menus stay visually consistent

Rule:
- treat `shadcn/ui` as a starting point, not an unchangeable library
- avoid pulling in random UI patterns from multiple unrelated libraries
- if a primitive is copied into the repo, it belongs to the repo — it can and should be adapted

---

## 7. Use React Hook Form + Zod for forms

For forms such as login, registration, filters, settings, or multi-field workflows, use **React Hook Form** with **Zod** for schema validation (via `@hookform/resolvers/zod`).

Why:
- React Hook Form keeps form state uncontrolled-by-default, which is fast and ergonomic
- Zod gives a single source of truth for runtime validation and TypeScript types (`z.infer<typeof schema>`)
- together they produce clean error handling and strong typing

Rule:
- use React Hook Form for any form with validation, submission state, or multiple fields
- define the Zod schema alongside the form (or in a sibling file); derive the TS type from the schema
- show field-level errors clearly in the UI
- disable the submit button while submitting; show loading feedback

Practical note:
- for a single-field inline toggle or trivial input, hand-rolled `useState` is still fine

---

## 8. Validate at data boundaries

Validate data at important boundaries, especially:
- form inputs (see section 7)
- API request payloads
- API response parsing when schema drift is a realistic risk
- environment variables (parse `process.env` once at startup via a Zod schema)

Why:
- frontend bugs often come from bad assumptions about data shape
- explicit validation reduces silent failures and surfaces contract drift with the Django backend early
- it helps both human developers and AI agents work with clearer contracts

Rule:
- do not trust external data blindly
- define shared Zod schemas for important payloads
- prefer predictable error handling over implicit assumptions

---

## 9. Centralize API communication with Axios

Do not scatter raw `fetch` calls across the codebase. Use a single configured **Axios** client.

Why:
- QGraph frontend talks to a Django backend
- request behavior, auth headers, error handling, and base URL should be consistent
- interceptors are the right place for JWT handling, guest-token injection for search, and error normalization
- centralization makes future refactors (e.g. token refresh, retry policy) much easier

Rule:
- keep a single Axios instance in `src/lib/api` (or `src/services/api`)
- attach `Authorization: Bearer <access_token>` via a request interceptor
- attach `X-Search-Guest-Token` when present (see `about_django_backend.md` section 6)
- normalize errors in a response interceptor so callers see a consistent shape
- route/UI code should call typed service functions (e.g. `search.submit(...)`), not build requests by hand

Note:
- `NEXT_PUBLIC_API_BASE_URL` (or equivalent) holds the Django base URL
- the Django backend is the only API the frontend talks to directly — it does not call the AI backend

---

## 10. Manage server state with TanStack Query

For any data fetched from the Django backend in client components (and for caching, polling, invalidation, optimistic updates), use **TanStack Query** (`@tanstack/react-query`).

Why:
- server state is different from client state — it needs caching, refetching, staleness, and background updates
- hand-rolled `useEffect` + `useState` around fetches gets painful quickly and tends to drift
- TanStack Query pairs well with Axios via `queryFn`
- it handles polling cleanly (important for the async search flow that polls an execution until terminal)

Rule:
- prefer server components + direct `await` for page-level reads when possible
- use TanStack Query for interactive client-side data, mutations, polling, and anything needing invalidation
- keep query keys stable and structured (e.g. `["search", "execution", id]`)
- colocate the query hook with the feature (e.g. `src/features/search/hooks/useSearchExecution.ts`)

For Server Components' own data caching, use React's built-in `cache()` to dedupe requests within a single render, and use Next.js's fetch cache / revalidate options thoughtfully.

---

## 11. Separate domain code from UI code

Avoid putting business logic directly inside page components.

Why:
- large components become difficult to maintain
- business logic often needs reuse
- mixed UI/data logic is harder for AI agents to modify correctly

Rule:
- keep presentational components focused on rendering
- move reusable logic to hooks, service modules, or helpers
- keep domain-specific types and transformations outside the component body when possible

---

## 12. Use client-side navigation — never break it

All in-app navigation should go through Next.js's client-side router.

Why:
- full page reloads lose client-side state, re-download JS, and feel noticeably slower
- accidental full reloads are a very common regression when using plain `<a>` tags or third-party link components

Rule:
- use `next/link`'s `<Link>` for internal navigation
- do **not** wrap a `next/link` `<Link>` around a Radix `<Link>` (or any component that renders its own `<a>`) in a way that creates nested anchors or causes a full reload — if you use a design-system Link, pass `asChild` / `as` props correctly so it composes with `next/link` instead of replacing it
- reserve plain `<a href>` for external links (and add `target="_blank"` + `rel="noopener noreferrer"` when appropriate)
- use `useRouter()` / `router.push` for programmatic navigation, not `window.location`

---

## 13. Handle loading, empty, and error states explicitly

Every important async UI should define what happens in these four cases:
- loading
- success
- empty result
- error

Recommended building blocks:
- **React Loading Skeleton** (`react-loading-skeleton`) or shadcn's `Skeleton` component for placeholder UI during load
- **React Hot Toast** (`react-hot-toast`) for transient notifications (mutation success, non-blocking errors)
- use Next.js App Router's `loading.tsx` and `error.tsx` for route-level boundaries
- use Suspense boundaries for streaming server-rendered content

For local dev testing of loading states, the `delay` npm package (or a small `sleep` helper) is useful to simulate latency against a fast dev backend. Never ship artificial delays to production.

Rule:
- never assume data always exists
- always render a skeleton or spinner while loading — blank screens feel broken
- empty states should tell the user what to do next
- error states should be understandable and should not leak stack traces
- use toasts for feedback on user-triggered actions, not for critical errors that need attention

---

## 14. Icons

Use a single icon library to keep the UI consistent.

Default:
- **Lucide React** (`lucide-react`) — this is the default icon set used by `shadcn/ui`
- **`@radix-ui/react-icons`** is an acceptable companion when a specific Radix-style icon fits better
- **React Icons** (`react-icons`) is fine when an external brand icon is needed, but avoid mixing three icon packs for the same role

Rule:
- pick one primary icon library per UI area and stick with it
- icons should have `aria-label` or be wrapped by a labeled element when they are the only content of an interactive control

---

## 15. Tables: use TanStack Table for non-trivial tables

For tables with sorting, filtering, column visibility, pagination, or selection, use **TanStack Table** (`@tanstack/react-table`, headless).

Why:
- headless = full styling control with Tailwind/shadcn
- built-in primitives for sorting, filtering, pagination, selection
- keeps table logic declarative and typed

Rule:
- for a trivial read-only list of 5–20 rows, a plain `<ul>` or `<table>` is fine
- as soon as sorting or pagination is needed, reach for TanStack Table rather than hand-rolling

---

## 16. Pagination

Prefer server-driven pagination matching the Django backend's pagination contract.

Rule:
- read the backend's pagination shape from `about_django_backend.md` / live API responses; do not invent query params
- keep page/cursor state in the URL (search params) so the page is shareable and refresh-safe
- combine with TanStack Query's `keepPreviousData` / `placeholderData` for smooth page transitions
- for infinite lists, use TanStack Query's `useInfiniteQuery`

---

## 17. Charts: use Recharts

For data visualization (search analytics, segmentation stats, etc.), use **Recharts**.

Why:
- composable React components
- good default styling and accessibility
- reasonable bundle size for typical dashboard needs

Rule:
- charts are usually client components (`"use client"`)
- respect the active theme (dark/light) — read colors from CSS variables rather than hardcoding
- always include axis labels and a legend for non-trivial charts
- provide a text-accessible summary where the data is important

---

## 18. Theming: support dark and light mode from day one

QGraph must support both dark and light mode.

Recommended approach:
- use **`next-themes`** for the theme provider
- use Tailwind's `dark:` variant (class-based strategy)
- define theme colors as CSS variables (this is the shadcn/ui default) so Recharts, custom components, and third-party UI all follow the theme

Rule:
- never hardcode colors that differ between themes — use semantic tokens (`bg-background`, `text-foreground`, `border-border`, etc.)
- test every new component in both themes
- respect the user's system preference on first load, but allow an explicit toggle
- avoid flash-of-wrong-theme: follow the `next-themes` SSR guidance

---

## 19. Internationalization, RTL, and Arabic/Persian typography

QGraph is a Quran-adjacent product. Arabic and Persian content is first-class, and right-to-left layout must work correctly.

### 19.1 RTL layout

- use logical CSS properties everywhere (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`, `rounded-s-*`, `rounded-e-*`) instead of `left`/`right` equivalents
- set `dir` per element or per subtree when the content direction differs from the surrounding UI — do not assume the whole page is one direction
- for mixed-direction UI (English UI chrome + Arabic content, or vice versa), wrap Arabic/Persian blocks in a container with `dir="rtl"` and appropriate `lang` attribute
- test flipped layouts: icons with directional meaning (arrows, back/forward) should flip or be swapped in RTL
- for text with mixed scripts, rely on the Unicode bidi algorithm — do not manually reorder characters; use the `lang` attribute so the browser applies correct shaping

### 19.2 Arabic and Persian typography

- load proper Arabic/Persian web fonts (e.g. Amiri, Scheherazade New, or Noto Naskh Arabic for Quran text; Vazirmatn or IRANSans-equivalents for Persian UI)
- use `next/font` to self-host fonts with correct subsetting and preloading
- define a separate font family CSS variable for Quran/Arabic body text vs UI text; apply them via Tailwind `font-*` utilities
- Quran ayah rendering has special concerns: tajweed coloring, ayah separators (U+06DD), diacritics (harakat). If these are added, do it deliberately and test across browsers
- line-height and letter-spacing defaults tuned for Latin text often look cramped in Arabic/Persian — adjust per language

### 19.3 Content and i18n strings

- if the UI becomes multilingual, use a proper i18n library (`next-intl` or similar) rather than ad hoc string maps
- keep user-facing strings out of component bodies; colocate them in translation files or a constants module
- numbers: Persian users frequently expect Persian/Arabic-Indic digits for content but Western Arabic digits in technical contexts — make this a conscious choice per field

---

## 20. Metadata and SEO

Use the App Router's metadata API for every page that can be indexed or shared.

Rule:
- export `metadata` (or `generateMetadata`) from each route with meaningful `title`, `description`, and Open Graph fields
- set `lang` and `dir` on the root `<html>` element in `layout.tsx` based on the active locale
- use canonical URLs for pages that can be reached through multiple paths

---

## 21. Security: XSS and safe HTML rendering

- never set `dangerouslyInnerHTML` with untrusted content
- if the backend returns HTML fragments (e.g. `highlighted_text` from search results), sanitize with **DOMPurify** before rendering — ideally on the server, or in a dedicated wrapper component
- prefer structured data (ranges, offsets) over raw HTML from the backend when possible, so the frontend controls markup
- escape user-supplied content used in `href`, `src`, inline styles, etc.
- obey the guidance in `about_django_backend.md` around guest tokens — they are bearer-style secrets for a single search; treat them as such

---

## 22. Avoid magic strings and numbers

Extract repeated or meaningful literals into typed constants or enums.

Why:
- typos in string literals become silent bugs
- constants give a single place to update when a value changes
- TS string literal unions + `as const` give type safety for free

Rule:
- define status enums, mode values, API paths, query keys, storage keys, and event names as constants
- for values that come from the backend (e.g. execution status `pending | queued | running | succeeded | partial | failed | canceled`), mirror them as a TS union and import that union everywhere; do not retype the literals inline
- keep constants near the feature they belong to; only hoist to a shared module when genuinely shared

---

## 23. Testing strategy: unit + E2E, with unit preferred

Use a layered testing approach.

Recommended tooling:
- **Vitest** + **React Testing Library** for unit/component tests
- **Playwright** for end-to-end tests
- **MSW** (Mock Service Worker) for mocking HTTP in unit/component tests when needed

### 23.1 What to test where

Unit / component tests:
- pure utilities and hooks
- component rendering and interaction
- form validation logic
- service-layer behavior (mock the Axios transport with MSW)

E2E tests:
- critical user journeys only (login, submitting a search, viewing a result, bookmarking)
- cross-page/navigation flows
- authentication boundaries and guest-token access

### 23.2 Rules

- focus E2E on happy paths — they are slow and brittle by nature; keep them targeted
- do **not** duplicate E2E for scenarios already well covered by unit tests
- when reviewing existing E2E tests, remove any scenario already covered by unit tests; keep only those that exercise real browser behavior, real navigation, or real integration
- component tests should test behavior, not implementation details (no snapshot-everything, no shallow rendering)
- tests must not depend on each other's state

### 23.3 Agent guidance

AI agents writing tests should:
- default to unit/component tests
- add an E2E test only when the scenario cannot be meaningfully covered at the unit level
- after implementing a feature, prune redundant tests rather than leave overlapping coverage

---

## 24. Performance and caching

- use React `cache()` to dedupe data fetches within a single server render
- use Next.js fetch caching and route segment config (`revalidate`, `dynamic`) deliberately — do not sprinkle `no-store` reflexively
- split client bundles by route; avoid shipping server-only libraries to the client
- lazy-load heavy client components (charts, rich editors) with `next/dynamic`
- profile before optimizing; do not prematurely memoize

---

## 25. Observability and error monitoring

Console logging alone is not enough for a serious frontend.

Use **Sentry** (`@sentry/nextjs`) for production error monitoring.

Why:
- production frontend failures are often hard to reproduce locally
- stack traces, user context (anonymized), release tracking, and performance traces are valuable
- Sentry integrates with Next.js App Router via the official SDK

Rule:
- wire Sentry behind an env flag so it only runs in staging/production
- scrub PII before sending (emails, auth tokens, query text if sensitive)
- create releases tied to Git SHA so stack traces deobfuscate correctly
- never log JWTs, guest tokens, or user input verbatim

---

## 26. Secrets and environment variables

Frontend environment variables are not equivalent to backend secrets.

Why:
- variables exposed to the browser are visible to users
- accidental leakage is a common mistake in web apps

Rule:
- never place backend secrets in browser-exposed variables
- treat `NEXT_PUBLIC_*` values as public
- keep actual secrets on the backend or in secure server-side environments
- validate env vars at startup with a Zod schema; fail fast on missing required vars
- generate auth-related secrets (e.g. NextAuth secret, if used) with `openssl rand -base64 32`

---

## 27. Folder conventions

A predictable folder structure is better than a clever one.

Baseline structure for QGraph:

- `src/app` — routes, layouts, loading/error boundaries
- `src/components` — shared presentational components
- `src/components/ui` — shadcn/ui primitives (copied in)
- `src/features/<feature>` — feature-scoped code (components, hooks, services, schemas). Preferred over flat `src/components` once a feature has more than a couple of files
- `src/lib` — shared utilities, the Axios client, helpers
- `src/hooks` — genuinely shared React hooks (feature hooks live under the feature)
- `src/types` — shared TypeScript types
- `src/services` or `src/api` — typed backend-facing clients (one module per Django app: `search`, `quran`, `segmentation`, `accounts`)
- `src/styles` — global CSS, Tailwind layers
- `tests/e2e` — Playwright tests

Rule:
- avoid overengineering the folder structure too early
- keep naming clear and boring
- prefer consistency over novelty
- favor feature folders over type-based folders once a feature grows

---

## 28. Accessibility

Accessibility should not be postponed until the end.

Why:
- accessible UI usually leads to cleaner UI structure overall
- good keyboard and semantic behavior improves product quality
- Radix primitives already give correct a11y — don't undo their work with custom wrappers

Rule:
- use semantic HTML where possible
- all form controls need labels; show errors with `aria-describedby`
- every interactive element must be keyboard accessible
- respect `prefers-reduced-motion` for animations
- color contrast must pass WCAG AA in both themes
- do not break accessibility when customizing UI primitives

---

## 29. Optimize for maintainability, not short-term speed only

QGraph is expected to evolve. The frontend should therefore favor maintainable patterns over shortcuts.

Rule:
- avoid premature abstraction, but also avoid copy-paste architecture
- document important patterns (short docstrings or `docs/` entries for non-obvious decisions)
- keep contracts with the Django backend explicit and typed
- prefer clarity over cleverness

---

## Recommended Baseline Stack for QGraph Frontend

| Area | Choice |
| --- | --- |
| Framework | Next.js (App Router, 16+) |
| Language | TypeScript |
| Styling | Tailwind CSS + `@tailwindcss/typography` |
| UI primitives | `shadcn/ui` on top of Radix UI |
| Icons | `lucide-react` (default), `@radix-ui/react-icons` where appropriate |
| Forms | React Hook Form + Zod |
| HTTP client | Axios (single configured instance) |
| Server state | TanStack Query |
| Tables | TanStack Table |
| Charts | Recharts |
| Theming | `next-themes` + CSS variables |
| Toasts | `react-hot-toast` |
| Skeletons | `react-loading-skeleton` / shadcn `Skeleton` |
| Safe HTML | DOMPurify |
| Testing (unit) | Vitest + React Testing Library (+ MSW for HTTP) |
| Testing (E2E) | Playwright |
| Error monitoring | Sentry (`@sentry/nextjs`) |
| Linting | ESLint + Prettier + `husky` + `lint-staged` |

This stack is not the only valid choice, but it is a reasonable, industry-aligned baseline for a modern Next.js frontend talking to a Django backend.

---

## Cross-repo / tooling notes (for reference)

These are not strictly frontend-code concerns, but they affect development setup and the broader system:

- **GitHub auth:** use SSH for `gh` / `git` remote access; avoid HTTPS + PAT friction
- **Webhooks in local dev:** use `ngrok` to expose localhost when the Django backend needs to call back (e.g. during integration testing of async flows)
- **Asynchronous jobs (backend):** the Django backend uses Celery + Redis for async search execution; the frontend's only contract is the polling flow described in `about_django_backend.md`
- **Transactional email (backend):** SendGrid (or equivalent) is a reasonable choice for the Django side; the frontend only cares about the user-facing outcomes
- **Soft delete (backend):** soft-deletion of users on the Django side is being considered; frontend should not assume hard deletes are the only mode

---

## Guidance for AI Agents

When generating frontend code for QGraph:

- read the relevant guide in `node_modules/next/dist/docs/` when touching Next.js-specific features — this is Next.js 16+, not older versions you may have been trained on
- prefer TypeScript
- follow App Router conventions; default to Server Components unless interactivity is required
- use Tailwind CSS with logical properties (start/end), not physical ones (left/right)
- use shadcn/ui + Radix primitives for UI; do not mix unrelated UI libraries
- use React Hook Form + Zod for meaningful forms
- centralize API calls through the Axios client in `src/lib/api`
- manage server state with TanStack Query; avoid hand-rolled `useEffect` data fetching
- never break client-side navigation (`next/link`)
- include loading (skeleton), empty, and error states for every async UI
- support both light and dark themes; never hardcode theme-dependent colors
- respect RTL: QGraph handles Arabic and Persian content, so logical CSS properties and correct `dir`/`lang` attributes are mandatory
- do not introduce magic strings; mirror backend enums as typed constants
- sanitize HTML with DOMPurify before `dangerouslySetInnerHTML`
- write unit tests by default; add E2E only for scenarios that truly need a real browser
- do not invent backend contracts — consult `about_django_backend.md` or the live OpenAPI schema at `/api/schema/`
- prefer maintainable, conventional code over clever shortcuts
