import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import type { NormalizedApiError } from "./client"

const NON_FIELD_KEYS = ["non_field_errors", "detail", "__all__"] as const

function coerceMessages(value: unknown): string[] {
  if (value == null) return []
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) {
    return value.flatMap((entry) => coerceMessages(entry))
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((entry) =>
      coerceMessages(entry)
    )
  }
  return [String(value)]
}

export type MappedFormErrors = {
  formMessage: string | null
  fieldMessages: Record<string, string>
}

/**
 * Projects a Djoser/DRF `{ field: [messages], non_field_errors: [...] }` body
 * onto a react-hook-form via `setError`, returning any form-level message for
 * rendering in a shared Alert.
 */
export function applyDjoserFieldErrors<TForm extends FieldValues>(
  error: NormalizedApiError,
  setError: UseFormSetError<TForm>,
  allowedFields: ReadonlyArray<Path<TForm>>
): MappedFormErrors {
  const result: MappedFormErrors = { formMessage: null, fieldMessages: {} }
  const details = error.details

  if (!details || typeof details !== "object") {
    result.formMessage = error.message || null
    return result
  }

  const asRecord = details as Record<string, unknown>
  const formMessages: string[] = []

  for (const key of Object.keys(asRecord)) {
    const messages = coerceMessages(asRecord[key])
    if (messages.length === 0) continue
    const message = messages.join(" ")

    if ((NON_FIELD_KEYS as readonly string[]).includes(key)) {
      formMessages.push(message)
      continue
    }

    if (allowedFields.includes(key as Path<TForm>)) {
      result.fieldMessages[key] = message
      setError(key as Path<TForm>, { type: "server", message })
    } else {
      formMessages.push(`${key}: ${message}`)
    }
  }

  if (formMessages.length === 0 && error.message) {
    formMessages.push(error.message)
  }

  result.formMessage = formMessages.join(" ") || null
  return result
}
