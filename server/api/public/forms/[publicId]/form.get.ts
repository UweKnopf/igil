import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { and, eq } from "drizzle-orm";

import { db } from "~~/db";
import {
  submissionForms,
} from "~~/auth_schema";
import { getS3Client } from "~~/server/utils/s3";


export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, "publicId");

  if (!publicId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing form identifier",
    });
  }

    const [form] = await db.select().from(submissionForms).where(eq(submissionForms.publicId, publicId)).limit(1);

    if (!form) {
      throw createError({
        statusCode: 404,
        statusMessage: "Submission form is unavailable",
      });
    }

    if (!form.isOpen) {
      throw createError({
        statusCode: 403,
        statusMessage: "Submission form is closed",
      });
    }

    return {
      form //probably not everything necessary or even safe, but for now we can return the whole form object
    };
});