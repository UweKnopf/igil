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
  }
})