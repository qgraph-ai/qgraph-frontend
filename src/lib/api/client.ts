import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios"

import { API_URL } from "@/lib/env"

import { CSRF_HEADER_NAME, ensureCsrf } from "./csrf"
import { REFRESH_ENDPOINT, refreshAccessToken } from "./refresh"

export const SEARCH_GUEST_TOKEN_HEADER = "X-Search-Guest-Token"

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])
const AUTH_ENDPOINT_PREFIXES = [
  "/api/auth/jwt/create/",
  "/api/auth/jwt/refresh/",
  "/api/auth/jwt/logout/",
  "/api/auth/csrf/",
  "/api/auth/users/",
  "/api/auth/google/",
] as const

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  _debugStartedAt?: number
  _debugId?: string
}

let debugRequestCounter = 0

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
  const url = config.url ?? ""
  const id = `req-${++debugRequestCounter}`
  ;(config as RetriableConfig)._debugId = id
  ;(config as RetriableConfig)._debugStartedAt = performance.now()

  let csrfAttached: "yes" | "no" | "n/a" = "n/a"
  if (UNSAFE_METHODS.has(method)) {
    console.info(
      `[auth-debug] axios[${id}]: resolving CSRF before ${method} ${url}`
    )
    const token = await ensureCsrf()
    if (token) {
      const headers = AxiosHeaders.from(config.headers)
      headers.set(CSRF_HEADER_NAME, token)
      config.headers = headers
      csrfAttached = "yes"
    } else {
      csrfAttached = "no"
    }
  }

  const hasBody = config.data !== undefined && config.data !== null
  console.info(
    `[auth-debug] axios[${id}]: → ${method} ${API_URL}${url} | withCredentials=true | ${CSRF_HEADER_NAME}=${csrfAttached} | body=${hasBody ? "yes" : "no"}`
  )
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

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return AUTH_ENDPOINT_PREFIXES.some((prefix) => url.includes(prefix))
}

apiClient.interceptors.response.use(
  (response) => {
    const cfg = response.config as RetriableConfig
    const id = cfg._debugId ?? "?"
    const ms = cfg._debugStartedAt
      ? Math.round(performance.now() - cfg._debugStartedAt)
      : -1
    console.info(
      `[auth-debug] axios[${id}]: ← ${(cfg.method ?? "get").toUpperCase()} ${cfg.url} status=${response.status} in ${ms}ms`
    )
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    const status = error.response?.status
    const id = config?._debugId ?? "?"
    const ms = config?._debugStartedAt
      ? Math.round(performance.now() - config._debugStartedAt)
      : -1
    console.warn(
      `[auth-debug] axios[${id}]: ← ${(config?.method ?? "get").toUpperCase()} ${config?.url} FAILED status=${status ?? "none"} in ${ms}ms | data=${JSON.stringify(error.response?.data)?.slice(0, 500) ?? "none"}`
    )

    if (
      status === 401 &&
      config &&
      !config._retry &&
      !isAuthEndpoint(config.url) &&
      config.url !== REFRESH_ENDPOINT
    ) {
      console.info(
        `[auth-debug] axios[${id}]: 401 on non-auth endpoint ${config.url} → attempting one refresh-and-retry`
      )
      config._retry = true
      const ok = await refreshAccessToken()
      if (ok) {
        console.info(
          `[auth-debug] axios[${id}]: refresh ok, retrying original ${(config.method ?? "get").toUpperCase()} ${config.url}`
        )
        return apiClient.request(config)
      }
      console.warn(
        `[auth-debug] axios[${id}]: refresh failed, giving up and returning normalized error`
      )
    }

    return Promise.reject(normalize(error))
  }
)

export function withGuestToken(token: string) {
  return { headers: { [SEARCH_GUEST_TOKEN_HEADER]: token } }
}
