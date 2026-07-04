"use client";

import { max_ms_chrono_voc } from "@/lib/config/app";
import { AudioLines } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_MS = max_ms_chrono_voc;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatMs(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(minutes)}:${pad2(seconds)}`;
}

export default function Chrono({ running }: { running: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const stop = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      startRef.current = null;
      setElapsed(0);
    };

    const tick = () => {
      if (startRef.current == null) return;

      const now = performance.now();
      const next = now - startRef.current;

      if (next >= MAX_MS) {
        setElapsed(MAX_MS);
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        return;
      }

      setElapsed(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    if (!running) {
      stop();
      return;
    }

    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  return (
    <span
      className={`text-sm text-gray-jarvis select-none transition-all duration-75 flex gap-2 mr-3 items-center ${
        running ? "" : "hidden"
      }`}
      aria-live="polite"
    >
      <AudioLines
        className={`text-red-400 ${
          running ? "animate-[blink_2s_infinite]" : ""
        }`}
      />
      <span className="tabular-nums w-[4ch] text-right">
        {formatMs(elapsed)}
      </span>
    </span>
  );
}
