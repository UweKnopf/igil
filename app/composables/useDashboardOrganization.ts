import { authClient } from '~~/lib/auth-client'

//sharing org state
export function useDashboardOrganization() {
  const activeOrganization = authClient.useActiveOrganization()

  const organization = computed(
    () => activeOrganization.value?.data
  )

  return {
    activeOrganization,
    organization
  }
}