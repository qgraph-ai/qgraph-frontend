"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { CSRF_COOKIE_NAME, getCsrfFromCookie } from "@/lib/api"
import { API_URL } from "@/lib/env"
import { AUTH_PATHS, buildGoogleLoginFormTarget } from "@/services/auth"

import { GoogleIcon } from "./google-icon"

function warnIfHostMismatch() {
  if (typeof window === "undefined") return
  try {
    const apiHost = new URL(API_URL).hostname
    const pageHost = window.location.hostname
    const sameFamily =
      apiHost === pageHost ||
      (apiHost === "127.0.0.1" && pageHost === "127.0.0.1") ||
      (apiHost === "localhost" && pageHost === "localhost")
    console.info(
      `[auth-debug] GoogleLoginButton.hostCheck: page.hostname='${pageHost}' api.hostname='${apiHost}' sameFamily=${sameFamily}`
    )
    if (!sameFamily) {
      console.warn(
        `[auth-debug] GoogleLoginButton.hostCheck: HOST MISMATCH. Dev SameSite=Lax cookies may not flow. ` +
          `Access the frontend at http://${apiHost}:<port>/ to match the API.`
      )
    }
  } catch (err) {
    console.warn(
      "[auth-debug] GoogleLoginButton.hostCheck: unable to parse API_URL",
      err
    )
  }
}

export function GoogleLoginButton({ label }: { label: string }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    console.info(
      "[auth-debug] GoogleLoginButton.mount: warming CSRF and building form target"
    )
    warnIfHostMismatch()
    let active = true
    buildGoogleLoginFormTarget().then(({ csrfToken }) => {
      if (active) {
        console.info(
          `[auth-debug] GoogleLoginButton.mount: form target ready, csrfToken=${csrfToken ? "present" : "MISSING"} (button ${csrfToken ? "enabled" : "disabled"})`
        )
        setCsrfToken(csrfToken)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const action = `${API_URL}${AUTH_PATHS.googleLogin}`

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const cookieToken = getCsrfFromCookie()
    console.info(
      `[auth-debug] GoogleLoginButton.submit: → POST ${action} | ${CSRF_COOKIE_NAME} cookie=${cookieToken ? "present" : "MISSING"} | form csrfmiddlewaretoken=${csrfToken ? "present" : "MISSING"}. Django validates BOTH the cookie and the form token.`
    )
    if (!cookieToken) {
      event.preventDefault()
      console.warn(
        `[auth-debug] GoogleLoginButton.submit: ABORTED — '${CSRF_COOKIE_NAME}' cookie missing. ` +
          `Django will reject the POST. Likely causes: (1) host mismatch (localhost vs 127.0.0.1), ` +
          `(2) CORS/CSRF trusted origins misconfigured on backend, (3) cookie SameSite preventing flow.`
      )
      return
    }
    console.info(
      "[auth-debug] GoogleLoginButton.submit: proceeding with native form POST (browser will follow 302 chain to Google)"
    )
  }

  return (
    <form
      ref={formRef}
      method="POST"
      action={action}
      onSubmit={onSubmit}
      className="contents"
    >
      {csrfToken ? (
        <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
      ) : null}
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        disabled={!csrfToken}
      >
        <GoogleIcon />
        {label}
      </Button>
    </form>
  )
}
