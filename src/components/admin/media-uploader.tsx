"use client";

import { useState, useTransition } from "react";

export function MediaUploader({
  kind,
  lessonId,
  courseId,
  accept,
  label,
  onUploaded,
}: {
  kind: "video" | "resource" | "thumbnail";
  lessonId?: string;
  courseId?: string;
  accept: string;
  label: string;
  onUploaded: (result: {
    key: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setError(null);
    setProgress("Requesting upload URL…");

    startTransition(async () => {
      try {
        const res = await fetch("/api/media/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            filename: file.name,
            contentType: file.type || "application/octet-stream",
            lessonId,
            courseId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not create upload URL");

        setProgress("Uploading to R2…");
        const upload = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });
        if (!upload.ok) throw new Error("Upload failed");

        onUploaded({
          key: data.key,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        });
        setProgress("Uploaded");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setProgress(null);
      }
    });
  }

  return (
    <div className="grid gap-2">
      <label className="field">
        <span>{label}</span>
        <input
          type="file"
          accept={accept}
          disabled={pending}
          onChange={(e) => onChange(e.target.files)}
        />
      </label>
      {progress ? <p className="text-xs text-stone">{progress}</p> : null}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
