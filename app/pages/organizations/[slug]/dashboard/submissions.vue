<script setup lang="ts">
import SubmissionsTable from '~/components/submissions/SubmissionsTable.vue';
definePageMeta({
  middleware: 'auth',
  layout: 'organization'
})

</script>

<template>
    <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Forms">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        
      </UDashboardNavbar>
    </template>

    <template #body>
      <SubmissionsTable />
    </template>
  </UDashboardPanel>
</template>