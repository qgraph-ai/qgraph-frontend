# QGraph Frontend — Docs

Human-facing operational and architectural documentation for the Next.js frontend.

For AI-agent rules and conventions, see `CLAUDE.md` (root) and `.ai/bootstrap/frontend_best_practices.md`.

## Contents

- **[development.md](./development.md)** — prerequisites, running locally, the command cheat-sheet.
- **[testing.md](./testing.md)** — unit tests (Vitest + RTL + MSW) and E2E tests (Playwright). How to run them, how to write new ones, where things live.
- **[architecture.md](./architecture.md)** — a tour of `src/`: routes, features, services, lib, i18n, tests.

## When to add a new doc here

- A non-obvious operational workflow (deploys, secrets, release process).
- An architectural decision record (ADR) when a load-bearing choice isn't obvious from the code.
- A runbook for a recurring task (e.g. "adding a new Django app integration").

## When NOT to add a doc here

- Conventions — those live in `CLAUDE.md` and `.ai/bootstrap/frontend_best_practices.md`.
- Per-endpoint API docs — the backend OpenAPI spec (`.ai/bootstrap/django_docs/QGraph API.yaml`) is authoritative.
- Anything derivable by reading the code or `git log`.
