<script setup lang="ts">
import { useManuscriptUpload } from '~/composables/useManuscriptUpload';

const route = useRoute();
const publicId = route.params.publicId as string;

const {
  data,
  status,
  error: fetchError,
} = await useFetch(
  `/api/public/forms/${encodeURIComponent(publicId)}/form`,
);

const form = computed(() => data.value?.form);

const formErrorMessage = computed(() => {
  switch (fetchError.value?.status) {
    case 404:
      return "This submission form could not be found.";
    case 403:
      return "This submission form is closed.";
    default:
      return "Unable to load this submission form. Please try again.";
  }
});

const manuscriptFile = ref<File | null>(null);
const uploadedManuscript = ref<{ uploadId: string } | null>(null);
const localUploadError = ref<string | null>(null);

const {
  isUploading,
  uploadError,
  uploadManuscript,
} = useManuscriptUpload();

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;

  manuscriptFile.value = input.files?.[0] ?? null;
  uploadedManuscript.value = null;
  localUploadError.value = null;
}

async function uploadSelectedFile() {
  if (
    !form.value ||
    !manuscriptFile.value ||
    isUploading.value
  ) {
    return;
  }

  uploadedManuscript.value = null;
  localUploadError.value = null;

  try {
    uploadedManuscript.value = await uploadManuscript(
      publicId,
      manuscriptFile.value,
    );
  } catch {
    localUploadError.value = "Upload failed. Please try again.";
  }
}
</script>

<template>
  <main class="mx-auto max-w-2xl p-6">
    <p v-if="status === 'pending'" role="status">
      Loading submission form…
    </p>

    <div v-else-if="fetchError" role="alert" class="text-red-600">
      {{ formErrorMessage }}
    </div>

    <section v-else-if="form" class="space-y-6">
      <header>
        <h1 class="text-2xl font-bold">
          Submit Manuscript
        </h1>

        <p class="mt-2 text-gray-600">
          Choose your manuscript below to upload it.
        </p>
      </header>

      <form class="space-y-4" @submit.prevent="uploadSelectedFile">
        <div>
          <label
            for="manuscript"
            class="mb-2 block font-medium"
          >
            Manuscript
          </label>

          <input
            id="manuscript"
            type="file"
            accept=".pdf,.docx,.rtf,.txt"
            :disabled="isUploading"
            @change="onFileSelected"
          />
        </div>

        <button
          type="submit"
          class="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          :disabled="!manuscriptFile || isUploading"
        >
          {{ isUploading ? "Uploading…" : "Upload manuscript" }}
        </button>

        <p
          v-if="localUploadError || uploadError"
          role="alert"
          class="text-red-600"
        >
          {{ localUploadError || uploadError }}
        </p>

        <p
          v-if="uploadedManuscript"
          role="status"
          class="text-green-700"
        >
          Manuscript uploaded successfully.
        </p>
      </form>
    </section>

    <p v-else>
      Submission form is unavailable.
    </p>
  </main>
</template>