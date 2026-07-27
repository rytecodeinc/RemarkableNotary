"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { attachLessonResource, updateLesson } from "@/app/actions";
import { MediaUploader } from "@/components/admin/media-uploader";
import type { Lesson, LessonResource } from "@/lib/types";

export function LessonEditor({
  courseId,
  lesson,
  resources,
}: {
  courseId: string;
  lesson: Lesson;
  resources: LessonResource[];
}) {
  const router = useRouter();
  const [videoKey, setVideoKey] = useState(lesson.video_key || "");
  const [videoContentType, setVideoContentType] = useState(lesson.video_content_type || "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSave(formData: FormData) {
    formData.set("video_key", videoKey);
    formData.set("video_content_type", videoContentType);
    setMessage(null);
    startTransition(async () => {
      await updateLesson(lesson.id, courseId, formData);
      setMessage("Lesson saved");
      router.refresh();
    });
  }

  function onAttachResource(result: {
    key: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }) {
    const fd = new FormData();
    fd.set("title", result.fileName);
    fd.set("file_key", result.key);
    fd.set("file_name", result.fileName);
    fd.set("content_type", result.contentType);
    fd.set("size_bytes", String(result.sizeBytes));
    startTransition(async () => {
      await attachLessonResource(lesson.id, courseId, fd);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-[var(--line-dark)] bg-white p-5">
      <form action={onSave} className="grid gap-3">
        <label className="field">
          <span>Lesson title</span>
          <input name="title" defaultValue={lesson.title} required />
        </label>
        <label className="field">
          <span>Description</span>
          <textarea name="description" rows={2} defaultValue={lesson.description} />
        </label>
        <label className="field">
          <span>Lesson body</span>
          <textarea name="body" rows={5} defaultValue={lesson.body} />
        </label>
        <label className="field">
          <span>Duration (seconds)</span>
          <input
            name="duration_seconds"
            type="number"
            defaultValue={lesson.duration_seconds ?? undefined}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_published" defaultChecked={lesson.is_published} />
          Published
        </label>
        <input type="hidden" name="video_key" value={videoKey} readOnly />
        <input type="hidden" name="video_content_type" value={videoContentType} readOnly />
        <button type="submit" className="btn btn-dark" disabled={pending}>
          {pending ? "Saving…" : "Save lesson"}
        </button>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </form>

      <MediaUploader
        kind="video"
        lessonId={lesson.id}
        accept="video/*"
        label="Upload lesson video"
        onUploaded={(result) => {
          setVideoKey(result.key);
          setVideoContentType(result.contentType);
        }}
      />
      {videoKey ? <p className="break-all text-xs text-stone">Video key: {videoKey}</p> : null}

      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-stone">Resources</p>
        <ul className="mt-2 grid gap-1 text-sm">
          {resources.map((resource) => (
            <li key={resource.id}>{resource.title}</li>
          ))}
          {resources.length === 0 ? <li className="text-stone">No resources yet</li> : null}
        </ul>
        <div className="mt-3">
          <MediaUploader
            kind="resource"
            lessonId={lesson.id}
            accept=".pdf,.doc,.docx,.png,.jpg,.zip"
            label="Upload resource"
            onUploaded={onAttachResource}
          />
        </div>
      </div>
    </div>
  );
}
