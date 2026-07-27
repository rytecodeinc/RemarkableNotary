import Link from "next/link";
import { redirect } from "next/navigation";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";
import { homePathForRole } from "@/lib/constants";
import { PREVIEW_COURSES, PREVIEW_ENTITLEMENT, isSupabaseConfigured } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Course, LessonProgress } from "@/lib/types";

export default async function LearnHomePage() {
  const profile = await getCurrentProfile();
  const preview = !profile || !isSupabaseConfigured();

  if (profile?.role === "admin") {
    redirect(homePathForRole("admin"));
  }

  const entitlement = preview
    ? PREVIEW_ENTITLEMENT
    : profile
      ? await getActiveEntitlement(profile.id)
      : null;

  let courseList: Course[] = PREVIEW_COURSES;
  let completedCount = 2;
  let resumeHref: string | null = `/learn/courses/${PREVIEW_COURSES[0].id}`;

  if (!preview && profile) {
    const supabase = await createClient();
    const { data: courses } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    courseList = (courses as Course[] | null) ?? [];

    const { data: progressRows } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", profile.id);

    const progress = (progressRows as LessonProgress[] | null) ?? [];
    completedCount = progress.filter((p) => p.completed).length;

    const resume = progress
      .slice()
      .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at))[0];

    resumeHref = null;
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
  }

  const displayName = preview ? "Alex" : profile?.full_name;

  return (
    <div className="grid gap-8">
      <section className="rounded-[1.5rem] bg-ink px-6 py-8 text-ivory md:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-brass">Student dashboard</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">
          Welcome{displayName ? `, ${displayName}` : ""}
        </h1>
        <p className="mt-3 max-w-2xl text-mist/80">
          {entitlement
            ? `Continue your California notary training. ${completedCount} lesson${completedCount === 1 ? "" : "s"} completed so far.`
            : "Your account is ready. Purchase the CA Notary Course to unlock lessons, videos, and resources."}
        </p>
        {entitlement ? (
          <p className="mt-3 text-sm text-mist/70">
            Access active until {formatDate(entitlement.access_ends_at)}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {resumeHref && entitlement ? (
            <Link href={preview ? "/learn" : resumeHref} className="btn btn-primary">
              Resume last lesson
            </Link>
          ) : null}
          {!entitlement ? (
            <Link href="/pricing" className="btn btn-primary">
              Get access
            </Link>
          ) : courseList[0] ? (
            <Link
              href={preview ? "/learn" : `/learn/courses/${courseList[0].id}`}
              className="btn btn-ghost"
            >
              Browse courses
            </Link>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-3xl">Your courses</h2>
          <p className="text-sm text-stone">{courseList.length} published</p>
        </div>

        {!entitlement ? (
          <div className="card-panel">
            <p className="font-display text-2xl">Membership required</p>
            <p className="mt-2 text-sm text-stone">
              Log in worked — you are a student account. Complete checkout to unlock the curriculum.
            </p>
            <Link href="/pricing" className="btn btn-dark mt-5 inline-flex">
              View enrollment
            </Link>
          </div>
        ) : courseList.length === 0 ? (
          <div className="card-panel text-sm text-stone">No published courses yet. Check back soon.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {courseList.map((course) => (
              <Link
                key={course.id}
                href={preview ? "/learn" : `/learn/courses/${course.id}`}
                className="hover-lift card-panel block"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-stone">Course</p>
                <h3 className="mt-2 font-display text-3xl">{course.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-[#4a5564]">
                  {course.description || "Open curriculum"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
