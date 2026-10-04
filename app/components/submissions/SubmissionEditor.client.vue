<script setup lang="ts">
import {
  DocumentEditor,
  type IConfig,
} from "@onlyoffice/document-editor-vue";

const props = defineProps<{
  submissionId: string;
}>();

const runtimeConfig = useRuntimeConfig();
const config = shallowRef<IConfig | null>(null);
const errorMessage = ref("");

onMounted(async () => {
  try {
    config.value = await $fetch<IConfig>(
      `/api/submissions/${encodeURIComponent(props.submissionId)}/editor-config`,
    );
  } catch {
    errorMessage.value = "Unable to open this submission.";
  }
});
</script>

<template>
  <div style="height: 85vh">
    <p v-if="errorMessage">{{ errorMessage }}</p>

    <DocumentEditor
      v-else-if="config"
      :id="`submission-editor-${submissionId}`"
      :document-server-url="runtimeConfig.public.onlyofficeUrl"
      :config="config"
    />

    <p v-else>Loading document…</p>
  </div>
</template>