import { http, HttpResponse } from "msw"

import { API_URL } from "@/lib/env"
import { AUTH_PATHS } from "@/services/auth/paths"

const url = (path: string) => `${API_URL}${path}`

export const handlers = [
  http.get(url(AUTH_PATHS.csrf), () =>
    HttpResponse.json(
      { csrfToken: "test-csrf-token" },
      {
        headers: {
          "set-cookie": "csrftoken=test-csrf-token; Path=/; SameSite=Lax",
        },
      }
    )
  ),

  http.post(url(AUTH_PATHS.jwtCreate), async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email === "inactive@example.com") {
      return HttpResponse.json(
        { detail: "No active account found with the given credentials" },
        { status: 401 }
      )
    }
    if (body.password === "wrong") {
      return HttpResponse.json(
        { detail: "No active account found with the given credentials" },
        { status: 401 }
      )
    }
    return HttpResponse.json({}, { status: 200 })
  }),

  http.post(url(AUTH_PATHS.jwtRefresh), () => HttpResponse.json({}, { status: 200 })),
  http.post(url(AUTH_PATHS.jwtLogout), () => HttpResponse.json({}, { status: 200 })),

  http.get(url(AUTH_PATHS.me), () =>
    HttpResponse.json(
      {
        id: 1,
        email: "user@example.com",
        first_name: "",
        last_name: "",
      },
      { status: 200 }
    )
  ),

  http.post(url(AUTH_PATHS.register), async ({ request }) => {
    const body = (await request.json()) as {
      email: string
      password: string
      re_password: string
    }
    if (body.email === "taken@example.com") {
      return HttpResponse.json(
        { email: ["user with this email already exists."] },
        { status: 400 }
      )
    }
    return HttpResponse.json(
      { id: 1, email: body.email, first_name: "", last_name: "" },
      { status: 201 }
    )
  }),

  http.post(url(AUTH_PATHS.activate), async ({ request }) => {
    const body = (await request.json()) as { uid: string; token: string }
    if (body.token === "bad") {
      return HttpResponse.json(
        { token: ["Invalid token for given user."] },
        { status: 400 }
      )
    }
    return HttpResponse.json({}, { status: 204 })
  }),

  http.post(url(AUTH_PATHS.resendActivation), () =>
    HttpResponse.json({}, { status: 204 })
  ),

  http.post(url(AUTH_PATHS.resetPassword), () =>
    HttpResponse.json({}, { status: 204 })
  ),

  http.post(url(AUTH_PATHS.resetPasswordConfirm), async ({ request }) => {
    const body = (await request.json()) as {
      uid: string
      token: string
      new_password: string
    }
    if (body.token === "bad") {
      return HttpResponse.json(
        { token: ["Invalid token for given user."] },
        { status: 400 }
      )
    }
    return HttpResponse.json({}, { status: 204 })
  }),
]
