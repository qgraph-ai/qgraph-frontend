"use client"

import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"

export function FormError({ message }: { message: string | null | undefined }) {
  if (!message) return null
  return (
    <Alert variant="destructive" role="alert" aria-live="polite">
      <CircleAlert />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
