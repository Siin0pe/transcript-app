"use server"

import { cookies } from "next/headers"

import type { Lang, View } from "@/lib/i18n"

export async function getPrefs(): Promise<{ lang: Lang; view: View | undefined }> {
  const store = await cookies()
  const lang: Lang = store.get("lang")?.value === "en" ? "en" : "fr"
  const saved = store.get("view")?.value
  const view = saved === "mobile" || saved === "desktop" ? saved : undefined
  return { lang, view }
}

const ONE_YEAR = 60 * 60 * 24 * 365

export async function setLang(lang: Lang) {
  const cookieStore = await cookies()
  cookieStore.set("lang", lang, { maxAge: ONE_YEAR })
}

export async function setView(view: View | null) {
  const cookieStore = await cookies()
  if (view) cookieStore.set("view", view, { maxAge: ONE_YEAR })
  else cookieStore.delete("view")
}
