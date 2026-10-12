"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { db, initDb, notes } from "@/db"
import type { Lang, View } from "@/lib/i18n"

const ONE_YEAR = 60 * 60 * 24 * 365

export interface NoteInput {
  id: number | null
  title: string
  content: string
  tagId: number | null
  dictated: boolean
}

export async function saveNote(note: NoteInput) {
  const title = note.title.trim()
  const content = note.content.trim()
  if (title === "" || title.length > 255) {
    return false
  }

  await initDb()

  if (note.id) {
    await db
      .update(notes)
      .set({ title, content, tagId: note.tagId, dictated: note.dictated, updatedAt: new Date() })
      .where(eq(notes.id, note.id))
  } else {
    await db.insert(notes).values({ title, content, tagId: note.tagId, dictated: note.dictated })
  }

  revalidatePath("/")
  return true
}

export async function deleteNote(id: number) {
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
