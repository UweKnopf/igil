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
        Settings
      </h1>

      <p class="mt-1 text-muted">
        Your organization’s details and configuration.
      </p>
    </header>

    <UCard v-if="organization" class="max-w-2xl">
      <template #header>
        <h2 class="font-semibold">
          Organization details
        </h2>
      </template>

      <dl class="space-y-5">
        <div>
          <dt class="text-sm text-muted">
            Logo
          </dt>
          <dd class="mt-2">
            <UAvatar
              :src="organization.logo || undefined"
              :alt="organization.name"
              size="lg"
            />
          </dd>
        </div>

        <div>
          <dt class="text-sm text-muted">
            Name
          </dt>
          <dd class="mt-1 font-medium">
            {{ organization.name }}
          </dd>
        </div>

        <div>
          <dt class="text-sm text-muted">
            Slug
          </dt>
          <dd class="mt-1 font-mono text-sm">
            {{ organization.slug }}
          </dd>
        </div>

        <div>
          <dt class="text-sm text-muted">
            Organization ID
          </dt>
          <dd class="mt-1 break-all font-mono text-sm">
            {{ organization.id }}
          </dd>
        </div>
      </dl>

      <template #footer>
        <p class="text-sm text-muted">
          Organization editing controls can be added here.
        </p>
      </template>
    </UCard>
  </div>
</template>