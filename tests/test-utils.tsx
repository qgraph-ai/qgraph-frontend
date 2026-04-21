import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, type RenderOptions } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import type { ReactElement, ReactNode } from "react"

import enMessages from "@/i18n/messages/en.json"

export function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function TestProviders({
  children,
  queryClient,
}: {
  children: ReactNode
  queryClient?: QueryClient
}) {
  const client = queryClient ?? makeTestQueryClient()
  return (
    <NextIntlClientProvider locale="en" messages={enMessages} timeZone="UTC">
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </NextIntlClientProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  { queryClient, ...options }: RenderOptions & { queryClient?: QueryClient } = {}
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient}>{children}</TestProviders>
    ),
    ...options,
  })
}

export * from "@testing-library/react"
