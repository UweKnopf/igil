import { member, submissionFiles, submissions } from "~~/auth_schema";
import { db } from "~~/db";
import { and, eq } from 'drizzle-orm';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";



export default defineEventHandler(async (event) => {
  const orgSlug = getRouterParam(event, "orgSlug");
  const submissionId = getRouterParam(event, "submissionId");

  if (!orgSlug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Organization slug is required",
    })
  }

  const session = await auth.api.getSession({ headers: event.headers });

  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const organization = await auth.api.getOrganization({
    headers: event.headers,
    query: {
      organizationSlug: orgSlug,
    },
  })

  if (!organization) {
    throw createError({
      statusCode: 404,
      statusMessage: "Organization not found",
    })
  }

  const [membership] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.organizationId, organization.id),
        eq(member.userId, session.user.id),
      ),
    )
    .limit(1)

  if (!membership) {
    throw createError({
      statusCode: 403,
      statusMessage: "You are not a member of this organization",
    })
  }

  if (!["owner", "admin"].includes(membership.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have permission to see this submission",
    })
  }

  if (!submissionId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Submission ID is required",
    })
  }

  const [submission] = await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.organizationId, organization.id),
        eq(submissions.id, submissionId),
      ),
    )
    .limit(1)

  if (!submission) {
    throw createError({
      statusCode: 404,
      statusMessage: "Submission not found",
    })
  }

  const [submissionFile] = await db
    .select()
    .from(submissionFiles)
    .where(
      and(
        eq(submissionFiles.submissionId, submissionId),
      ),
    )
    .limit(1)

    if (!submissionFile) {
      throw createError({
        statusCode: 404,
        statusMessage: "Submission file not found",
      })
    }

    const s3 = getS3Client();
    
      const command = new GetObjectCommand({
        Bucket: submissionFile.bucket,
        Key: submissionFile.objectKey,
      });
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const downloadUrl = await getSignedUrl(s3, command, {
        expiresIn: 60 * 5, // 5 minutes
      });

  return {
    downloadUrl,
    expiresAt: expiresAt.toISOString(),

    headers: {
      "Content-Type": submissionFile.mimeType,
    },
  };
})

