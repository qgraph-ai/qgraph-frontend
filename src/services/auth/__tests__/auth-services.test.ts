import { http, HttpResponse } from "msw"
import { describe, expect, it } from "vitest"

import { API_URL } from "@/lib/env"
import {
  activateUser,
  confirmEmailChange,
  confirmPasswordReset,
  deleteCurrentUser,
  getCurrentUser,
  login,
  logout,
  registerUser,
  requestPasswordReset,
  resendActivation,
  setEmail,
  setPassword,
  updateCurrentUser,
} from "@/services/auth"
import { AUTH_PATHS } from "@/services/auth/paths"

import { server } from "../../../../tests/msw/server"

describe("auth services", () => {
  it("login posts credentials and returns response payload", async () => {
    server.use(
      http.post(`${API_URL}${AUTH_PATHS.jwtCreate}`, async ({ request }) => {
        const body = (await request.json()) as { email: string }
        return HttpResponse.json({
          id: 1,
          email: body.email,
          first_name: "",
          last_name: "",
        })
      })
    )

    await expect(
      login({ email: "user@example.com", password: "secret123" })
    ).resolves.toMatchObject({ email: "user@example.com" })
  })

  it("logout posts to jwt logout endpoint", async () => {
    let called = false
    server.use(
      http.post(`${API_URL}${AUTH_PATHS.jwtLogout}`, () => {
        called = true
        return HttpResponse.json({}, { status: 200 })
      })
    )

    await logout()
    expect(called).toBe(true)
  })

  it("registers and fetches/updates/deletes current user", async () => {
    server.use(
      http.post(`${API_URL}${AUTH_PATHS.register}`, async ({ request }) => {
        const body = (await request.json()) as { email: string }
        return HttpResponse.json({
          id: 2,
          email: body.email,
          first_name: "First",
          last_name: "Last",
        })
      }),
      http.get(`${API_URL}${AUTH_PATHS.me}`, () =>
        HttpResponse.json({
          id: 2,
          email: "user@example.com",
          first_name: "First",
          last_name: "Last",
        })
      ),
      http.patch(`${API_URL}${AUTH_PATHS.me}`, async ({ request }) => {
        const body = (await request.json()) as { first_name?: string }
        return HttpResponse.json({
          id: 2,
          email: "user@example.com",
          first_name: body.first_name ?? "First",
          last_name: "Last",
        })
      }),
      http.delete(`${API_URL}${AUTH_PATHS.me}`, () =>
        HttpResponse.json({}, { status: 204 })
      )
    )

    await expect(
      registerUser({
        email: "user@example.com",
        password: "secret123",
        re_password: "secret123",
      })
    ).resolves.toMatchObject({ email: "user@example.com" })

    await expect(getCurrentUser()).resolves.toMatchObject({
      email: "user@example.com",
    })
    await expect(updateCurrentUser({ first_name: "Updated" })).resolves.toMatchObject({
      first_name: "Updated",
    })
    await expect(deleteCurrentUser()).resolves.toBeUndefined()
  })

  it("runs activation and password/email mutation endpoints", async () => {
    const seen: string[] = []
    server.use(
      http.post(`${API_URL}${AUTH_PATHS.activate}`, () => {
        seen.push("activate")
        return HttpResponse.json({}, { status: 204 })
      }),
      http.post(`${API_URL}${AUTH_PATHS.resendActivation}`, () => {
        seen.push("resend")
        return HttpResponse.json({}, { status: 204 })
      }),
      http.post(`${API_URL}${AUTH_PATHS.resetPassword}`, () => {
        seen.push("reset")
        return HttpResponse.json({}, { status: 204 })
      }),
      http.post(`${API_URL}${AUTH_PATHS.resetPasswordConfirm}`, () => {
        seen.push("resetConfirm")
        return HttpResponse.json({}, { status: 204 })
      }),
      http.post(`${API_URL}${AUTH_PATHS.setPassword}`, () => {
        seen.push("setPassword")
        return HttpResponse.json({}, { status: 204 })
      }),
      http.post(`${API_URL}${AUTH_PATHS.setEmail}`, () => {
        seen.push("setEmail")
        return HttpResponse.json({}, { status: 204 })
      }),
      http.post(`${API_URL}${AUTH_PATHS.resetEmailConfirm}`, () => {
        seen.push("confirmEmail")
        return HttpResponse.json({}, { status: 204 })
      })
    )

    await activateUser({ uid: "uid", token: "token" })
    await resendActivation({ email: "user@example.com" })
    await requestPasswordReset({ email: "user@example.com" })
    await confirmPasswordReset({
      uid: "uid",
      token: "token",
      new_password: "secret123",
    })
    await setPassword({
      current_password: "old-secret",
      new_password: "new-secret",
    })
    await setEmail({
      current_password: "secret123",
      new_email: "new@example.com",
    })
    await confirmEmailChange({
      uid: "uid",
      token: "token",
      new_email: "new@example.com",
    })

    expect(seen).toEqual([
      "activate",
      "resend",
      "reset",
      "resetConfirm",
      "setPassword",
      "setEmail",
      "confirmEmail",
    ])
  })
})
