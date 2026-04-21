import { cookies } from "next/headers"
import { getRequestConfig } from "next-intl/server"

import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./locales"

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const requested = cookieStore.get(LOCALE_COOKIE)?.value
  const locale: Locale = isLocale(requested) ? requested : DEFAULT_LOCALE
  const messages = (await import(`./messages/${locale}.json`)).default
  return { locale, messages }
})
