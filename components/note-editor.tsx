"use client"

import { useState } from "react"
import { LoaderCircle, Mic, Square } from "lucide-react"

import { useWhisper } from "@/hooks/use-whisper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const LANGUAGES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "auto", label: "Détection auto" },
]

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

export function NoteEditor() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState("fr")

  const { status, progress, seconds, error, start, stop } = useWhisper({
    language: language === "auto" ? undefined : language,
    // Dictated text is appended after what is already written
    onTranscript: (text) =>
      setContent((prev) => (prev.trim() ? `${prev.trimEnd()}\n\n${text}` : text)),
  })

  function reset() {
    setTitle("")
    setContent("")
  }

  return (
    <section className="flex min-w-0 flex-col gap-3 md:flex-1">
      <div className="flex h-8 items-center">
        <h2 className="text-base font-semibold tracking-tight">Nouvelle note</h2>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Réunion du 1er octobre"
              autoComplete="off"
            />
          </div>

          {/* Dictation */}
          <div
            className="flex min-h-14 flex-col justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5"
            aria-live="polite"
          >
            {status === "idle" && (
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={start}>
                  <Mic />
                  Dicter
                </Button>
                <Select
                  value={language}
                  onValueChange={(v) => v && setLanguage(v)}
                  items={LANGUAGES}
                >
                  <SelectTrigger aria-label="Langue de la dictée">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  Whisper tiny, tourne dans ton navigateur
                </span>
              </div>
            )}

            {status === "loading" && (
              <>
                <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                  <span>Téléchargement du modèle (une seule fois)</span>
                  <span className="font-mono tabular-nums">{Math.round(progress * 100)} %</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </>
            )}

            {status === "recording" && (
              <div className="flex items-center gap-3">
                <span className="size-2 shrink-0 animate-pulse rounded-full bg-red-500" aria-hidden />
                <span className="font-mono text-sm tabular-nums">{formatDuration(seconds)}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Enregistrement en cours…
                </span>
                <Button size="sm" className="ml-auto" onClick={stop}>
                  <Square className="fill-current" />
                  Arrêter
                </Button>
              </div>
            )}

            {status === "transcribing" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                Transcription en cours…
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Contenu</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Écris, ou dicte avec le bouton au-dessus."
              className="min-h-56"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row">
          {/* TODO: save through a server action */}
          <Button className="w-full sm:w-auto">Enregistrer</Button>
          <Button variant="ghost" className="w-full sm:w-auto" onClick={reset}>
            Annuler
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
