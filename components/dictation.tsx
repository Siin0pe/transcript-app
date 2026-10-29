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
    <div className="flex min-h-11 flex-col justify-center gap-2">
      {whisper.status === "idle" && (
        <div className="flex flex-wrap items-center gap-3">
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
          <span className="text-sm text-muted-foreground mob:w-full">{t.whisperHint}</span>
        </div>
      )}

      {whisper.status === "loading" && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between gap-2 text-sm text-muted-foreground">
            <span>{whisper.progress < 0.99 ? t.loadingModel : t.preparingModel}</span>
            <span>{Math.round(whisper.progress * 100)} %</span>
          </div>
          <div className="h-2 bg-muted">
            <div className="h-full bg-yellow transition-[width] duration-300" style={{ width: whisper.progress * 100 + "%" }} />
          </div>
        </div>
      )}

      {whisper.status === "recording" && (
        <div className="flex items-center gap-3">
          <span className="size-2.5 animate-pulse bg-red" />
          <span className="text-lg font-bold text-red tabular-nums">{formatDuration(whisper.seconds)}</span>
          <span className="text-sm text-muted-foreground mob:hidden">{t.recording}</span>
          <Button type="button" variant="destructive" className="ml-auto" onClick={whisper.stop}>
            <Square className="fill-current" />
            {t.stop}
          </Button>
        </div>
      )}

      {whisper.status === "transcribing" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {t.transcribing}
        </div>
      )}

      {whisper.error && (
        <p className="text-sm font-semibold text-red">
          {whisper.error === "mic-denied" ? t.micDenied : t.dictationFailed}
        </p>
      )}
    </div>
  )
}
