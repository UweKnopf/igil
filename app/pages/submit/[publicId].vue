<script setup lang="ts">
import { useManuscriptUpload } from '~/composables/useManuscriptUpload';

const route = useRoute();
const publicId = route.params.publicId as string;

const form = async () => {
  const { data } = await useFetch(`/api/public/forms/:publicId/form`);
  return data.value;
};

if (!form) {
  throw new Error("Form not found");
}

const manuscriptFile = ref<File | null>(null);
const uploadedManuscript = ref<{ uploadId: string } | null>(null);

const {
  isUploading,
  uploadError,
  uploadManuscript,
} = useManuscriptUpload();

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  manuscriptFile.value = input.files?.[0] ?? null;
}

async function uploadSelectedFile() {
  if (!manuscriptFile.value) return;

  uploadedManuscript.value = await uploadManuscript(
    publicId,
    manuscriptFile.value,
  );
}
</script>

<template>
  div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Submit Manuscript</h1>
  <div>
    <input
      type="file"
      accept=".pdf,.docx,.rtf,.txt,application/pdf,application/rtf,text/plain"
      @change="onFileSelected"
    />

    <button
      type="button"
      :disabled="!manuscriptFile || isUploading"
      @click="uploadSelectedFile"
    >
      {{ isUploading ? "Uploading…" : "Upload manuscript" }}
    </button>

    <p v-if="uploadError" class="text-red-600">
      {{ uploadError }}
    </p>

    <p v-if="uploadedManuscript">
      Manuscript uploaded successfully.
    </p>
  </div>
</template>