"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { saveLessonProgress } from "@/app/actions";

export function LessonPlayer({
  lessonId,
  videoKey,
  initialPosition = 0,
}: {
  lessonId: string;
  videoKey: string | null;
  initialPosition?: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const lastSaved = useRef(0);

  useEffect(() => {
    if (!videoKey) return;
    let cancelled = false;

    async function load() {
      const res = await fetch("/api/media/download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: videoKey, lessonId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (!cancelled) setError(data.error || "Unable to load video");
        return;
      }
      if (!cancelled) setSrc(data.url);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [videoKey, lessonId]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || initialPosition <= 0) return;
    const onLoaded = () => {
      if (el.duration && initialPosition < el.duration - 2) {
        el.currentTime = initialPosition;
      }
    };
    el.addEventListener("loadedmetadata", onLoaded);
    return () => el.removeEventListener("loadedmetadata", onLoaded);
  }, [initialPosition, src]);

  function persist(forceComplete = false) {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const now = Date.now();
    if (!forceComplete && now - lastSaved.current < 5000) return;
    lastSaved.current = now;

    const percent = Math.round((el.currentTime / el.duration) * 100);
    const fd = new FormData();
    fd.set("lesson_id", lessonId);
    fd.set("progress_percent", String(percent));
    fd.set("last_position_seconds", String(Math.floor(el.currentTime)));
    fd.set("completed", forceComplete || percent >= 95 ? "true" : "false");
    startTransition(() => {
      void saveLessonProgress(fd);
    });
  }

  if (!videoKey) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl bg-ink text-sm text-mist/70">
        No video uploaded for this lesson yet.
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl bg-ink text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!src) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl bg-ink text-sm text-mist/70">
        Loading video…
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="aspect-video w-full rounded-2xl bg-black"
      src={src}
      controls
      playsInline
      onTimeUpdate={() => persist(false)}
      onPause={() => persist(false)}
      onEnded={() => persist(true)}
    />
  );
}
