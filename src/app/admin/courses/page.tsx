import Link from "next/link";
import { createCourse } from "@/app/actions";
import { getCurrentProfile } from "@/lib/access";
import { PREVIEW_COURSES, isSupabaseConfigured } from "@/lib/preview";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/lib/types";

export default async function AdminCoursesPage() {
  const profile = await getCurrentProfile();
  const preview = !profile || !isSupabaseConfigured();

  let courses: Course[] = PREVIEW_COURSES;
  if (!preview) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });
    courses = (data as Course[] | null) ?? [];
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Courses</h1>
          <p className="mt-2 text-sm text-stone">
            {preview
              ? "Preview of the course manager. Connect Supabase to create real courses."
              : "Create and organize the curriculum."}
          </p>
        </div>
      </div>

      <section className="card-panel">
        <h2 className="font-display text-2xl">Create course</h2>
        {preview ? (
          <p className="mt-3 text-sm text-stone">
            Course creation is disabled in preview mode.
          </p>
        ) : (
          <form action={createCourse} className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="field md:col-span-2">
              <span>Title</span>
              <input name="title" required placeholder="Notary Foundations" />
            </label>
            <label className="field md:col-span-2">
              <span>Description</span>
              <textarea name="description" rows={3} placeholder="What students will learn" />
            </label>
            <label className="field">
              <span>Sort order</span>
              <input name="sort_order" type="number" defaultValue={courses.length} />
            </label>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input type="checkbox" name="is_published" />
              Published
            </label>
            <button type="submit" className="btn btn-dark md:col-span-2">
              Create course
            </button>
          </form>
        )}
      </section>

      <section className="grid gap-3">
        {courses.map((course) =>
          preview ? (
            <div key={course.id} className="card-panel">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-3xl">{course.title}</h3>
                  <p className="mt-1 text-sm text-stone">{course.description || "No description"}</p>
                </div>
                <span
                  className={`text-xs uppercase tracking-[0.14em] ${
                    course.is_published ? "text-emerald-700" : "text-stone"
                  }`}
                >
                  {course.is_published ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          ) : (
            <Link
              key={course.id}
              href={`/admin/courses/${course.id}`}
              className="hover-lift card-panel block"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-3xl">{course.title}</h3>
                  <p className="mt-1 text-sm text-stone">{course.description || "No description"}</p>
                </div>
                <span
                  className={`text-xs uppercase tracking-[0.14em] ${
                    course.is_published ? "text-emerald-700" : "text-stone"
                  }`}
                >
                  {course.is_published ? "Published" : "Draft"}
                </span>
              </div>
            </Link>
          ),
        )}
        {courses.length === 0 ? (
          <div className="card-panel text-sm text-stone">No courses yet — create your first one above.</div>
        ) : null}
      </section>
    </div>
  );
}
