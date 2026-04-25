import * as Sentry from "@sentry/nextjs"

const enabled =
  process.env.NEXT_PUBLIC_ENABLE_SENTRY === "true" &&
  Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled,
  tracesSampleRate: 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
})

