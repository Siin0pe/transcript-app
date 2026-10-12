"use client"

import { LoaderCircle, Mic, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { useWhisper } from "@/hooks/use-whisper"
import { dictionaries, type Lang } from "@/lib/i18n"

const DICTATION_LANGUAGES = ["fr", "en", "es", "de", "it", "pt", "auto"] as const

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
}

interface Props {
  lang: Lang
  whisper: ReturnType<typeof useWhisper>
  dictationLang: string
  onDictationLangChange: (value: string) => void
}

export function Dictation({ lang, whisper, dictationLang, onDictationLangChange }: Props) {
  const t = dictionaries[lang]
  const languageOptions = DICTATION_LANGUAGES.map((code) => ({ value: code, label: t.languages[code] }))

  return (
    <div className="flex min-h-14 flex-col justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5">
      {whisper.status === "idle" && (
        <div className="flex flex-wrap items-center gap-2 mob:gap-3">
          <Button type="button" variant="outline" onClick={whisper.start}>
            <Mic />
            {t.dictate}
          </Button>
          <Select
            value={dictationLang}
            onValueChange={(value) => value && onDictationLangChange(value)}
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
            <span>{whisper.progress < 0.99 ? t.loadingModel : t.preparingModel}</span>
            <span className="font-mono">{Math.round(whisper.progress * 100)} %</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: whisper.progress * 100 + "%" }}
            />
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

      {whisper.error && (
        <p className="text-xs text-destructive mob:text-sm">
          {whisper.error === "mic-denied" ? t.micDenied : t.dictationFailed}
        </p>
      )}
    </div>
  )
}
