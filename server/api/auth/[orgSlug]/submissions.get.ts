import { member, submissions } from "~~/auth_schema";
import { db } from "~~/db";
import { and, eq } from 'drizzle-orm';



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
      statusMessage: "You do not have permission to see all submissions",
    })
  }

  const submissionRows = await db.select().from(submissions)
    .where(
      eq(submissions.organizationId, organization.id)
    )

  return submissionRows
})

