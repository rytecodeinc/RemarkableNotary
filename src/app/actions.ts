"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, requireUser } from "@/lib/access";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const next = String(formData.get("next") || "/learn");

  if (!email) {
    return { error: "Email is required." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

const courseSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  is_published: z.coerce.boolean().optional(),
  sort_order: z.coerce.number().int().optional(),
});

export async function createCourse(formData: FormData) {
  await requireAdmin();
  const parsed = courseSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    is_published: formData.get("is_published") === "on",
    sort_order: formData.get("sort_order") || 0,
  });

  const supabase = await createClient();
  const slugBase = slugify(parsed.title);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: parsed.title,
      description: parsed.description || "",
      is_published: parsed.is_published ?? false,
      sort_order: parsed.sort_order ?? 0,
      slug,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/learn");
  redirect(`/admin/courses/${data.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();
  const parsed = courseSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") || "",
    is_published: formData.get("is_published") === "on",
    sort_order: formData.get("sort_order") || 0,
  });

  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      title: parsed.title,
      description: parsed.description || "",
      is_published: parsed.is_published ?? false,
      sort_order: parsed.sort_order ?? 0,
    })
    .eq("id", courseId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/learn");
}

export async function createModule(courseId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Module title required");

  const supabase = await createClient();
  const { count } = await supabase
    .from("modules")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { error } = await supabase.from("modules").insert({
    course_id: courseId,
    title,
    description: String(formData.get("description") || ""),
    sort_order: count ?? 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function createLesson(moduleId: string, courseId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Lesson title required");

  const supabase = await createClient();
  const { count } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("module_id", moduleId);

  const { error } = await supabase.from("lessons").insert({
    module_id: moduleId,
    title,
    description: String(formData.get("description") || ""),
    body: String(formData.get("body") || ""),
    is_published: formData.get("is_published") === "on",
    sort_order: count ?? 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const payload = {
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || ""),
    body: String(formData.get("body") || ""),
    is_published: formData.get("is_published") === "on",
    video_key: String(formData.get("video_key") || "") || null,
    video_content_type: String(formData.get("video_content_type") || "") || null,
    duration_seconds: Number(formData.get("duration_seconds") || 0) || null,
  };

  if (!payload.title) throw new Error("Lesson title required");

  const { error } = await supabase.from("lessons").update(payload).eq("id", lessonId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/learn");
}

export async function attachLessonResource(lessonId: string, courseId: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = String(formData.get("title") || "").trim();
  const file_key = String(formData.get("file_key") || "").trim();
  const file_name = String(formData.get("file_name") || "").trim();
  const content_type = String(formData.get("content_type") || "application/octet-stream");
  const size_bytes = Number(formData.get("size_bytes") || 0) || null;

  if (!title || !file_key || !file_name) {
    throw new Error("Resource fields required");
  }

  const { error } = await supabase.from("lesson_resources").insert({
    lesson_id: lessonId,
    title,
    file_key,
    file_name,
    content_type,
    size_bytes,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function saveLessonProgress(formData: FormData) {
  const profile = await requireUser();
  const lessonId = String(formData.get("lesson_id") || "");
  const progressPercent = Number(formData.get("progress_percent") || 0);
  const lastPosition = Number(formData.get("last_position_seconds") || 0);
  const completed = formData.get("completed") === "true" || progressPercent >= 95;

  if (!lessonId) throw new Error("Missing lesson");

  const supabase = await createClient();
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: profile.id,
      lesson_id: lessonId,
      progress_percent: Math.min(100, Math.max(0, Math.round(progressPercent))),
      last_position_seconds: Math.max(0, Math.round(lastPosition)),
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) throw new Error(error.message);
  revalidatePath("/learn");
}
