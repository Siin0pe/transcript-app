"use client"

import { useState } from "react"

import { saveNote } from "@/actions/notes"
import { Dictation } from "@/components/dictation"
import type { NoteItem, TagItem } from "@/components/notes-board"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useWhisper } from "@/hooks/use-whisper"
import { dictionaries, type Lang } from "@/lib/i18n"

interface Props {
  lang: Lang
  note: NoteItem | null
  tags: TagItem[]
  onDone: () => void
}

export function NoteEditor({ lang, note, tags, onDone }: Props) {
  const t = dictionaries[lang]

  const [title, setTitle] = useState(note ? note.title : "")
  const [content, setContent] = useState(note ? note.content : "")
  const [tagId, setTagId] = useState(note && note.tagId ? String(note.tagId) : "none")
  const [dictated, setDictated] = useState(note ? note.dictated : false)
  const [chosenLang, setChosenLang] = useState<string | null>(null)
  const [titleError, setTitleError] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [saving, setSaving] = useState(false)

  const dictationLang = chosenLang ?? lang

  function addDictatedText(text: string) {
    setDictated(true)
    setContent((previous) => {
      if (previous.trim() === "") return text
      return previous.trimEnd() + "\n\n" + text
    })
  }

  const whisper = useWhisper(dictationLang === "auto" ? undefined : dictationLang, addDictatedText)

  const tagOptions = [
    { value: "none", label: t.noTag },
    ...tags.map((tag) => ({ value: String(tag.id), label: tag.name })),
  ]

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    setTitleError(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (title.trim() === "") {
      setTitleError(true)
      return
    }

    setSaving(true)
    setSaveError(false)
    try {
      const saved = await saveNote({
        id: note ? note.id : null,
        title,
        content,
        tagId: tagId === "none" ? null : Number(tagId),
        dictated,
      })
      if (saved) {
        onDone()
      } else {
        setSaveError(true)
      }
    } catch {
      setSaveError(true)
    }
    setSaving(false)
  }

  const isBusy = saving || whisper.status === "recording" || whisper.status === "transcribing"

  return (
    <section id="editor" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex items-end gap-4 mob:flex-wrap mob:gap-2">
        <h2 className="font-heading text-4xl leading-none font-extrabold uppercase dark:text-yellow">{note ? t.editNote : t.newNote}</h2>
        {note && (
          <span className="mb-1 min-w-0 truncate text-lg font-semibold mob:basis-full mob:whitespace-normal">
            {t.editHint(note.title)}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="panel flex flex-col gap-6 p-6 mob:p-4">
        <div className="flex flex-col gap-6 desk:flex-row">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="title">{t.title}</Label>
            <Input
              id="title"
              value={title}
              maxLength={255}
              placeholder={t.titlePlaceholder}
              autoComplete="off"
              onChange={handleTitleChange}
            />
            {titleError && <p className="text-sm font-semibold text-red">{t.titleRequired}</p>}
          </div>

          <div className="flex flex-col gap-2 desk:w-48">
            <Label>{t.tag}</Label>
            <Select value={tagId} onValueChange={(value) => setTagId(value ?? "none")} items={tagOptions}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tagOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Dictation
          lang={lang}
          whisper={whisper}
          dictationLang={dictationLang}
          onDictationLangChange={setChosenLang}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="content">{t.content}</Label>
          <Textarea
            id="content"
            value={content}
            placeholder={t.contentPlaceholder}
            className="min-h-48"
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {saveError && <p className="text-sm font-semibold text-red">{t.saveFailed}</p>}

        <div className="flex items-center gap-3 mob:flex-col mob:items-stretch">
          <Button type="submit" disabled={isBusy}>
            {saving ? t.saving : t.save}
          </Button>
          <Button type="button" variant="ghost" disabled={saving} onClick={onDone}>
            {t.cancel}
          </Button>
          <span className="ml-auto text-sm text-muted-foreground mob:mx-auto">{t.chars(content.length)}</span>
        </div>
      </form>
    </section>
  )
}
