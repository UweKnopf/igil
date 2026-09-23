// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxthub/core',
    '@nuxtjs/seo',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@nuxt/devtools',
    '@nuxt/eslint',
    'nuxt-lettermint'
  ],
  css: ['~/assets/css/main.css'],
  hub: {
    //Config options for hub
  },
  runtimeConfig: {
    databaseUrl: process.env.POSTGRESS_TEST_URL,
    s3Endpoint: process.env.S3_ENDPOINT,
    s3Region: process.env.S3_REGION ?? "us-east-1",
    s3AccessKeyId: process.env.S3_ACCESS_KEY,
    s3SecretAccessKey: process.env.S3_SECRET_KEY,
    s3SubmissionsBucket: process.env.S3_BUCKET,
  }
})