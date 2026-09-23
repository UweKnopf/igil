import { S3Client } from "@aws-sdk/client-s3";

export function getS3Client() {
  const config = useRuntimeConfig();

  if (
    !config.s3Endpoint ||
    !config.s3AccessKeyId ||
    !config.s3SecretAccessKey ||
    !config.s3SubmissionsBucket
  ) {
    throw new Error("S3 storage configuration is incomplete");
  }

  return new S3Client({
    endpoint: config.s3Endpoint,
    region: config.s3Region ?? "us-east-1",

    // Normally needed for MinIO:
    // https://minio.example.com/bucket-name/object-key
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",


    credentials: {
      accessKeyId: config.s3AccessKeyId,
      secretAccessKey: config.s3SecretAccessKey,
    },
  });
}