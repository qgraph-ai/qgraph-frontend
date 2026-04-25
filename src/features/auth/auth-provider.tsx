"use client"

import { createContext, useContext, useEffect, useRef } from "react"

import type { NormalizedApiError } from "@/lib/api"
import { logger } from "@/lib/observability/logger"
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
      logger.info("Auth status changed", {
        previous: prevStatus.current ?? "initial",
        current: status,
      })
      prevStatus.current = status
    }
  }, [status, query.data, query.error])

  const value: AuthContextValue = {
    user: query.data ?? null,
    status,
    error: (query.error as NormalizedApiError | null) ?? null,
    refetch: () => query.refetch(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used within <AuthProvider>")
  return ctx
}
