// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxthub/core', '@sidebase/nuxt-auth'],
  css: ['~/assets/css/main.css'],

  auth: {
    isEnabled: true,
    originEnvKey: 'NUXT_PUBLIC_AUTH_BASE_URL',
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        signUp: { path: '/register', method: 'post' },
        getSession: { path: '/session', method: 'get' }
      },
      token: {
        signInResponseTokenPointer: '/accessToken'
      },
      pages: {
        login: '/login'
      }
    },
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true
    },
    globalAppMiddleware: true
  }
})