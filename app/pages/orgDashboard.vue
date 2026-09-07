<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

definePageMeta({
  middleware: 'auth'
})

type Organization = {
  id: string
  name: string
  slug: string
}

const mounted = ref(false)
const organizationRows = ref<Organization[]>([])

onMounted(async () => {
  mounted.value = true

  const { data, error } = await authClient.organization.list()

  if (error) {
    console.error('Could not load organizations:', error.message)
    return
  }

  organizationRows.value = data ?? []
})

const columns = [
  {
    accessorKey: 'name',
    header: 'Organization'
  },
  {
    accessorKey: 'slug',
    header: 'Slug'
  },
  {
    id: 'actions',
    header: '',
    meta: {
      class: {
        th: 'w-0 text-right',
        td: 'text-right'
      }
    }
  }
]

const setActiveOrganization = async (organization: {
  id: string
  slug: string
}) => {
  const { error } = await authClient.organization.setActive({
    organizationId: organization.id
  })

  if (error) {
    throw createError({
      statusCode: 400,
      statusMessage: error.message
    })
  }

  await navigateTo(`/organizations/${organization.slug}/dashboard`)
}
</script>

<template>
  <div class="mx-auto w-full max-w-6xl p-4 sm:p-6">

    <div v-if="!mounted" class="min-h-72 animate-pulse rounded-lg bg-elevated" />

    <UCard v-else :ui="{
      root: 'overflow-hidden',
      header: 'border-b border-default px-6 py-5',
      body: 'p-0',
      footer: 'border-t border-default px-6 py-4'
    }">
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

          <UButton label="Create organization" icon="i-lucide-plus" to="/organizations/create" />
        </div>
      </template>

      <template #default>
        <ClientOnly>
          <UTable :data="organizationRows" :columns="columns">

            <template #actions-cell="{ row }">
              <UButton label="Open dashboard" icon="i-lucide-layout-dashboard" color="primary" variant="soft" size="sm"
                @click="setActiveOrganization(row.original)" />
            </template>


            <template #empty>
              <div class="flex min-h-72 flex-col items-center justify-center gap-4 p-8 text-center">
                <div class="rounded-full bg-elevated p-3">
                  <UIcon name="i-lucide-building-2" class="size-6 text-muted" />
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
                  <UButton label="Create organization" icon="i-lucide-plus" to="/organizations/create" />

                  <UButton label="Join organization" icon="i-lucide-log-in" color="neutral" variant="outline"
                    to="/organizations/join" />
                </div>
              </div>
            </template>
          </UTable>
          <template #fallback>
            <div class="min-h-72 p-8">
              Loading organizations…
            </div>
          </template>
        </ClientOnly>

      </template>



      <template #footer>
        <p class="text-sm text-muted">
          {{ organizationRows.length }}
          {{ organizationRows.length === 1 ? 'organization' : 'organizations' }}
        </p>
      </template>
    </UCard>
  </div>
</template>