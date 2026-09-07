import { authClient } from '~~/lib/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) {
    const { auth } = await import('~~/server/utils/auth')
    try {
      // Nuxt forwards the browser's Better Auth session cookie to Better Auth.
      const headers = useRequestHeaders(['cookie'])

      const session = await auth.api.getSession({
        headers
      })

      if (!session?.user) {
        return navigateTo({
          path: '/signIn',
          query: { redirect: to.fullPath }
        })
      }
    } catch (error) {
      console.error('Server auth middleware session check failed:', error)

      return navigateTo({
        path: '/signIn',
        query: { redirect: to.fullPath }
      })
    }

    return
  }

  const { data: session, error } = await authClient.getSession()

  if (error || !session) {
    return navigateTo({
      path: '/signIn',
      query: { redirect: to.fullPath }
    })
  }
})