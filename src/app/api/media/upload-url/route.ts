import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/access";
import { buildMediaKey, createUploadUrl } from "@/lib/r2";

const schema = z.object({
  kind: z.enum(["video", "resource", "thumbnail"]),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  courseId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await request.json();
    const parsed = schema.parse(json);
    const key = buildMediaKey(parsed);
    const uploadUrl = await createUploadUrl({
      key,
      contentType: parsed.contentType,
    });

    return NextResponse.json({ key, uploadUrl });
  } catch (error) {
    console.error("upload-url error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create upload URL" },
      { status: 400 },
    );
  }
}
