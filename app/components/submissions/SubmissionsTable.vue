<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const route = useRoute()
const orgId = route.params.slug as string


const {
  data,
  //status,
  //error: fetchError,
} = await useFetch(`/api/auth/${encodeURIComponent(orgId)}/submissions`)

const submissions = computed(() => data.value ?? [])

type SubmissionRow = NonNullable<typeof data.value>[number]

const columns: TableColumn<SubmissionRow>[] = [
    {
    accessorKey: 'submitterName',
    header: 'Name',
    cell: ({ row }) => {
        const name = row.getValue('submitterName') as string
        return name
        
      
    }
  },
    {
        accessorKey: 'submitterEmail',
        header: 'Email',
    },
    {
        accessorKey: 'status',
        header: 'Status',},
  
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
        <UTable :data="submissions" :columns="columns" class="flex-1" />
    </UCard>
</template>  