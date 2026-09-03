<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

definePageMeta({
  middleware: 'auth'
})

const organizations = authClient.useListOrganizations()

const organizationRows = computed(() => [
  ...(organizations.value.data ?? [])
])
</script>

<template>
  <div class="mx-auto w-full max-w-6xl p-4 sm:p-6">
    <UCard
      :ui="{
        root: 'overflow-hidden',
        header: 'border-b border-default px-6 py-5',
        body: 'p-0',
        footer: 'border-t border-default px-6 py-4'
      }"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-semibold text-highlighted">
              Organizations
            </h1>
            <p class="mt-1 text-sm text-muted">
              View and manage the organizations you belong to.
            </p>
          </div>

          <UButton
            label="Create organization"
            icon="i-lucide-plus"
            to="/organizations/create"
          />
        </div>
      </template>

      <UTable :data="organizationRows">
        <template #empty>
          <div
            class="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center"
          >
            <div class="rounded-full bg-elevated p-3">
              <UIcon
                name="i-lucide-building-2"
                class="size-6 text-muted"
              />
            </div>

            <div>
              <h2 class="text-lg font-semibold text-highlighted">
                You don’t belong to an organization yet
              </h2>

              <p class="mt-1 max-w-md text-sm text-muted">
                Create a new organization or ask for an invitation to join an
                existing one.
              </p>
            </div>

            <div class="flex flex-wrap justify-center gap-3">
              <UButton
                label="Create organization"
                icon="i-lucide-plus"
                to="/organizations/create"
              />

              <UButton
                label="Join organization"
                icon="i-lucide-log-in"
                color="neutral"
                variant="outline"
                to="/organizations/join"
              />
            </div>
          </div>
        </template>
      </UTable>

      <template #footer>
        <p class="text-sm text-muted">
          {{ organizationRows.length }}
          {{ organizationRows.length === 1 ? 'organization' : 'organizations' }}
        </p>
      </template>
    </UCard>
  </div>
</template>