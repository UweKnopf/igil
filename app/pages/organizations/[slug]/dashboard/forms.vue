<script setup lang="ts">
import AddFormsModal from '~/components/forms/AddFormsModal.vue';

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
      <Placeholder class="h-full" />
    </template>
  </UDashboardPanel>
</template>