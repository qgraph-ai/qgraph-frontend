"use client"

import { useQuery } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import { getCurrentUser, type CurrentUser } from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useCurrentUser() {
  return useQuery<CurrentUser, NormalizedApiError>({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: () => {
      console.info(
        "[auth-debug] useCurrentUser.queryFn: fetching session via getCurrentUser()"
      )
      return getCurrentUser()
    },
    retry: false,
    staleTime: 60_000,
  })
}
