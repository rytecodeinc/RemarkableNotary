import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import type { Course, LessonProgress } from "@/lib/types";

export default async function LearnHomePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const entitlement = profile.role === "admin" ? true : await getActiveEntitlement(profile.id);
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const courseList = (courses as Course[] | null) ?? [];

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", profile.id);

  const progress = (progressRows as LessonProgress[] | null) ?? [];
  const completedCount = progress.filter((p) => p.completed).length;

  const resume = progress
    .slice()
    .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0];

  let resumeHref: string | null = null;
  if (resume && entitlement) {
    const { data: lesson } = await supabase
      .from("lessons")
      .select("id, module_id")
      .eq("id", resume.lesson_id)
      .maybeSingle();

    if (lesson?.module_id) {
      const { data: mod } = await supabase
        .from("modules")
        .select("course_id")
        .eq("id", lesson.module_id)
        .maybeSingle();

      if (mod?.course_id) {
        resumeHref = `/learn/courses/${mod.course_id}/lessons/${resume.lesson_id}`;
      }
    }
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[1.5rem] bg-ink px-6 py-8 text-ivory md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-gold">Student dashboard</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">
          Welcome{profile.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-mist/80">
          {entitlement
            ? `Continue your California notary training. ${completedCount} lesson${completedCount === 1 ? "" : "s"} completed so far.`
            : "Purchase the CA Notary Course to unlock lessons, videos, and resources."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {resumeHref ? (
            <Link href={resumeHref} className="btn btn-primary">
              Resume last lesson
            </Link>
          ) : null}
          {!entitlement && profile.role !== "admin" ? (
            <Link href="/pricing" className="btn btn-primary">
              Get access
            </Link>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl">Your courses</h2>
          <p className="text-sm text-stone">{courseList.length} published</p>
        </div>

        {courseList.length === 0 ? (
          <div className="card-panel text-sm text-stone">
            No published courses yet. Check back soon{profile.role === "admin" ? ", or publish courses in Admin" : ""}.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courseList.map((course) => (
              <Link
                key={course.id}
                href={entitlement || profile.role === "admin" ? `/learn/courses/${course.id}` : "/pricing"}
                className="hover-lift card-panel block"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-stone">Course</p>
                <h3 className="mt-2 font-display text-3xl">{course.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-[#4a5564]">{course.description || "Open curriculum"}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
