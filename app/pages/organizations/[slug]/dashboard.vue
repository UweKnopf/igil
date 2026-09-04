<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const activeOrganization = authClient.useActiveOrganization()

const organization = computed(() => activeOrganization.value?.data)

watchEffect(() => {
  // Prevent access to a different organization's dashboard.
  if (
    organization.value?.slug &&
    organization.value.slug !== route.params.slug
  ) {
    navigateTo(`/organizations/${organization.value.slug}/dashboard`, {
      replace: true
    })
  }
})
</script>

<template>
  <div class="p-4 sm:p-6">
    <UCard v-if="organization">
      <template #header>
        <div class="flex items-center gap-3">
          <UAvatar
            :src="organization.logo || undefined"
            :alt="organization.name"
          />

          <div>
            <h1 class="text-xl font-semibold">
              {{ organization.name }}
            </h1>
            <p class="text-sm text-muted">
              Organization dashboard
            </p>
          </div>
        </div>
      </template>

      <div class="py-6">
        Dashboard content goes here.
      </div>
    </UCard>
  </div>
</template>