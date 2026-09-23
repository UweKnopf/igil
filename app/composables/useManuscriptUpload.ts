// composables/useManuscriptUpload.ts
type UploadPermissionResponse = {
  uploadId: string;
  uploadUrl: string;
  expiresAt: string;
  headers: {
    "Content-Type": string;
  };
};

export function useManuscriptUpload() {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const uploadError = ref<string | null>(null);

  async function uploadManuscript(publicId: string, file: File) {
    isUploading.value = true;
    uploadProgress.value = 0;
    uploadError.value = null;

    try {
      // Step 1: Ask your Nuxt server for a signed upload URL.
      const permission = await $fetch<UploadPermissionResponse>(
        `/api/public/forms/${encodeURIComponent(publicId)}/uploads`,
        {
          method: "POST",
          body: {
            filename: file.name,
            contentType: file.type,
            sizeBytes: file.size,
          },
        },
      );

      if (!permission) {
        throw new Error(`No permission received for file upload`);
      }

      console.log("Received upload permission: %o", permission);

      // Step 2: Upload raw bytes directly to MinIO.
      // Use native fetch, NOT $fetch, because we do not want JSON behavior.
      const response = await fetch(permission.uploadUrl, {
        method: "PUT",
        headers: permission.headers,
        body: file,
      });

      if (!response.ok) {
        const responseBody = await response.text();

        // Temporary diagnostic logging; do not log the presigned URL.
        console.error("SeaweedFS upload failed", {
          status: response.status,
          responseBody,
        });

        throw new Error(`File upload failed (${response.status})`);
      }

      uploadProgress.value = 100;

      // Save this ID and include it in the final form-submission request.
      return {
        uploadId: permission.uploadId,
        filename: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
      };
    } catch (error) {
      uploadError.value =
        error instanceof Error ? error.message : "Unable to upload manuscript";
      throw error;
    } finally {
      isUploading.value = false;
    }
  }

  return {
    isUploading,
    uploadProgress,
    uploadError,
    uploadManuscript,
  };
}