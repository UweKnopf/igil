import { and, eq } from 'drizzle-orm';
import { createError, defineEventHandler, getRouterParam, readValidatedBody } from 'h3'
import * as z from 'zod'
import { member, submissionForms } from '~~/auth_schema';
import { db } from '~~/db';
//import { auth } from "../../utils/auth";
//import { requireUser } from "../../utils/auth";

import {
  createFormSchema,
  type CreateFormBody,
} from '~~/shared/zodSchemas/form'

export default defineEventHandler(async (event) => {
  const orgSlug = getRouterParam(event, "orgSlug");

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
      statusMessage: "You do not have permission to create forms",
    })
  }

  const forms = await db.select().from(submissionForms)
    .where(
        eq(submissionForms.organizationId, organization.id)
    )

  return forms
})

