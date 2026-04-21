import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

import { AppProviders } from "@/components/providers/app-providers"
import { directionFor, type Locale } from "@/i18n/locales"
import { fontVariables } from "@/lib/fonts"

import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "QGraph",
    template: "%s · QGraph",
  },
  description: "QGraph — Quran-aware search and exploration.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = (await getLocale()) as Locale
  const messages = await getMessages()
  const dir = directionFor(locale)

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders direction={dir}>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
