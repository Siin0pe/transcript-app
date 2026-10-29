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
    <main className="w-full flex-1">
      <div className="flex flex-col gap-12 px-4 pt-8 desk:mx-auto desk:max-w-6xl desk:px-6 desk:pt-10">
        <NoteEditor
          key={`${editingId ?? "new"}-${formKey}`}
          lang={lang}
          note={editingNote}
          tags={tags}
          onDone={closeEditor}
        />

        <section id="notes" className="flex scroll-mt-24 flex-col gap-6">
          <h2 className="font-heading text-4xl leading-none font-extrabold uppercase dark:text-yellow">
            {t.myNotes} <span className="text-red">{notes.length}</span>
          </h2>

          {notes.length === 0 && (
            <p className="border-2 border-dashed border-foreground px-4 py-10 text-center text-lg font-semibold">
              {t.empty}
            </p>
          )}

          <div className="grid gap-4 desk:grid-cols-2">
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
          </div>
        </section>
      </div>
    </main>
  )
}
