"use client"

import { useEffect, useRef, useState } from "react"
import type { BrowserWhisper } from "browser-whisper"

export type WhisperStatus = "idle" | "loading" | "recording" | "transcribing"

const MODEL = "whisper-tiny"
const SAMPLE_RATE = 16_000 // Whisper expects mono 16 kHz PCM

interface UseWhisperOptions {
  /** BCP-47 code ("fr", "en"…), undefined for auto-detect */
  language?: string
  onTranscript: (text: string) => void
}

export function useWhisper({ language, onTranscript }: UseWhisperOptions) {
  const [status, setStatus] = useState<WhisperStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const whisperRef = useRef<BrowserWhisper | null>(null)
  const modelReadyRef = useRef(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Always read the latest values from the recorder's async callbacks
  const languageRef = useRef(language)
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    languageRef.current = language
    onTranscriptRef.current = onTranscript
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      const recorder = recorderRef.current
      if (recorder) {
        recorder.onstop = null
        recorder.stream.getTracks().forEach((t) => t.stop())
      }
      whisperRef.current?.dispose()
      whisperRef.current = null
    }
  }, [])

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = null
  }

  // The library touches window/Worker, so it is only imported client-side
  async function getWhisper() {
    if (!whisperRef.current) {
      const { BrowserWhisper } = await import("browser-whisper")
      whisperRef.current = new BrowserWhisper({ model: MODEL })
    }
    return whisperRef.current
  }

  async function start() {
    setError(null)
    try {
      const whisper = await getWhisper()
      if (!modelReadyRef.current) {
        setProgress(0)
        setStatus("loading")
        await whisper.downloadModel({
          model: MODEL,
          onProgress: (e) => setProgress(e.progress),
        })
        modelReadyRef.current = true
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        transcribe(new Blob(chunks, { type: recorder.mimeType }))
      }
      recorderRef.current = recorder
      recorder.start()

      setSeconds(0)
      setStatus("recording")
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch (err) {
      fail(err)
    }
  }

  function stop() {
    stopTimer()
    recorderRef.current?.stop()
    recorderRef.current = null
  }

  async function transcribe(blob: Blob) {
    setStatus("transcribing")
    try {
      // Decoding through a 16 kHz AudioContext resamples the recording for us
      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE })
      const audio = await ctx.decodeAudioData(await blob.arrayBuffer())
      await ctx.close()

      const whisper = await getWhisper()
      const segments = await whisper
        .transcribePCM(audio.getChannelData(0), { language: languageRef.current })
        .collect()
      const text = segments.map((s) => s.text.trim()).join(" ").trim()
      if (text) onTranscriptRef.current(text)
      setStatus("idle")
    } catch (err) {
      fail(err)
    }
  }

  function fail(err: unknown) {
    stopTimer()
    setStatus("idle")
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      setError("Accès au micro refusé. Autorise-le dans ton navigateur pour dicter.")
    } else {
      setError(err instanceof Error ? err.message : "La dictée a échoué.")
    }
  }

  return { status, progress, seconds, error, start, stop }
}
