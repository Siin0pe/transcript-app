"use client"

import { useState } from "react"
import { LoaderCircle, Mic, Square } from "lucide-react"

import { saveNote } from "@/app/actions"
import type { NoteItem, TagItem } from "@/components/notes-board"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useWhisper } from "@/hooks/use-whisper"
import { dictionaries, type Lang } from "@/lib/i18n"

const DICTATION_LANGUAGES = ["fr", "en", "es", "de", "it", "pt", "auto"] as const

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
}

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

  const tagOptions = [{ value: "none", label: t.noTag }]
  for (const tag of tags) {
    tagOptions.push({ value: String(tag.id), label: tag.name })
  }

  const languageOptions = DICTATION_LANGUAGES.map((code) => ({ value: code, label: t.languages[code] }))

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
        title: title,
        content: content,
        tagId: tagId === "none" ? null : Number(tagId),
        dictated: dictated,
      })
      if (saved) {
        onDone()
      } else {
        setTitleError(true)
      }
    } catch {
      setSaveError(true)
    }
    setSaving(false)
  }

  const isBusy = saving || whisper.status === "recording" || whisper.status === "transcribing"

  return (
    <section id="editor" className="flex scroll-mt-20 flex-col gap-3">
      <div className="flex h-8 items-center justify-between gap-3 mob:h-auto mob:flex-col mob:items-start mob:gap-1">
        <h2 className="text-base font-semibold tracking-tight mob:text-lg">
          {note ? t.editNote : t.newNote}
        </h2>
        <span className="truncate text-xs text-muted-foreground mob:whitespace-normal mob:text-sm">
          {note ? t.editHint(note.title) : t.draftHint}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-4 desk:flex-row">
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
            {titleError && <p className="text-xs text-destructive mob:text-sm">{t.titleRequired}</p>}
          </div>

          <div className="flex flex-col gap-2 desk:w-44">
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

        <div className="flex min-h-14 flex-col justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5">
          {whisper.status === "idle" && (
            <div className="flex flex-wrap items-center gap-2 mob:gap-3">
              <Button type="button" variant="outline" onClick={whisper.start}>
                <Mic />
                {t.dictate}
              </Button>
              <Select
                value={dictationLang}
                onValueChange={(value) => setChosenLang(value)}
                items={languageOptions}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground mob:w-full">{t.whisperHint}</span>
            </div>
          )}

          {whisper.status === "loading" && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t.loadingModel}</span>
                <span className="font-mono">{Math.round(whisper.progress * 100)} %</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: whisper.progress * 100 + "%" }} />
              </div>
            </div>
          )}

          {whisper.status === "recording" && (
            <div className="flex items-center gap-3">
              <span className="size-2 animate-pulse rounded-full bg-red-500" />
              <span className="font-mono text-sm">{formatDuration(whisper.seconds)}</span>
              <span className="text-xs text-muted-foreground mob:hidden">{t.recording}</span>
              <Button type="button" size="sm" className="ml-auto" onClick={whisper.stop}>
                <Square className="fill-current" />
                {t.stop}
              </Button>
            </div>
          )}

          {whisper.status === "transcribing" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <LoaderCircle className="size-4 animate-spin" />
              {t.transcribing}
            </div>
          )}

          {whisper.error === "mic-denied" && <p className="text-xs text-destructive mob:text-sm">{t.micDenied}</p>}
          {whisper.error === "failed" && <p className="text-xs text-destructive mob:text-sm">{t.dictationFailed}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="content">{t.content}</Label>
          <Textarea
            id="content"
            value={content}
            placeholder={t.contentPlaceholder}
            className="min-h-56 mob:min-h-48"
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {saveError && <p className="text-xs text-destructive mob:text-sm">{t.saveFailed}</p>}

        <div className="flex items-center gap-2 border-t pt-4 mob:flex-col mob:items-stretch mob:gap-3">
          <Button type="submit" disabled={isBusy} className="mob:w-full">
            {saving ? t.saving : t.save}
          </Button>
          <Button type="button" variant="ghost" disabled={saving} className="mob:w-full" onClick={onDone}>
            {t.cancel}
          </Button>
          <span className="ml-auto text-xs text-muted-foreground mob:mx-auto">{t.chars(content.length)}</span>
        </div>
      </form>
    </section>
  )
}
