<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const activeOrganization = authClient.useActiveOrganization()

const organization = computed(() => activeOrganization.value?.data)

watchEffect(() => {
  // Prevent access to a different organization's dashboard.
  if (
    organization.value?.slug &&
    organization.value.slug !== route.params.slug
  ) {
    navigateTo(`/organizations/${organization.value.slug}/dashboard`, {
      replace: true
    })
  }
})

async function onInvite() {
  const { data, error } = await authClient.organization.inviteMember({
    email: "philippeschu@web.de", // required, The email address of the user to invite.
    role: "member", // required, The role(s) to assign to the user. It can be `admin`, `member`, `owner`
    organizationId: activeOrganization.value.data?.id, // The organization ID to invite the user to. Defaults to the active organization.
    resend: true, // Resend the invitation email, if the user is already invited.
    //teamId: "team-id", // The team ID to invite the user to.
});
}
</script>

<template>
  <div class="p-4 sm:p-6">
    <UCard v-if="organization">
      <template #header>
        <div class="flex items-center gap-3">
          <UAvatar
            :src="organization.logo || undefined"
            :alt="organization.name"
          />

          <UButton
            type="submit"
            size="lg"
            class="text-base justify-center"
            @click="onInvite"
          >
            Submit
          </UButton>
          

          <div>
            <h1 class="text-xl font-semibold">
              {{ organization.name }}
            </h1>
            <p class="text-sm text-muted">
              Organization dashboard
            </p>
          </div>
        </div>
      </template>

      <div class="py-6">
        Dashboard content goes here.
      </div>
    </UCard>
  </div>
</template>