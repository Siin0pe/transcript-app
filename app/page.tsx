import { desc, eq } from "drizzle-orm"

import { NotesBoard, type NoteItem, type TagItem } from "@/components/notes-board"
import { db, initDb, notes, tags } from "@/db"
import { formatDate } from "@/lib/i18n"
import { getPrefs } from "@/lib/prefs"

export default async function Page() {
  const { lang } = await getPrefs()
  await initDb()

  const noteRows = await db
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

  const tagRows = await db.select().from(tags).orderBy(tags.id)

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

  return <NotesBoard lang={lang} notes={noteList} tags={tagList} />
}
