<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Docs',
    to: '#',
    active: route.path.startsWith('#')
  },
  {
    label: 'Components',
    to: '#',
    active: route.path.startsWith('#')
  },
  {
    label: 'Figma',
    to: 'https://go.nuxt.com/figma-ui',
    target: '_blank'
  },
  {
    label: 'Releases',
    to: 'https://github.com/nuxt/ui/releases',
    target: '_blank'
  }
])
</script>

<template>
  <UHeader>
    <template #title>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />

      
    </template>
  </UHeader>
</template>
