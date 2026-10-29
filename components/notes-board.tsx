"use client"

import { useState } from "react"

import { deleteNote } from "@/actions/notes"
import { NoteCard } from "@/components/note-card"
import { NoteEditor } from "@/components/note-editor"
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
    try {
      await deleteNote(id)
      if (editingId === id) closeEditor()
    } catch (err) {
      console.error(err)
    }
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
          <NoteCard
            key={note.id}
            lang={lang}
            note={note}
            isEditing={note.id === editingId}
            isDeleting={note.id === deletingId}
            onEdit={() => editNote(note.id)}
            onDelete={() => removeNote(note.id)}
          />
        ))}
      </section>
    </main>
  )
}
