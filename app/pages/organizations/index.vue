<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

definePageMeta({
  middleware: 'auth'
})

const activeOrganization = authClient.useActiveOrganization()

watch(
  () => activeOrganization.value?.data,
  (organization) => {
    if (organization?.slug) {
      navigateTo(`/organizations/${organization.slug}/dashboard`, {
        replace: true
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <div v-if="activeOrganization.isPending" class="text-muted">
      Loading organization…
    </div>

    <UCard v-else-if="!activeOrganization.data" class="w-full max-w-md">
      <template #header>
        <h1 class="text-lg font-semibold">No active organization</h1>
      </template>

      <p class="text-sm text-muted">
        Select or create an organization before accessing a dashboard.
      </p>

      <template #footer>
        <UButton to="/organizations" label="View organizations" block />
      </template>
    </UCard>
  </div>
</template>