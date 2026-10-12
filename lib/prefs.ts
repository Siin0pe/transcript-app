import { cache } from "react"
import { cookies, headers } from "next/headers"

import type { Lang, View } from "@/lib/i18n"

export const getPrefs = cache(async (): Promise<{ lang: Lang; view: View }> => {
  const store = await cookies()
  const lang: Lang = store.get("lang")?.value === "en" ? "en" : "fr"
  const saved = store.get("view")?.value
  if (saved === "mobile" || saved === "desktop") return { lang, view: saved }
  const userAgent = (await headers()).get("user-agent") ?? ""
  const view: View = /Mobi|Android|iPhone|iPad/i.test(userAgent) ? "mobile" : "desktop"
  return { lang, view }
})
