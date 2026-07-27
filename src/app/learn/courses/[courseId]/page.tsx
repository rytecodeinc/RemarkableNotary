import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import type { Course, Lesson, Module } from "@/lib/types";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (profile.role !== "admin") {
    const entitlement = await getActiveEntitlement(profile.id);
    if (!entitlement) redirect("/pricing");
  }

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .maybeSingle();

  if (!course || (!(course as Course).is_published && profile.role !== "admin")) {
    notFound();
  }

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const moduleList = (modules as Module[] | null) ?? [];
  const moduleIds = moduleList.map((m) => m.id);

  const { data: lessons } = moduleIds.length
    ? await supabase
        .from("lessons")
        .select("*")
        .in("module_id", moduleIds)
        .order("sort_order", { ascending: true })
    : { data: [] as Lesson[] };

  const lessonList = ((lessons as Lesson[] | null) ?? []).filter(
    (l) => l.is_published || profile.role === "admin",
  );

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed, progress_percent")
    .eq("user_id", profile.id);

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.lesson_id as string, p]),
  );

  return (
    <div className="grid gap-8">
      <div>
        <Link href="/learn" className="text-sm text-stone hover:text-ink">
          ← My courses
        </Link>
        <h1 className="mt-3 font-display text-4xl md:text-5xl">{(course as Course).title}</h1>
        <p className="mt-3 max-w-3xl text-[#4a5564]">{(course as Course).description}</p>
      </div>

      <div className="grid gap-5">
        {moduleList.map((mod) => {
          const modLessons = lessonList.filter((l) => l.module_id === mod.id);
          return (
            <section key={mod.id} className="card-panel">
              <h2 className="font-display text-3xl">{mod.title}</h2>
              {mod.description ? (
                <p className="mt-2 text-sm text-stone">{mod.description}</p>
              ) : null}
              <ul className="mt-5 grid gap-2">
                {modLessons.map((lesson) => {
                  const p = progressMap.get(lesson.id);
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={`/learn/courses/${courseId}/lessons/${lesson.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-[var(--line-dark)] hover:bg-[#f7f5f0]"
                      >
                        <span>
                          <span className="block font-medium">{lesson.title}</span>
                          <span className="text-xs text-stone">
                            {p?.completed
                              ? "Completed"
                              : p
                                ? `${p.progress_percent}% complete`
                                : "Not started"}
                          </span>
                        </span>
                        <span className="text-xs uppercase tracking-[0.14em] text-gold">Open</span>
                      </Link>
                    </li>
                  );
                })}
                {modLessons.length === 0 ? (
                  <li className="px-3 text-sm text-stone">No published lessons yet.</li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
