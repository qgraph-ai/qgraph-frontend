"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { CSRF_COOKIE_NAME, getCsrfFromCookie } from "@/lib/api"
import { API_URL } from "@/lib/env"
import { logger } from "@/lib/observability/logger"
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
    if (!sameFamily) {
      logger.warn("OAuth host mismatch may block CSRF cookie flow", {
        pageHost,
        apiHost,
      })
    }
  } catch (err) {
    logger.warn("Failed to parse API URL while preparing OAuth button", err)
  }
}

export function GoogleLoginButton({ label }: { label: string }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    warnIfHostMismatch()
    let active = true
    buildGoogleLoginFormTarget().then(({ csrfToken }) => {
      if (active) {
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
    if (!cookieToken) {
      event.preventDefault()
      logger.warn("OAuth form submit blocked: CSRF cookie missing", {
        cookieName: CSRF_COOKIE_NAME,
      })
      return
    }
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
