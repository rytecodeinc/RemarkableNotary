import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LessonPlayer } from "@/components/learn/lesson-player";
import { ResourceDownloadButton } from "@/components/learn/resource-download";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import type { Lesson, LessonResource } from "@/lib/types";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role !== "admin") {
    const entitlement = await getActiveEntitlement(profile.id);
    if (!entitlement) redirect("/pricing");
  }

  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*, modules!inner(id, course_id, title)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson) notFound();

  const typed = lesson as Lesson & { modules: { id: string; course_id: string; title: string } };
  if (typed.modules.course_id !== courseId) notFound();
  if (!typed.is_published && profile.role !== "admin") notFound();

  const { data: resources } = await supabase
    .from("lesson_resources")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("created_at", { ascending: true });

  const resourceList = (resources as LessonResource[] | null) ?? [];

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", profile.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  const { data: siblings } = await supabase
    .from("lessons")
    .select("id, title, sort_order, is_published")
    .eq("module_id", typed.module_id)
    .order("sort_order", { ascending: true });

  const siblingList = ((siblings as Lesson[] | null) ?? []).filter(
    (l) => l.is_published || profile.role === "admin",
  );
  const index = siblingList.findIndex((l) => l.id === lessonId);
  const prev = index > 0 ? siblingList[index - 1] : null;
  const next = index >= 0 && index < siblingList.length - 1 ? siblingList[index + 1] : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-6">
        <div>
          <Link href={`/learn/courses/${courseId}`} className="text-sm text-stone hover:text-ink">
            ← {typed.modules.title}
          </Link>
          <h1 className="mt-3 font-display text-4xl">{typed.title}</h1>
          {typed.description ? (
            <p className="mt-2 text-[#4a5564]">{typed.description}</p>
          ) : null}
        </div>

        <LessonPlayer
          lessonId={typed.id}
          videoKey={typed.video_key}
          initialPosition={progress?.last_position_seconds ?? 0}
        />

        {typed.body ? (
          <article className="card-panel prose-rn whitespace-pre-wrap">{typed.body}</article>
        ) : null}

        {resourceList.length > 0 ? (
          <section className="card-panel">
            <h2 className="font-display text-2xl">Resources</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {resourceList.map((resource) => (
                <ResourceDownloadButton
                  key={resource.id}
                  fileKey={resource.file_key}
                  filename={resource.file_name}
                  lessonId={typed.id}
                  title={resource.title}
                />
              ))}
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap justify-between gap-3">
          {prev ? (
            <Link href={`/learn/courses/${courseId}/lessons/${prev.id}`} className="btn btn-outline">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/learn/courses/${courseId}/lessons/${next.id}`} className="btn btn-dark">
              {next.title} →
            </Link>
          ) : null}
        </div>
      </div>

      <aside className="card-panel h-fit">
        <p className="text-xs uppercase tracking-[0.16em] text-stone">In this module</p>
        <ul className="mt-4 grid gap-2 text-sm">
          {siblingList.map((item) => (
            <li key={item.id}>
              <Link
                href={`/learn/courses/${courseId}/lessons/${item.id}`}
                className={item.id === lessonId ? "font-semibold text-ink" : "text-stone hover:text-ink"}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
