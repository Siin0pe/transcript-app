"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { db, initDb, notes } from "@/db"
import type { Lang, View } from "@/lib/i18n"

const ONE_YEAR = 60 * 60 * 24 * 365

interface NoteInput {
  id: number | null
  title: string
  content: string
  tagId: number | null
  dictated: boolean
}

function isId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0
}

export async function saveNote(note: NoteInput) {
  if (typeof note.title !== "string" || typeof note.content !== "string") {
    return false
  }

  const title = note.title.trim()
  const content = note.content.trim()
  if (title === "" || title.length > 255 || content.length > 50000) {
    return false
  }

  await initDb()

  const tagId = isId(note.tagId) ? note.tagId : null
  const dictated = note.dictated === true

  if (isId(note.id)) {
    const result = await db
      .update(notes)
      .set({ title, content, tagId, dictated })
      .where(eq(notes.id, note.id))
    if (result.rowsAffected === 0) return false
  } else {
    await db.insert(notes).values({ title, content, tagId, dictated })
  }

  revalidatePath("/")
  return true
}

export async function deleteNote(id: number) {
  if (!isId(id)) return
  await initDb()
  await db.delete(notes).where(eq(notes.id, id))
  revalidatePath("/")
}

export async function setLang(lang: Lang) {
  const cookieStore = await cookies()
  cookieStore.set("lang", lang, { maxAge: ONE_YEAR })
}

export async function setView(view: View) {
  const cookieStore = await cookies()
  cookieStore.set("view", view, { maxAge: ONE_YEAR })
}
