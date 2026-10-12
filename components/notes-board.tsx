"use client"

import { useState } from "react"
import { Check, Mic, Pencil, Trash2 } from "lucide-react"
import { cn } from "cn"

import { deleteNote } from "@/app/actions"
import { NoteEditor } from "@/components/note-editor"
import { Button } from "@/components/ui/button"
import { dictionaries, type Lang } from "@/lib/i18n"

export interface NoteItem {
  id: number
  title: string
  content: string
  dictated: boolean
  tagId: number | null
  tagName: string | null
  date: string
}

export interface TagItem {
  id: number
  name: string
}

interface Props {
  lang: Lang
  notes: NoteItem[]
  tags: TagItem[]
}

export function NotesBoard({ lang, notes, tags }: Props) {
  const t = dictionaries[lang]
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formKey, setFormKey] = useState(0)

  const editingNote = notes.find((note) => note.id === editingId) ?? null

  function editNote(id: number) {
    setEditingId(id)
    setDeletingId(null)
    document.getElementById("editor")?.scrollIntoView({ behavior: "smooth" })
  }

  function closeEditor() {
    setEditingId(null)
    setFormKey(formKey + 1)
  }

  async function removeNote(id: number) {
    if (deletingId !== id) {
      setDeletingId(id)
      return
    }
    setDeletingId(null)
    if (editingId === id) closeEditor()
    await deleteNote(id)
  }

  return (
    <main className="flex w-full flex-1 flex-col gap-8 px-4 py-5 desk:mx-auto desk:max-w-6xl desk:gap-10 desk:px-6 desk:py-7">
      <NoteEditor
        key={`${editingId ?? "new"}-${formKey}`}
        lang={lang}
        note={editingNote}
        tags={tags}
        onDone={closeEditor}
      />

      <section id="notes" className="flex scroll-mt-20 flex-col gap-3">
        <div className="flex h-8 items-center gap-2">
          <h2 className="text-base font-semibold tracking-tight mob:text-lg">{t.myNotes}</h2>
          <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-xs font-medium">
            {notes.length}
          </span>
        </div>

        {notes.length === 0 && (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-muted-foreground">
            {t.empty}
          </p>
        )}

        {notes.map((note) => (
          <article
            key={note.id}
            className={cn(
              "group flex flex-col gap-1.5 rounded-xl border bg-card p-4 transition-colors desk:hover:border-ring",
              note.id === editingId && "border-foreground desk:hover:border-foreground"
            )}
          >
            <div className="flex items-start gap-2">
              <h3 className="min-w-0 flex-1 leading-7 font-semibold wrap-anywhere mob:text-base">
                {note.title}
              </h3>
              <div className="-mr-1.5 flex shrink-0 gap-1 transition-opacity mob:-my-2 mob:gap-2 desk:opacity-50 desk:group-hover:opacity-100">
                <Button variant="ghost" size="icon-sm" title={t.edit} onClick={() => editNote(note.id)}>
                  <Pencil />
                </Button>
                {deletingId === note.id ? (
                  <Button variant="destructive" size="sm" onClick={() => removeNote(note.id)}>
                    <Check />
                    {t.confirmRemove}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    title={t.remove}
                    onClick={() => removeNote(note.id)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>

            {note.content && (
              <p className="line-clamp-2 text-sm text-muted-foreground mob:line-clamp-3 mob:text-base">
                {note.content}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{note.date}</span>
              {note.tagName && (
                <span className="inline-flex h-5 items-center rounded-full bg-muted px-2 text-foreground">
                  {note.tagName}
                </span>
              )}
              {note.dictated && (
                <span className="inline-flex h-5 items-center gap-1 rounded-full border px-2">
                  <Mic className="size-3" />
                  {t.dictated}
                </span>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
