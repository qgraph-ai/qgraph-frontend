import { getTranslations } from "next-intl/server"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { APPS } from "@/features/landing/apps"

export async function AppGrid() {
  const t = await getTranslations("apps")

  return (
    <section className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {APPS.map(({ key, href, Icon, titleKey, bodyKey }) => (
            <li key={key} className="contents">
              <Link
                href={href}
                className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full transition-[box-shadow,transform] group-hover:ring-primary/30 group-active:translate-y-px">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <Icon className="size-5 text-primary/80" aria-hidden />
                    <CardTitle>{t(titleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">{t(bodyKey)}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
