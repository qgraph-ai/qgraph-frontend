import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

import { AppProviders } from "@/components/providers/app-providers"
import { directionFor, type Locale } from "@/i18n/locales"
import { fontVariables } from "@/lib/fonts"
import { SITE_URL } from "@/lib/env"

import "./globals.css"

const metadataBase = new URL(SITE_URL)

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "QGraph",
    template: "%s · QGraph",
  },
  description: "QGraph helps you read, search, and explore the Qur'an with clarity.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "QGraph",
    title: "QGraph",
    description:
      "QGraph helps you read, search, and explore the Qur'an with clarity.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "QGraph",
    description:
      "QGraph helps you read, search, and explore the Qur'an with clarity.",
  },
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
