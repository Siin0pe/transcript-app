"use client"

import { useEffect, useRef, useState } from "react"
import type { BrowserWhisper } from "browser-whisper"

type WhisperStatus = "idle" | "loading" | "recording" | "transcribing"
type WhisperError = "mic-denied" | "failed"

const MODEL = "whisper-tiny"

let whisperPromise: Promise<BrowserWhisper> | null = null

async function createWhisper(onProgress: (progress: number) => void) {
  const { BrowserWhisper } = await import("browser-whisper")
  const whisper = new BrowserWhisper({ model: MODEL })
  await whisper.downloadModel({ model: MODEL, onProgress: (e) => onProgress(e.progress) })
  return whisper
}

export function useWhisper(language: string | undefined, onText: (text: string) => void) {
  const [status, setStatus] = useState<WhisperStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<WhisperError | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startingRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearInterval(timerRef.current)
      if (recorderRef.current) {
        recorderRef.current.onstop = null
        recorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  async function loadModel() {
    if (!whisperPromise) {
      setProgress(0)
      setStatus("loading")
      whisperPromise = createWhisper((value) => setProgress((current) => Math.max(current, value)))
    }
    try {
      return await whisperPromise
    } catch (err) {
      whisperPromise = null
      throw err
    }
  }

  async function start() {
    if (startingRef.current) return
    startingRef.current = true
    setError(null)

    try {
      const whisper = await loadModel()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        transcribe(whisper, new Blob(chunks, { type: recorder.mimeType }))
      }

      recorderRef.current = recorder
      recorder.start()
      setSeconds(0)
      setStatus("recording")
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch (err) {
      fail(err)
    } finally {
      startingRef.current = false
    }
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current)
    recorderRef.current?.stop()
    recorderRef.current = null
  }

  async function transcribe(whisper: BrowserWhisper, blob: Blob) {
    setStatus("transcribing")
    try {
      const audioContext = new AudioContext({ sampleRate: 16000 })
      const audio = await audioContext.decodeAudioData(await blob.arrayBuffer())
      await audioContext.close()

      const segments = await whisper.transcribePCM(audio.getChannelData(0), { language }).collect()
      const text = segments.map((segment) => segment.text.trim()).join(" ").trim()
      if (text) onText(text)
      setStatus("idle")
    } catch (err) {
      fail(err)
    }
  }

  function fail(err: unknown) {
    console.error(err)
    if (timerRef.current) clearInterval(timerRef.current)
    setStatus("idle")
    if (err instanceof DOMException && err.name === "NotAllowedError") {
      setError("mic-denied")
    } else {
      setError("failed")
    }
  }

  return { status, progress, seconds, error, start, stop }
}
