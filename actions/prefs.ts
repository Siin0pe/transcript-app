"use server"

import { cookies, headers } from "next/headers"

import type { Lang, View } from "@/lib/i18n"

export async function getPrefs(): Promise<{ lang: Lang; view: View }> {
  const store = await cookies()
  const lang: Lang = store.get("lang")?.value === "en" ? "en" : "fr"
  const saved = store.get("view")?.value
  if (saved === "mobile" || saved === "desktop") return { lang, view: saved }
  const userAgent = (await headers()).get("user-agent") ?? ""
  const view: View = /Mobi|Android|iPhone|iPad/i.test(userAgent) ? "mobile" : "desktop"
  return { lang, view }
}

const ONE_YEAR = 60 * 60 * 24 * 365

export async function setLang(lang: Lang) {
  const cookieStore = await cookies()
  cookieStore.set("lang", lang, { maxAge: ONE_YEAR })
}

export async function setView(view: View) {
  const cookieStore = await cookies()
  cookieStore.set("view", view, { maxAge: ONE_YEAR })
}
