"use client"

import { CircleStop, Loader, Mic } from "lucide-react"
import { useRef, useState } from "react"
import Chrono from "./Chrono"

export default function Vocal() {
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const busyRef = useRef(false)

  const startRecording = async () => {
    if (busyRef.current || isRecording) return
    busyRef.current = true

    try {
      setLoading(true)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const preferred = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ]
      const mimeType = preferred.find((t) => MediaRecorder.isTypeSupported(t))

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      )
      recorderRef.current = recorder

      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Micro error:", err)

      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      recorderRef.current = null
      chunksRef.current = []
      setIsRecording(false)
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }

  const stopRecording = async () => {
    if (busyRef.current || !isRecording) return
    busyRef.current = true

    try {
      setLoading(true)

      const recorder = recorderRef.current
      const stream = streamRef.current

      if (!recorder || !stream) {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        recorderRef.current = null
        streamRef.current = null
        chunksRef.current = []
        setIsRecording(false)
        return
      }

      if (recorder.state === "inactive") {
        stream.getTracks().forEach((t) => t.stop())
        recorderRef.current = null
        streamRef.current = null
        chunksRef.current = []
        setIsRecording(false)
        return
      }

      setIsRecording(false)

      const blob: Blob = await new Promise((resolve) => {
        recorder.onstop = () => {
          const type = recorder.mimeType || "audio/webm"
          resolve(new Blob(chunksRef.current, { type }))
        }
        recorder.stop()
      })

      chunksRef.current = []

      stream.getTracks().forEach((t) => t.stop())

      recorderRef.current = null
      streamRef.current = null

      console.log("Audio blob:", blob, blob.type, blob.size)
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }

  const cancelRecording = () => {
    if (busyRef.current || !isRecording) return
    busyRef.current = true

    try {
      setLoading(true)
      const recorder = recorderRef.current
      const stream = streamRef.current

      if (stream) stream.getTracks().forEach((t) => t.stop())
      chunksRef.current = []
      if (recorder && recorder.state !== "inactive") recorder.stop()

      recorderRef.current = null
      streamRef.current = null

      setIsRecording(false)
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }

  return (
    <div className="w-fit mt-9 sm:w-full sm:max-w-xl">
      <button
        type="button"
        tabIndex={0}
        disabled={loading}
        onClick={() => {
          if (isRecording) {
            stopRecording()
          } else {
            startRecording()
          }
        }}
        className={`hidden w-full border border-border bg-card rounded-2xl sm:grid grid-cols-[auto_auto_1fr_auto] items-center p-6 hover:bg-card/80 transition-colors select-none ${
          loading ? "cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {/* 1) left icon */}
        {loading ? (
          <Loader
            width={20}
            className="block animate-spin translate-y-[0.5px] self-center"
          />
        ) : (
          <Mic width={20} className="block translate-y-[0.5px] self-center" />
        )}

        {/* 2) label */}
        <p className="font-semibold ml-4 whitespace-nowrap leading-none self-center">
          {loading
            ? "Chargement..."
            : isRecording
              ? "Enregistrement…"
              : "Enregistrer"}
        </p>

        {/* 3) flexible center area (placeholder) */}
        <div className="mx-4 h-6 flex items-center overflow-hidden justify-end">
          <Chrono running={isRecording} />
        </div>

        {/* 4) right area (placeholder) */}
        <div className="justify-self-end flex items-center justify-center">
          <CircleStop
            width={22}
            className={`block translate-y-[0.5px] ${isRecording ? "opacity-100" : "opacity-0"} transition-opacity`}
          />
        </div>
      </button>

      {/* Mobile button */}
      <button
        type="button"
        disabled={loading}
        tabIndex={0}
        onClick={() => {
          if (isRecording) {
            stopRecording()
          } else {
            startRecording()
          }
        }}
        className={`sm:hidden bg-card border border-border rounded-full w-fit h-fit ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="h-36 w-36 p-2 flex items-center justify-center">
          {loading ? (
            <Loader
              width={20}
              className="block animate-spin translate-y-[0.5px] self-center"
            />
          ) : (
            <Mic className={`${isRecording ? "hidden" : ""} w-10 h-10`} />
          )}
          <Chrono running={isRecording} />
        </div>
      </button>
      {isRecording && (
        <div className="w-full flex justify-center sm:justify-end mt-4">
          <button
            onClick={() => cancelRecording()}
            className="px-5 py-3 cursor-pointer rounded-xl border border-border bg-card hover:bg-card/80 transition-colors"
          >
            Annuler
          </button>
        </div>
      )}
    </div>
  )
}
