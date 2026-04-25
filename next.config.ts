import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
}

const configWithIntl = withNextIntl(nextConfig)

export default withSentryConfig(configWithIntl, {
  silent: true,
})
