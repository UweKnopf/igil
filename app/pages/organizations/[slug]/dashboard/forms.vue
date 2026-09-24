<script setup lang="ts">
import AddFormsModal from '~/components/forms/AddFormsModal.vue';
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

        <template #right>
            <AddFormsModal/>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <FormsTable />
    </template>
  </UDashboardPanel>
</template>