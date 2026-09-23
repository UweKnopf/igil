// server/api/public/forms/[publicId]/submissions.post.ts
import {
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "~~/db";
import {
  pendingSubmissionUploads,
  submissionFiles,
  submissionForms,
  submissions,
} from "~~/auth_schema";
import { getS3Client } from "~~/server/utils/s3";

type SubmissionBody = {
  name: string;
  email: string;
  answers?: Record<string, unknown>;
  uploadIds: string[];
};

export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, "publicId");
  const body = await readBody<SubmissionBody>(event);

  if (
    !publicId ||
    !body ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    !Array.isArray(body.uploadIds) ||
    body.uploadIds.length !== 1
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid submission",
    });
  }

  const [form] = await db.select().from(submissionForms).where(eq(submissionForms.publicId, publicId)).limit(1);

  if (!form || !form.isOpen) {
    throw createError({
      statusCode: 404,
      statusMessage: "Submission form is unavailable",
    });
  }

  // Validate custom fields against form.fields here.
  // Validate email format, required fields, CAPTCHA, rate limits, etc.

  const [upload] = await db
    .select()
    .from(pendingSubmissionUploads)
    .where(
      and(
        eq(pendingSubmissionUploads.id, body.uploadIds[0]!),
        eq(pendingSubmissionUploads.formId, form.id),
        isNull(pendingSubmissionUploads.consumedAt),
        gt(pendingSubmissionUploads.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!upload) {
    throw createError({
      statusCode: 400,
      statusMessage: "The uploaded manuscript is missing or has expired",
    });
  }

  const s3 = getS3Client();

  let uploadedObject;
  try {
    uploadedObject = await s3.send(
      new HeadObjectCommand({
        Bucket: upload.bucket,
        Key: upload.objectKey,
      }),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: "The manuscript was not successfully uploaded",
    });
  }

  const actualSizeBytes = uploadedObject.ContentLength ?? 0;
  const actualContentType = uploadedObject.ContentType ?? "";

  const permittedMimeTypes = form.acceptedMimeTypes ?? [];
  const correctType = permittedMimeTypes.includes(actualContentType);
  const validSize =
    actualSizeBytes > 0 &&
    actualSizeBytes <= form.maxFileSizeBytes &&
    actualSizeBytes <= upload.expectedSizeBytes;

  if (!correctType || !validSize) {
    // Remove an invalid object that was uploaded using a valid signed URL.
    await s3.send(
      new DeleteObjectCommand({
        Bucket: upload.bucket,
        Key: upload.objectKey,
      }),
    );

    throw createError({
      statusCode: 400,
      statusMessage: "The uploaded manuscript did not meet form requirements",
    });
  }

  const result = await db.transaction(async (tx) => {
    const [submission] = await tx
      .insert(submissions)
      .values({
        formId: form.id,
        organizationId: form.organizationId,
        submitterName: body.name.trim(),
        submitterEmail: body.email.trim().toLowerCase(),
        answers: body.answers ?? {},
        status: "received",
      })
      .returning();

    await tx.insert(submissionFiles).values({
      submissionId: submission!.id,
      bucket: upload.bucket,
      objectKey: upload.objectKey,
      originalFilename: upload.originalFilename,
      mimeType: actualContentType,
      sizeBytes: actualSizeBytes,
      uploadStatus: "uploaded",
    });

    await tx
      .update(pendingSubmissionUploads)
      .set({ consumedAt: new Date() })
      .where(eq(pendingSubmissionUploads.id, upload.id));

    return submission;
  });

  return {
    success: true,
    submissionId: result!.id,
  };
});