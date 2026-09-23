<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'organization'
})

const route = useRoute()

const invitationsPath = computed(
  () => `/organizations/${encodeURIComponent(String(route.params.slug))}/dashboard/invitations`
)
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold">
          Members
        </h1>

        <p class="mt-1 text-muted">
          View your organization’s members and their roles.
        </p>
      </div>

      <UButton
        :to="invitationsPath"
        icon="i-lucide-user-plus"
      >
        Invite member
      </UButton>
    </header>

    <UCard>
      <div class="py-10 text-center">
        <UIcon
          name="i-lucide-users"
          class="mx-auto size-10 text-muted"
        />

        <h2 class="mt-3 font-semibold">
          Member directory
        </h2>

        <p class="mt-1 text-sm text-muted">
          Connect your organization member query here.
        </p>
      </div>
    </UCard>
  </div>
</template>