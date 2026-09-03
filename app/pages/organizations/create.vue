<script setup lang="ts">
    import { authClient } from '~~/lib/auth-client'
    import * as z from 'zod'
    import type { FormSubmitEvent } from '@nuxt/ui'

    const errorMessage = ref("")
    const loading = ref(false)

    const metadata = { someKey: "someValue" };
    

    const schema = z.object({
        orgName: z.string('An organization name is required'),
        orgSlug: z
                    .string()
                    .min(1)
                    .max(25)
                    .regex(
                        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                        "Must be a lowercase URL slug (letters, numbers, and single hyphens only)"
                    ),
    })

type Schema = z.output<typeof schema>

    const state = reactive<Partial<Schema>>({
        orgName: undefined,
        orgSlug: undefined,
    })


async function onSubmit(payload: FormSubmitEvent<Schema>) {
  errorMessage.value = ""
  loading.value = true

  try {
    
      const { data, error } = await authClient.organization.create({
        name: payload.data.orgName, // required, The organization name.
        slug: payload.data.orgSlug, // required, The organization slug.
        keepCurrentActiveOrganization: false, // Whether to keep the current active organization active after creating a new one.
    });

      if (error) {
        errorMessage.value = error.message ?? "Unable to sign in."
        return
      }

      await navigateTo("/orgDashboard") //Should be newly created org

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Unexpected error. Please try again."

  }
  finally {
    loading.value = false
  }
} 

</script>

<template>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Name" name="name">
      <UInput v-model="state.orgName" />
    </UFormField>

    <UFormField label="Slug" name="slug">
      <UInput v-model="state.orgSlug" />
    </UFormField>

    <UButton type="submit">
      Submit
    </UButton>
  </UForm>
</template>