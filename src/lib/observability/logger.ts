import * as Sentry from "@sentry/nextjs"

import { env, type PublicLogLevel } from "@/lib/env"

type LogLevel = Exclude<PublicLogLevel, "silent">
type LogMeta = unknown

const LEVEL_WEIGHT: Record<PublicLogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
}

const SENSITIVE_KEY = /password|token|cookie|authorization|email|csrf|secret/i
const MAX_DEPTH = 4

function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[env.NEXT_PUBLIC_LOG_LEVEL]
}

function redact(value: unknown, depth = 0): unknown {
  if (depth >= MAX_DEPTH) return "[Truncated]"

  if (value == null) return value
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return value

  if (value instanceof Error) {
    return { name: value.name, message: value.message }
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1))
  }

  if (typeof value === "object") {
    const output: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(key)) {
        output[key] = "[REDACTED]"
      } else {
        output[key] = redact(nested, depth + 1)
      }
    }
    return output
  }

  return String(value)
}

function emit(level: LogLevel, message: string, meta?: LogMeta) {
  if (!shouldLog(level)) return
  const prefix = `[qgraph:${level}] ${message}`
  const payload = meta === undefined ? undefined : redact(meta)

  if (payload === undefined) {
    if (level === "debug") console.debug(prefix)
    else if (level === "info") console.info(prefix)
    else if (level === "warn") console.warn(prefix)
    else console.error(prefix)
    return
  }

  if (level === "debug") console.debug(prefix, payload)
  else if (level === "info") console.info(prefix, payload)
  else if (level === "warn") console.warn(prefix, payload)
  else console.error(prefix, payload)
}

function captureError(message: string, meta?: LogMeta) {
  const sentryEnabled =
    env.NEXT_PUBLIC_ENABLE_SENTRY &&
    Boolean(env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN)
  if (!sentryEnabled) return

  const payload = redact(meta)
  if (meta instanceof Error) {
    Sentry.captureException(meta)
    return
  }

  const extra =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : { meta: payload }

  Sentry.captureException(new Error(message), {
    extra,
  })
}

export const logger = {
  debug(message: string, meta?: LogMeta) {
    emit("debug", message, meta)
  },
  info(message: string, meta?: LogMeta) {
    emit("info", message, meta)
  },
  warn(message: string, meta?: LogMeta) {
    emit("warn", message, meta)
  },
  error(message: string, meta?: LogMeta) {
    emit("error", message, meta)
    captureError(message, meta)
  },
}
