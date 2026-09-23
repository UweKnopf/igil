import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";

import { db } from "~~/db";
import {
  submissionForms,
  pendingSubmissionUploads,
} from "~~/auth_schema";
import { getS3Client } from "~~/server/utils/s3";

type UploadRequestBody = {
  filename: string;
  contentType: string;
  sizeBytes: number;
};

const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/rtf",
  "text/plain",
];

function getSafeExtension(filename: string, contentType: string) {
  const extensionFromFilename = filename
    .toLowerCase()
    .match(/\.(pdf|docx|rtf|txt)$/)?.[1];

  if (extensionFromFilename) {
    return extensionFromFilename;
  }

  const extensionForMime: Record<string, string> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/rtf": "rtf",
    "text/plain": "txt",
  };

  return extensionForMime[contentType] ?? "bin";
}

export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, "publicId");

  if (!publicId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing form identifier",
    });
  }

  const body = await readBody<UploadRequestBody>(event);

  if (
    !body ||
    typeof body.filename !== "string" ||
    typeof body.contentType !== "string" ||
    typeof body.sizeBytes !== "number"
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid upload request",
    });
  }

  if (!Number.isSafeInteger(body.sizeBytes) || body.sizeBytes <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid file size",
    });
  }

  // Look up only by the public identifier.
  const [form] = await db.select().from(submissionForms).where(eq(submissionForms.publicId, publicId)).limit(1);

  if (!form) {
    throw createError({
      statusCode: 404,
      statusMessage: "Submission form not found",
    });
  }

  const now = new Date();

  const formIsClosed =
    !form.isOpen ||
    (form.opensAt && form.opensAt > now) ||
    (form.closesAt && form.closesAt < now);

  if (formIsClosed) {
    throw createError({
      statusCode: 403,
      statusMessage: "This submission form is currently closed",
    });
  }

  const allowedMimeTypes =
    form.acceptedMimeTypes?.length > 0
      ? form.acceptedMimeTypes
      : DEFAULT_ALLOWED_MIME_TYPES;

  if (!allowedMimeTypes.includes(body.contentType)) {
    throw createError({
      statusCode: 400,
      statusMessage: "This file type is not accepted",
    });
  }

  if (body.sizeBytes > form.maxFileSizeBytes) {
    throw createError({
      statusCode: 400,
      statusMessage: `File exceeds the ${form.maxFileSizeBytes} byte limit`,
    });
  }

  const config = useRuntimeConfig();
  const bucket = config.s3SubmissionsBucket;

  // Never use the original filename as the object key.
  const uploadId = randomUUID();
  const extension = getSafeExtension(body.filename, body.contentType);

  const objectKey = [
    "private",
    "submissions",
    form.organizationId,
    form.id,
    "pending",
    `${uploadId}.${extension}`,
  ].join("/");

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Store an upload authorization before issuing the presigned URL.
  await db.insert(pendingSubmissionUploads).values({
    id: uploadId,
    formId: form.id,
    bucket,
    objectKey,
    originalFilename: body.filename.slice(0, 255),
    mimeType: body.contentType,
    expectedSizeBytes: body.sizeBytes,
    expiresAt,
  });

  const s3 = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,

    // This header is included in the signature.
    // The browser must send exactly this value.
    ContentType: body.contentType,

    // Do not store author name/email here. Object metadata can leak into logs/tools.
    Metadata: {
      pendingUploadId: uploadId,
      formId: form.id,
    },
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5, // 5 minutes
  });

  return {
    uploadId,
    uploadUrl,
    expiresAt: expiresAt.toISOString(),

    // The client must send this with the PUT request.
    headers: {
      "Content-Type": body.contentType,
    },
  };
});