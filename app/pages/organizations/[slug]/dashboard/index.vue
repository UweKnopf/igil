<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'organization'
})

const { organization } = useDashboardOrganization()
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-semibold">
        Overview
      </h1>

      <p class="mt-1 text-muted">
        Welcome to {{ organization?.name || 'your organization' }}.
      </p>
    </header>

    <UCard>
      <template #header>
        <h2 class="font-semibold">
          Organization dashboard
        </h2>
      </template>

      <p class="text-muted">
        Add your organization metrics, recent activity, and quick actions here.
      </p>
    </UCard>
  </div>
</template>