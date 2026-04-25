# Observability

QGraph frontend now uses:

- a centralized logger (`src/lib/observability/logger.ts`)
- optional Sentry wiring (`@sentry/nextjs`) that is disabled by default in local development

## Logging

Use the shared `logger` instead of ad-hoc `console.*`:

```ts
import { logger } from "@/lib/observability/logger"

logger.info("Auth status changed", { from: "loading", to: "authenticated" })
logger.warn("Sign-in request failed", { status: 401, code: "invalid_credentials" })
logger.error("Delete account request failed", { status: 500 })
```

Notes:

- Sensitive fields are redacted (`password`, `token`, `email`, `cookie`, `authorization`, etc).
- Keep logs high-signal and boundary-focused (auth transitions, failed mutations, unexpected API errors).
- Avoid dumping raw request/response payloads.

## Sentry Placeholder Setup

Sentry is wired but intentionally no-op unless enabled by env.

Relevant env vars:

- `NEXT_PUBLIC_ENABLE_SENTRY` (`false` by default)
- `SENTRY_DSN` (server/edge)
- `NEXT_PUBLIC_SENTRY_DSN` (client)

In local development, keep:

```env
NEXT_PUBLIC_ENABLE_SENTRY=false
```

When you are ready to activate in production:

1. Create a Sentry project (frontend / Next.js).
2. Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in your deployment environment.
3. Set `NEXT_PUBLIC_ENABLE_SENTRY=true`.
4. Add release/version tagging in your deployment pipeline (recommended).

## Files

- `instrumentation.ts`
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.ts` (Sentry plugin wrapping)
