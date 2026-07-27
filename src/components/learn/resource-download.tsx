"use client";

import { useState, useTransition } from "react";

export function ResourceDownloadButton({
  fileKey,
  filename,
  lessonId,
  title,
}: {
  fileKey: string;
  filename: string;
  lessonId: string;
  title: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/media/download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileKey, filename, lessonId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Download failed");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div>
      <button type="button" className="btn btn-outline py-2" onClick={onClick} disabled={pending}>
        {pending ? "Preparing…" : title}
      </button>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
