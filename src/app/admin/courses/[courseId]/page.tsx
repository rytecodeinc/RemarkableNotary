import { notFound } from "next/navigation";
import { createLesson, createModule, updateCourse } from "@/app/actions";
import { LessonEditor } from "@/components/admin/lesson-editor";
import { createClient } from "@/lib/supabase/server";
import type { Course, Lesson, LessonResource, Module } from "@/lib/types";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();
  if (!course) notFound();

  const typedCourse = course as Course;

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  const moduleList = (modules as Module[] | null) ?? [];
  const moduleIds = moduleList.map((m) => m.id);

  const { data: lessons } = moduleIds.length
    ? await supabase.from("lessons").select("*").in("module_id", moduleIds).order("sort_order")
    : { data: [] as Lesson[] };

  const lessonList = (lessons as Lesson[] | null) ?? [];
  const lessonIds = lessonList.map((l) => l.id);

  const { data: resources } = lessonIds.length
    ? await supabase.from("lesson_resources").select("*").in("lesson_id", lessonIds)
    : { data: [] as LessonResource[] };

  const resourceList = (resources as LessonResource[] | null) ?? [];

  async function saveCourse(formData: FormData) {
    "use server";
    await updateCourse(courseId, formData);
  }

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl">{typedCourse.title}</h1>
        <p className="mt-2 text-sm text-stone">Edit course details, modules, lessons, and media.</p>
      </div>

      <section className="card-panel">
        <h2 className="font-display text-2xl">Course settings</h2>
        <form action={saveCourse} className="mt-4 grid gap-3">
          <label className="field">
            <span>Title</span>
            <input name="title" defaultValue={typedCourse.title} required />
          </label>
          <label className="field">
            <span>Description</span>
            <textarea name="description" rows={3} defaultValue={typedCourse.description} />
          </label>
          <label className="field">
            <span>Sort order</span>
            <input name="sort_order" type="number" defaultValue={typedCourse.sort_order} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_published" defaultChecked={typedCourse.is_published} />
            Published
          </label>
          <button type="submit" className="btn btn-dark w-fit">
            Save course
          </button>
        </form>
      </section>

      <section className="card-panel">
        <h2 className="font-display text-2xl">Add module</h2>
        <form
          action={async (formData) => {
            "use server";
            await createModule(courseId, formData);
          }}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <label className="field">
            <span>Title</span>
            <input name="title" required placeholder="Module 1" />
          </label>
          <label className="field">
            <span>Description</span>
            <input name="description" placeholder="Optional" />
          </label>
          <button type="submit" className="btn btn-outline md:col-span-2 w-fit">
            Add module
          </button>
        </form>
      </section>

      <div className="grid gap-6">
        {moduleList.map((mod) => {
          const modLessons = lessonList.filter((l) => l.module_id === mod.id);
          return (
            <section key={mod.id} className="card-panel grid gap-5">
              <div>
                <h2 className="font-display text-3xl">{mod.title}</h2>
                {mod.description ? <p className="mt-1 text-sm text-stone">{mod.description}</p> : null}
              </div>

              <form
                action={async (formData) => {
                  "use server";
                  await createLesson(mod.id, courseId, formData);
                }}
                className="grid gap-3 rounded-xl border border-dashed border-[var(--line-dark)] p-4 md:grid-cols-2"
              >
                <label className="field md:col-span-2">
                  <span>New lesson title</span>
                  <input name="title" required placeholder="Lesson title" />
                </label>
                <label className="field md:col-span-2">
                  <span>Description</span>
                  <input name="description" />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_published" />
                  Published
                </label>
                <button type="submit" className="btn btn-outline w-fit">
                  Add lesson
                </button>
              </form>

              <div className="grid gap-4">
                {modLessons.map((lesson) => (
                  <LessonEditor
                    key={lesson.id}
                    courseId={courseId}
                    lesson={lesson}
                    resources={resourceList.filter((r) => r.lesson_id === lesson.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
