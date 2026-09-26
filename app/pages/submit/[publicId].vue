<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { useManuscriptUpload } from '~/composables/useManuscriptUpload'
import { FormSchema, type FormBody } from '~~/shared/zodSchemas/form'

const route = useRoute()
const publicId = route.params.publicId as string

const {
  data,
  status,
  error: fetchError,
} = await useFetch(
  `/api/public/forms/${encodeURIComponent(publicId)}/form`,
)

const form = computed(() => data.value?.form)

const formErrorMessage = computed(() => {
  switch (fetchError.value?.status) {
    case 404:
      return 'This submission form could not be found.'
    case 403:
      return 'This submission form is closed.'
    default:
      return 'Unable to load this submission form. Please try again.'
  }
})

const state = reactive<FormBody>({
  submittedAuthorEmail: '',
  submittedAuthorAuthorName: '',
})

const manuscriptFile = ref<File>()
const uploadedManuscript = ref<{ uploadId: string } | null>(null)

const manuscriptError = ref<string>()
const submissionError = ref<string>()
const isSubmitting = ref(false)
const isSubmitted = ref(false)

const {
  isUploading,
  uploadManuscript,
} = useManuscriptUpload()

const isBusy = computed(() => isSubmitting.value || isUploading.value)

const submitLabel = computed(() => {
  if (isUploading.value) return 'Uploading manuscript…'
  if (isSubmitting.value) return 'Submitting…'
  return 'Submit manuscript'
})

// A different file requires a new upload.
watch(manuscriptFile, () => {
  uploadedManuscript.value = null
  manuscriptError.value = undefined
  submissionError.value = undefined
})

async function submitForm(payload: FormSubmitEvent<FormBody>) {
  if (isBusy.value || isSubmitted.value || !form.value) return

  manuscriptError.value = undefined
  submissionError.value = undefined

  const file = manuscriptFile.value

  if (!file) {
    manuscriptError.value = 'Please select a manuscript.'
    return
  }

  isSubmitting.value = true

  try {
    // Reuse the upload if a previous submission attempt failed.
    if (!uploadedManuscript.value) {
      try {
        uploadedManuscript.value = await uploadManuscript(publicId, file)
      } catch {
        manuscriptError.value = 'Upload failed. Please try again.'
        return
      }
    }

    await $fetch(
      `/api/public/forms/${encodeURIComponent(publicId)}/submissions`,
      {
        method: 'POST',
        body: {
          email: payload.data.submittedAuthorEmail,
          name: payload.data.submittedAuthorAuthorName,
          uploadId: uploadedManuscript.value.uploadId,
        },
      },
    )

    isSubmitted.value = true
  } catch {
    submissionError.value = 'Submission failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-2xl p-6">
    <div
      v-if="status === 'pending'"
      role="status"
      class="space-y-4"
    >
      <span class="sr-only">Loading submission form…</span>
      <USkeleton class="h-8 w-64" />
      <USkeleton class="h-64 w-full" />
    </div>

    <UAlert
      v-else-if="fetchError"
      color="error"
      variant="soft"
      title="Unable to load form"
      :description="formErrorMessage"
      role="alert"
    />

    <UCard v-else-if="form">
      <template #header>
        <h1 class="text-2xl font-bold">
          Submit manuscript
        </h1>

        <p class="mt-2 text-muted">
          Enter your details and attach your manuscript.
        </p>
      </template>

      <UAlert
        v-if="isSubmitted"
        color="success"
        variant="soft"
        title="Submission received"
        description="Your manuscript has been submitted successfully."
        role="status"
      />

      <UForm
        v-else
        :schema="FormSchema"
        :state="state"
        :disabled="isBusy"
        :aria-busy="isBusy"
        class="space-y-5"
        @submit="submitForm"
      >
        <UFormField
          label="Email"
          name="submittedAuthorEmail"
          required
        >
          <UInput
            v-model="state.submittedAuthorEmail"
            type="email"
            autocomplete="email"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Author name"
          name="submittedAuthorAuthorName"
          required
        >
          <UInput
            v-model="state.submittedAuthorAuthorName"
            autocomplete="name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Manuscript"
          name="manuscript"
          :error="manuscriptError"
          required
        >
          <UFileUpload
            v-model="manuscriptFile"
            accept=".pdf,.docx,.rtf,.txt"
            :disabled="isBusy"
            label="Drop your manuscript here"
            description="PDF, DOCX, RTF or TXT"
            class="w-full min-h-40"
          />
        </UFormField>

        <UAlert
          v-if="submissionError"
          color="error"
          variant="soft"
          title="Unable to submit"
          :description="submissionError"
          role="alert"
        />

        <UButton
          type="submit"
          :loading="isBusy"
          :disabled="isBusy"
        >
          {{ submitLabel }}
        </UButton>
      </UForm>
    </UCard>

    <UAlert
      v-else
      color="warning"
      variant="soft"
      title="Submission form is unavailable"
    />
  </main>
</template>