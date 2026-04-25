import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"

import { API_URL } from "@/lib/env"
import { logger } from "@/lib/observability/logger"

import { CSRF_HEADER_NAME, ensureCsrf } from "./csrf"
import { REFRESH_ENDPOINT, refreshAccessToken } from "./refresh"

export const SEARCH_GUEST_TOKEN_HEADER = "X-Search-Guest-Token"

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])
const NO_RETRY_401_ENDPOINTS = [
  "/api/auth/jwt/create/",
  "/api/auth/jwt/refresh/",
  "/api/auth/jwt/logout/",
  "/api/auth/csrf/",
  "/api/auth/google/",
] as const

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  _startedAt?: number
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

apiClient.interceptors.request.use(async (config) => {
  const method = (config.method ?? "get").toUpperCase()
  ;(config as RetriableConfig)._startedAt = performance.now()

  if (UNSAFE_METHODS.has(method)) {
    const token = await ensureCsrf()
    if (token) {
      const headers = AxiosHeaders.from(config.headers)
      headers.set(CSRF_HEADER_NAME, token)
      config.headers = headers
    }
  }
  return config
})

export type NormalizedApiError = {
  message: string
  status: number | null
  code: string | null
  details: unknown
}

function normalize(error: AxiosError): NormalizedApiError {
  const data = error.response?.data as
    | {
        code?: string
        detail?: string
        message?: string
      }
    | undefined
  return {
    message: data?.detail ?? data?.message ?? error.message ?? "Request failed",
    status: error.response?.status ?? null,
    code: data?.code ?? error.code ?? null,
    details: error.response?.data ?? null,
  }
}

function isNoRetryEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return NO_RETRY_401_ENDPOINTS.some((prefix) => url.includes(prefix))
}

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const method = (config?.method ?? "get").toUpperCase()
    const ms = config?._startedAt
      ? Math.round(performance.now() - config._startedAt)
      : undefined
    const noRetryEndpoint = isNoRetryEndpoint(config?.url)
    const idempotentMethod =
      method === "GET" || method === "HEAD" || method === "OPTIONS"

    if (status && status >= 500) {
      logger.error("API request failed with server error", {
        method,
        url: config?.url,
        status,
        duration_ms: ms,
      })
    } else if (status && status >= 400 && status !== 401) {
      logger.warn("API request failed", {
        method,
        url: config?.url,
        status,
        duration_ms: ms,
      })
    }

    if (
      status === 401 &&
      config &&
      !config._retry &&
      !noRetryEndpoint &&
      config.url !== REFRESH_ENDPOINT &&
      idempotentMethod
    ) {
      config._retry = true
      const ok = await refreshAccessToken()
      if (ok) {
        return apiClient.request(config)
      }
      logger.warn("JWT refresh failed after 401; request not retried", {
        method,
        url: config.url,
      })
    }

    return Promise.reject(normalize(error))
  }
)

export function withGuestToken(token: string) {
  return { headers: { [SEARCH_GUEST_TOKEN_HEADER]: token } }
}
