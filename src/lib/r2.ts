import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || "remarkable-notary";
  const endpoint =
    process.env.R2_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing R2 configuration (R2_ACCOUNT_ID / keys / endpoint)");
  }

  return { accessKeyId, secretAccessKey, bucket, endpoint };
}

export function getR2Client() {
  const { accessKeyId, secretAccessKey, endpoint } = getR2Config();
  return new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function getR2Bucket() {
  return getR2Config().bucket;
}

export async function createUploadUrl(params: {
  key: string;
  contentType: string;
  expiresIn?: number;
}) {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: getR2Bucket(),
    Key: params.key,
    ContentType: params.contentType,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: params.expiresIn ?? 60 * 10,
  });

  return url;
}

export async function createDownloadUrl(params: {
  key: string;
  filename?: string;
  expiresIn?: number;
}) {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: getR2Bucket(),
    Key: params.key,
    ResponseContentDisposition: params.filename
      ? `attachment; filename="${params.filename.replace(/"/g, "")}"`
      : undefined,
  });

  return getSignedUrl(client, command, {
    expiresIn: params.expiresIn ?? 60 * 30,
  });
}

export function buildMediaKey(parts: {
  kind: "video" | "resource" | "thumbnail";
  courseId?: string;
  lessonId?: string;
  filename: string;
}) {
  const safeName = parts.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const stamp = Date.now();
  if (parts.kind === "thumbnail" && parts.courseId) {
    return `courses/${parts.courseId}/thumbnails/${stamp}-${safeName}`;
  }
  if (parts.lessonId) {
    return `lessons/${parts.lessonId}/${parts.kind}/${stamp}-${safeName}`;
  }
  return `uploads/${parts.kind}/${stamp}-${safeName}`;
}
