import * as z from 'zod'
import { auth } from "../../utils/auth";
//import { requireUser } from "../../utils/auth";

const bodySchema = z.object({
  name: z.string().trim().min(1, 'An organization name is required').max(100),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(25)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Must be a lowercase URL slug (letters, numbers, and single hyphens only)'
    )
})

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ headers: event.headers });
	if (!session?.user) {
		throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
	}

  const body = await readValidatedBody(event, bodySchema.parse)

  // Example business rule:
  // const organizationCount = await db.organization.count({
  //   where: { members: { some: { userId: user.id } } }
  // })
  //
  // if (organizationCount >= 3) {
  //   throw createError({
  //     statusCode: 403,
  //     statusMessage: 'You have reached the organization limit.'
  //   })
  // }

  /*
   * The exact argument shape depends on your Better Auth version.
   * Pass the incoming request headers so Better Auth can identify
   * the authenticated user/session.
   */
  const result = await auth.api.createOrganization({
    headers: event.headers,
    body: {
      name: body.name,
      slug: body.slug,
      keepCurrentActiveOrganization: false
    }
  })

  return {
    organization: result
  }
})