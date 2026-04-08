# Frontend Best Practices for QGraph

This document lists practical conventions and industry-standard choices for the QGraph frontend.  
The goal is not to enforce every possible rule, but to provide a stable baseline for human developers and AI coding agents.

These guidelines should be followed unless there is a clear reason to do otherwise.

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
- add pre-commit hooks for linting and formatting
- use one formatting approach consistently across the repo

Practical note:
- pre-commit hooks are a strong best practice for team consistency, especially when AI agents are generating code

---

## 5. Use Tailwind CSS for styling

Use Tailwind CSS as the main styling approach unless there is a strong reason not to.

Why:
- it fits well with modern Next.js projects
- it keeps styling close to components
- it is fast for iteration
- it works especially well for dashboards, admin interfaces, and product UIs

Rule:
- use utility classes for most styling
- extract reusable UI patterns into components instead of copying very large class strings everywhere
- avoid mixing too many competing styling systems

---

## 6. Use a reusable UI layer

Build a small reusable UI layer instead of styling every page from scratch.

A good approach is:
- use `shadcn/ui` as the base UI system
- customize components to match project needs
- keep design tokens and repeated patterns consistent

Why:
- it provides accessible, well-structured building blocks
- it speeds up development
- it helps keep forms, dialogs, buttons, tables, and menus consistent

Rule:
- treat `shadcn/ui` as a starting point, not as an unchangeable library
- avoid random UI patterns from multiple unrelated libraries
- keep QGraph-specific wrappers where needed

---

## 7. Use React Hook Form for non-trivial forms

For forms such as login, registration, filters, settings, or multi-field workflows, use React Hook Form.

Why:
- it is a very common and practical choice in React applications
- it supports form state, validation flow, and better error presentation
- it keeps form code cleaner than ad hoc state handling for anything beyond very small forms

Rule:
- use React Hook Form for any form that has validation, submission state, or multiple fields
- keep validation logic explicit
- show field-level errors clearly in the UI

Practical note:
- for very small one-field forms, a lighter approach may still be acceptable

---

## 8. Keep validation close to data boundaries

Validate data at important boundaries, especially:
- form inputs
- API request payloads
- API response parsing when needed
- environment variables

Why:
- frontend bugs often come from bad assumptions about data shape
- explicit validation reduces silent failures
- it helps both human developers and AI agents work with clearer contracts

Rule:
- do not trust external data blindly
- define shared types and validation rules for important payloads
- prefer predictable error handling over implicit assumptions

---

## 9. Centralize API communication

Do not scatter raw fetch calls across the whole codebase.

Why:
- QGraph frontend talks to a Django backend
- request behavior, auth headers, and error handling should be consistent
- centralization makes future refactors easier

Rule:
- keep API logic in dedicated files such as `src/lib`, `src/services`, or `src/api`
- define typed request/response contracts where possible
- normalize error handling in one place

Suggested pattern:
- route/UI code should call application services or a shared client, not manually build requests everywhere

---

## 10. Separate domain code from UI code

Avoid putting business logic directly inside page components.

Why:
- large components become difficult to maintain
- business logic often needs reuse
- mixed UI/data logic is harder for AI agents to modify correctly

Rule:
- keep presentational components focused on rendering
- move reusable logic to hooks, helpers, or service modules
- keep domain-specific types and transformations outside the component body when possible

---

## 11. Use Playwright for end-to-end testing

Use Playwright for end-to-end testing of important user flows.

Why:
- it is a strong industry-standard option for modern web apps
- it supports Chromium, Firefox, and WebKit
- it is well suited for testing real browser behavior and authentication flows

Good candidates for Playwright tests:
- login/logout
- protected routes
- navigation across main pages
- key search flows
- critical form submissions

Rule:
- do not try to test everything end-to-end
- cover critical user journeys first
- keep E2E tests focused on behavior, not implementation details

---

## 12. Keep component tests and E2E tests complementary

Do not rely on only one style of testing.

Why:
- E2E tests are valuable but slower and broader
- smaller tests are useful for logic-heavy components and utilities
- different layers catch different classes of bugs

Rule:
- use E2E tests for critical workflows
- use smaller tests where isolated logic benefits from fast feedback
- avoid excessive duplication between test layers

---

## 13. Handle loading, empty, and error states explicitly

Every important async UI should define what happens in these cases:
- loading
- success
- empty result
- error

Why:
- these states are often ignored early and become messy later
- production interfaces feel incomplete without them
- they are especially important when the frontend depends on backend and AI-driven workflows

Rule:
- never assume data always exists
- avoid vague fallback behavior
- make failure states understandable to users

---

## 14. Use proper observability and error monitoring

Console logging alone is not enough for a serious frontend.

A strong production option is an error monitoring platform such as Sentry.

Why:
- production frontend failures are often hard to reproduce locally
- stack traces, user context, and release tracking are valuable
- monitoring tools help detect issues that users may not report clearly

Rule:
- use structured logging during development
- use proper monitoring in production
- avoid leaking sensitive information into logs or telemetry

Practical note:
- Sentry is a strong and common choice for frontend error monitoring, but it should be configured carefully with privacy and data minimization in mind

---

## 15. Be careful with secrets and environment variables

Frontend environment variables are not equivalent to backend secrets.

Why:
- variables exposed to the browser are visible to users
- accidental leakage is a common mistake in web apps

Rule:
- never place backend secrets in browser-exposed variables
- treat `NEXT_PUBLIC_*` values as public
- keep actual secrets on the backend or in secure server-side environments

---

## 16. Prefer simple folder conventions

A predictable folder structure is better than a clever one.

A reasonable structure for QGraph is:

- `src/app` for routes and layouts
- `src/components` for reusable UI components
- `src/lib` for shared utilities and API helpers
- `src/hooks` for reusable React hooks
- `src/types` for shared TypeScript types
- `src/services` or `src/api` for backend-facing logic

Rule:
- avoid overengineering the folder structure too early
- keep naming clear and boring
- prefer consistency over novelty

---

## 17. Keep accessibility in mind from the beginning

Accessibility should not be postponed until the end.

Why:
- accessible UI usually leads to cleaner UI structure overall
- good keyboard and semantic behavior improves product quality
- many reusable UI tools already support this well if used correctly

Rule:
- use semantic HTML where possible
- ensure forms have labels and clear errors
- ensure interactive elements are keyboard accessible
- do not break accessibility when customizing UI primitives

---

## 18. Optimize for maintainability, not short-term speed only

QGraph is expected to evolve. The frontend should therefore favor maintainable patterns over shortcuts.

Rule:
- avoid premature abstraction, but also avoid copy-paste architecture
- document important patterns
- keep contracts with the Django backend explicit
- prefer clarity over cleverness

---

## Recommended Baseline Stack for QGraph Frontend

A practical baseline stack is:

- Next.js with App Router
- TypeScript
- ESLint
- Tailwind CSS
- `shadcn/ui`
- React Hook Form for non-trivial forms
- Playwright for end-to-end testing
- pre-commit hooks for linting/formatting
- production error monitoring such as Sentry

This stack is not the only valid choice, but it is a very reasonable and industry-aligned baseline for a modern frontend that talks to a Django backend.

---

## Guidance for AI Agents

When generating frontend code for QGraph:

- prefer TypeScript
- follow App Router conventions
- default to server-first patterns unless interactivity is required
- use Tailwind CSS for styling
- use reusable UI primitives instead of ad hoc page-specific markup
- use React Hook Form for meaningful forms
- centralize API calls
- do not invent backend contracts
- include loading, empty, and error states where relevant
- prefer maintainable, conventional code over clever shortcuts
