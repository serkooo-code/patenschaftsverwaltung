export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    'nuxt-auth-utils',
  ],

  i18n: {
    locales: [
      { code: 'tr', language: 'tr-TR', name: 'Türkçe', file: 'tr.json' },
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'tr',
    langDir: 'locales/',
    restructureDir: false,
    strategy: 'no_prefix',
    lazy: true,
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  css: ['~/assets/css/main.css'],

  nitro: {
    experimental: {
      asyncContext: true,
    },
  },

  runtimeConfig: {
    session: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
})
