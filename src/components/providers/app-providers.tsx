"use client"

import { Toaster } from "react-hot-toast"

import { DirectionProvider } from "@/components/ui/direction"
import { AuthProvider } from "@/features/auth/auth-provider"

import { QueryProvider } from "./query-provider"
import { ThemeProvider } from "./theme-provider"

type Direction = "ltr" | "rtl"

export function AppProviders({
  children,
  direction = "ltr",
}: {
  children: React.ReactNode
  direction?: Direction
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          <DirectionProvider dir={direction}>
            {children}
            <Toaster position="top-center" />
          </DirectionProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
