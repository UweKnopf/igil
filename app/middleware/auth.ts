import { authClient } from "../../lib/auth-client"

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session, error } = await authClient.getSession()

  if (error || !session) {
    return navigateTo({
      path: '/signIn',
      query: { redirect: to.fullPath }
    })
  } 
})