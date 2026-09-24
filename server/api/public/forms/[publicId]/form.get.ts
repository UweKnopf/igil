import { eq } from "drizzle-orm";

import { db } from "~~/db";
import {
  submissionForms,
} from "~~/auth_schema";

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