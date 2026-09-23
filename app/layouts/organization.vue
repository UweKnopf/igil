<script setup lang="ts">
const route = useRoute()
const { organization } = useDashboardOrganization()

const dashboardPath = computed(() => {
  const slug = organization.value?.slug ?? String(route.params.slug)
  return `/organizations/${encodeURIComponent(slug)}/dashboard`
})

const navigation = computed(() => [
  {
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    to: dashboardPath.value,
    exact: true
  },
  {
    label: 'Members',
    icon: 'i-lucide-users',
    to: `${dashboardPath.value}/members`
  },
  {
    label: 'Forms',
    icon: 'i-lucide-form',
    to: `${dashboardPath.value}/forms`
  },
  {
    label: 'Submissions',
    icon: 'i-lucide-feather',
    to: `${dashboardPath.value}/members`
  },
  {
    label: 'Invitations',
    icon: 'i-lucide-mail-plus',
    to: `${dashboardPath.value}/invitation`
  },
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: `${dashboardPath.value}/settings`
  }
])

watchEffect(() => {
  const slug = organization.value?.slug

  // Keep the URL aligned with the active organization.
  if (slug && slug !== route.params.slug) {
    void navigateTo(
      `/organizations/${encodeURIComponent(slug)}/dashboard`,
      { replace: true }
    )
  }
})
</script>

<template>
  <div class="min-h-screen bg-default md:flex">
    <aside
      class="border-b border-default bg-elevated/50 p-4
             md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0
             md:border-b-0 md:border-r"
    >
      <div class="mb-6 flex items-center gap-3">
        <UAvatar
          :src="organization?.logo || undefined"
          :alt="organization?.name || 'Organization'"
        />

        <div class="min-w-0">
          <p class="truncate font-semibold">
            {{ organization?.name || 'Organization' }}
          </p>

          <p class="text-xs text-muted">
            Workspace dashboard
          </p>
        </div>
      </div>

      <UNavigationMenu
        orientation="vertical"
        :items="navigation"
        class="w-full"
      />
    </aside>

    <main class="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
      <div class="mx-auto max-w-6xl">
        <slot />
      </div>
    </main>
  </div>
</template>