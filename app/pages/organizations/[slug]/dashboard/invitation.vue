<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

definePageMeta({
  middleware: 'auth',
  layout: 'organization'
})

const { organization } = useDashboardOrganization()

const email = ref('')
const role = ref<'member' | 'admin'>('member')
const resend = ref(false)
const sending = ref(false)

const errorMessage = ref('')
const successMessage = ref('')

const roles = [
  { label: 'Member', value: 'member' },
  { label: 'Admin', value: 'admin' }
]

async function onInvite() {
  errorMessage.value = ''
  successMessage.value = ''

  const organizationId = organization.value?.id
  const invitedEmail = email.value.trim()

  if (!organizationId || !invitedEmail || sending.value) {
    return
  }

  sending.value = true

  try {
    const { error } = await authClient.organization.inviteMember({
      email: invitedEmail,
      role: role.value,
      organizationId,
      resend: resend.value
    })

    if (error) {
      errorMessage.value = error.message || 'Could not send invitation.'
      return
    }

    successMessage.value = `Invitation created for ${invitedEmail}.`
    email.value = ''
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Something went wrong. Please try again.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-2xl font-semibold">
        Invitations
      </h1>

      <p class="mt-1 text-muted">
        Invite someone to join your organization.
      </p>
    </header>

    <UCard class="max-w-xl">
      <template #header>
        <h2 class="font-semibold">
          Invite a member
        </h2>
      </template>

      <form class="space-y-5" @submit.prevent="onInvite">
        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          title="Invitation failed"
          :description="errorMessage"
        />

        <UAlert
          v-if="successMessage"
          color="success"
          variant="soft"
          title="Invitation created"
          :description="successMessage"
        />

        <UFormField label="Email address" name="email" required>
          <UInput
            v-model="email"
            type="email"
            placeholder="colleague@example.com"
            autocomplete="email"
            class="w-full"
            :disabled="sending"
            required
          />
        </UFormField>

        <UFormField label="Role" name="role">
          <USelect
            v-model="role"
            :items="roles"
            class="w-full"
            :disabled="sending"
          />
        </UFormField>

        <UCheckbox
          v-model="resend"
          label="Resend if this person is already invited"
          :disabled="sending"
        />

        <UButton
          type="submit"
          icon="i-lucide-mail-plus"
          :loading="sending"
          :disabled="!organization || !email.trim()"
        >
          Send invitation
        </UButton>
      </form>
    </UCard>
  </div>
</template>