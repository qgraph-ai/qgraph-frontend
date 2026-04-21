"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { NormalizedApiError } from "@/lib/api"
import {
  updateCurrentUser,
  type CurrentUser,
  type UpdateProfilePayload,
} from "@/services/auth"

import { AUTH_QUERY_KEYS } from "./query-keys"

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation<CurrentUser, NormalizedApiError, UpdateProfilePayload>({
    mutationFn: (vars) => {
      console.info(
        `[auth-debug] useUpdateProfile.mutationFn: keys=[${Object.keys(vars).join(",")}]`
      )
      return updateCurrentUser(vars)
    },
    onSuccess: (user) => {
      console.info(
        `[auth-debug] useUpdateProfile.onSuccess: user.id=${user?.id}`
      )
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user)
    },
    onError: (err) => {
      console.warn(
        `[auth-debug] useUpdateProfile.onError: status=${err.status} message='${err.message}'`
      )
    },
  })
}
