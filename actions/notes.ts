"use server"

import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import type { NoteItem, TagItem } from "@/components/notes-board"
import { db, initDb, notes, tags } from "@/db"
import { formatDate, type Lang } from "@/lib/i18n"

export async function getNotes(lang: Lang) {
  await initDb()

  const notesQuery = db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      dictated: notes.dictated,
      tagId: notes.tagId,
      updatedAt: notes.updatedAt,
      tagFr: tags.nameFr,
      tagEn: tags.nameEn,
    })
    .from(notes)
    .leftJoin(tags, eq(notes.tagId, tags.id))
    .orderBy(desc(notes.updatedAt), desc(notes.id))
  const tagsQuery = db.select().from(tags).orderBy(tags.id)

  const [noteRows, tagRows] = await Promise.all([notesQuery, tagsQuery])

  const noteList: NoteItem[] = noteRows.map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    dictated: row.dictated,
    tagId: row.tagId,
    tagName: lang === "fr" ? row.tagFr : row.tagEn,
    date: formatDate(row.updatedAt, lang),
  }))

  const tagList: TagItem[] = tagRows.map((tag) => ({
    id: tag.id,
    name: lang === "fr" ? tag.nameFr : tag.nameEn,
  }))

  return { notes: noteList, tags: tagList }
}

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
