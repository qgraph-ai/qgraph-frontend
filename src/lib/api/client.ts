import axios, { AxiosError, type AxiosInstance } from "axios"

import { tokenStore } from "./token-store"

const baseURL = process.env.NEXT_PUBLIC_API_URL

export const SEARCH_GUEST_TOKEN_HEADER = "X-Search-Guest-Token"

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
    | { code?: string; detail?: string; message?: string }
    | undefined
  return {
    message: data?.detail ?? data?.message ?? error.message ?? "Request failed",
    status: error.response?.status ?? null,
    code: data?.code ?? error.code ?? null,
    details: error.response?.data ?? null,
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(normalize(error))
)

export function withGuestToken(token: string) {
  return { headers: { [SEARCH_GUEST_TOKEN_HEADER]: token } }
}
