<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const orgId = route.params.slug as string
const mounted = ref(false)
const UBadge = resolveComponent('UBadge')


const {
  data,
  status,
  error: fetchError,
} = await useFetch(`/api/auth/${encodeURIComponent(orgId)}/forms`)

const forms = computed(() => data.value ?? [])

type FormRow = NonNullable<typeof data.value>[number]

const columns: TableColumn<FormRow>[] = [
    {
    accessorKey: 'isOpen',
    header: 'Status',
    cell: ({ row }) => {
        const color = {
        true: 'success' as const,
        false: 'error' as const
      }[row.getValue('isOpen') as string]
        return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('isOpen') ? 'Open' : 'Closed'
        
      )
    }
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  
  {
    accessorKey: 'schedule',
    header: 'Schedule',
    cell: ({ row }) => {
      const openDate = row.original.opensAt
        ? new Date(row.original.opensAt).toLocaleString('en-US', {
            year: 'numeric',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : 'No opening date'

      if (!row.original.closesAt) {
        return `${openDate} - No closing date`
      }

      const closeDate = new Date(row.original.closesAt).toLocaleString('en-US', {
        year: 'numeric',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })

      return `${openDate} - ${closeDate}`
    },
  },
  
  {
    id: 'actions',
    header: '',
    meta: {
      class: {
        th: 'w-0 text-right',
        td: 'text-right',
      },
    },
  },
]
</script>

<template>
    
    <UCard :ui="{
      root: 'overflow-hidden',
      header: 'border-b border-default px-6 py-5',
      body: 'p-0',
      footer: 'border-t border-default px-6 py-4'
    }">
        <UTable :data="forms" :columns="columns" class="flex-1" />
    </UCard>
</template>  