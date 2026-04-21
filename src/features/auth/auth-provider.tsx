"use client"

import { createContext, useContext, useEffect, useRef } from "react"

import type { NormalizedApiError } from "@/lib/api"
import type { CurrentUser } from "@/services/auth"

import { useCurrentUser } from "./use-current-user"

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  user: CurrentUser | null
  status: AuthStatus
  error: NormalizedApiError | null
  refetch: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const query = useCurrentUser()

  const status: AuthStatus = query.isPending
    ? "loading"
    : query.data
      ? "authenticated"
      : "unauthenticated"

  const prevStatus = useRef<AuthStatus | null>(null)
  useEffect(() => {
    if (prevStatus.current !== status) {
      console.info(
        `[auth-debug] AuthProvider: status ${prevStatus.current ?? "initial"} → ${status} | user.id=${query.data?.id ?? "none"} error.status=${(query.error as NormalizedApiError | null)?.status ?? "none"}`
      )
      prevStatus.current = status
    }
  }, [status, query.data, query.error])

  const value: AuthContextValue = {
    user: query.data ?? null,
    status,
    error: (query.error as NormalizedApiError | null) ?? null,
    refetch: () => {
      console.info("[auth-debug] AuthProvider.refetch: triggering auth.me refetch")
      query.refetch()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used within <AuthProvider>")
  return ctx
}
