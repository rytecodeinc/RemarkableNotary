import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveEntitlement, getCurrentProfile } from "@/lib/access";
import { createDownloadUrl } from "@/lib/r2";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  key: z.string().min(1),
  filename: z.string().optional(),
  lessonId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = schema.parse(await request.json());

    if (profile.role !== "admin") {
      const entitlement = await getActiveEntitlement(profile.id);
      if (!entitlement) {
        return NextResponse.json({ error: "No active access" }, { status: 403 });
      }

      if (parsed.lessonId) {
        const supabase = await createClient();
        const { data: lesson } = await supabase
          .from("lessons")
          .select("id, is_published, video_key")
          .eq("id", parsed.lessonId)
          .maybeSingle();

        if (!lesson?.is_published) {
          return NextResponse.json({ error: "Lesson unavailable" }, { status: 403 });
        }

        const { data: resources } = await supabase
          .from("lesson_resources")
          .select("file_key")
          .eq("lesson_id", parsed.lessonId);

        const allowedKeys = new Set<string>();
        if (lesson.video_key) allowedKeys.add(lesson.video_key);
        (resources ?? []).forEach((r) => allowedKeys.add(r.file_key));

        if (!allowedKeys.has(parsed.key)) {
          return NextResponse.json({ error: "Forbidden key" }, { status: 403 });
        }
      }
    }

    const url = await createDownloadUrl({
      key: parsed.key,
      filename: parsed.filename,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("download-url error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create download URL" },
      { status: 400 },
    );
  }
}
