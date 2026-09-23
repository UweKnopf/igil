<script setup lang="ts">
import * as z from 'zod'
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import {
  createFormSchema,
  type CreateFormBody,
} from '~~/shared/zodSchemas/form'

const route = useRoute()
const orgId = route.params.slug as string; //should be public
const loading = ref(false)
const errorMessage = ref("")

const open = ref(false)

type Schema = z.output<typeof createFormSchema>

const state = reactive<Partial<z.input<typeof createFormSchema>>>({
  formTitle: "",
  description: "",
  isOpen: true,
  // string, NOT new Date()
  OpensAt: new Date().toISOString(), // "2025-06-01T10:00:00.000Z"
  ClosesAt: undefined,
  acceptedMimeTypes: ["application/pdf"],
  costumFields: [],
  publicOrgSlug: "",
});

const acceptedMimeTypesInput = ref('application/pdf')
const costumFieldsInput = ref('[]')

const toast = useToast()

function onValidationError(event: FormErrorEvent) {
  console.error('Form validation failed:', event.errors)

  errorMessage.value = event.errors
    .map(error => `${error.name || 'Form'}: ${error.message}`)
    .join('\n')
}

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  errorMessage.value = ''
  loading.value = true
    console.log('Submitting form with payload: %o', payload.data)
  


  try {
    const body: CreateFormBody = {
      ...payload.data,

      acceptedMimeTypes: acceptedMimeTypesInput.value
        .split(',')
        .map(mimeType => mimeType.trim())
        .filter(Boolean),
      costumFields: JSON.parse(costumFieldsInput.value),
    }

    await $fetch(`/api/auth/${encodeURIComponent(orgId)}/form`, {
  method: 'POST',
  body: body,
})
    toast.add({ title: 'Success', description: `New form ${payload.data.formTitle} added`, color: 'success' })
    // You could navigate using the returned organization slug or ID.
    open.value = false
  } catch (error: any) {
    console.error('Error creating form:', error)
    errorMessage.value =
      error?.data?.statusMessage ??
      error?.statusMessage ??
      'Unable to create the organization. Please try again.'
  } finally {
    loading.value = false
    
  }
} 
</script>

<template>
  <UModal v-model:open="open" title="New form" description="Add a new form to the database">
    <UButton label="New Form" icon="i-lucide-plus" />

    <template #body>
      <UForm
        :schema="createFormSchema"
        :state="state"
        novalidate
        class="space-y-4"
        @submit="onSubmit"
        @error="onValidationError"
      >
        <UFormField label="Form Title" placeholder="Enter form title" name="formTitle">
          <UInput v-model="state.formTitle" class="w-full" />
        </UFormField>
        <UFormField label="Description" placeholder="Enter form description" name="description">
          <UInput v-model="state.description" class="w-full" />
        </UFormField>
        <UFormField label="Is Open" name="isOpen">
          <UCheckbox v-model="state.isOpen" />
        </UFormField>
        <UFormField label="Public slug" name="publicOrgSlug">
          <UInput v-model="state.publicOrgSlug" class="w-full" />
        </UFormField>
        
        
        
        
        
       
        <div class="flex justify-end gap-2">
          <p v-if="errorMessage" class="text-sm text-red-500">
  {{ errorMessage }}
</p>

<div class="flex justify-end gap-2">
  <UButton
    label="Cancel"
    type="button"
    color="neutral"
    variant="subtle"
    @click="open = false"
  />

  <UButton
    label="Create"
    color="primary"
    variant="solid"
    type="submit"
    :loading="loading"
  />
</div>
        </div>
      </UForm>
    </template>
  </UModal>
</template>