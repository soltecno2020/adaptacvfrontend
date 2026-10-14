<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { BriefcaseBusiness } from '@lucide/vue'
import { useAuthStore } from './src/stores/authStore'
import { useLocaleStore } from './src/stores/localeStore'
import LanguageSelector from './src/components/navigation/LanguageSelector.vue'
import ThemeToggle from './src/components/navigation/ThemeToggle.vue'

const config = useRuntimeConfig()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { isInitializing } = storeToRefs(authStore)
const googleAnalyticsId = config.public.googleAnalyticsId.trim()
const analyticsAllowed = ref(false)
const showCookieBanner = ref(false)
const showCookiePreferences = ref(false)
const analyticsPreference = ref(false)
const consentStorageKey = 'adaptacv-cookie-consent'
const cookieCopy = computed(() => localeStore.translations.cookies)

useSeoMeta({
  titleTemplate: (title) => title ? `${title} | adaptacv` : 'adaptacv | CVs para oportunidades internacionales',
  ogSiteName: 'adaptacv',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: config.public.siteUrl }],
  script: [
    {
      key: 'structured-data',
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Organization', name: 'adaptaCV', url: config.public.siteUrl },
          { '@type': 'WebSite', name: 'adaptaCV', url: config.public.siteUrl },
        ],
      }),
    },
  ],
})

useHead({
  script: computed(() => analyticsAllowed.value && /^G-[A-Z0-9]+$/i.test(googleAnalyticsId)
    ? [
      { key: 'google-analytics', async: true, src: `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}` },
      {
        key: 'google-analytics-init',
        children: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${googleAnalyticsId}');`,
      },
    ]
    : []),
})

function saveCookieConsent(analytics) {
  analyticsAllowed.value = analytics
  analyticsPreference.value = analytics
  showCookieBanner.value = false
  showCookiePreferences.value = false
  localStorage.setItem(consentStorageKey, JSON.stringify({ analytics, updatedAt: new Date().toISOString() }))
}

function openCookiePreferences() {
  analyticsPreference.value = analyticsAllowed.value
  showCookieBanner.value = true
  showCookiePreferences.value = true
}

onMounted(async () => {
  const savedConsent = localStorage.getItem(consentStorageKey)

  if (savedConsent) {
    try {
      const { analytics } = JSON.parse(savedConsent)
      analyticsAllowed.value = analytics === true
      analyticsPreference.value = analyticsAllowed.value
    } catch {
      showCookieBanner.value = true
    }
  } else {
    showCookieBanner.value = true
  }

  await localeStore.loadLanguages()
  await authStore.initialize()

  const language = localeStore.languages.find((item) => String(item.id) === String(authStore.session?.languageId))
  const languageId = language?.id || authStore.session?.language

  if (languageId) {
    await localeStore.setLocale(languageId, { persistRemote: false })
  }
})
</script>

<template>
  <NuxtPage />
  <button
    v-if="!showCookieBanner"
    class="fixed bottom-4 left-4 z-[90] rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-sm hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
    type="button"
    @click="openCookiePreferences"
  >
    {{ cookieCopy.manage }}
  </button>
  <div
    v-if="showCookieBanner"
    class="fixed inset-0 z-[110] grid place-items-center bg-stone-950/35 p-4 backdrop-blur-sm"
  >
  <section
    class="cookie-consent-modal relative w-full max-w-xl overflow-hidden rounded-lg p-px shadow-xl"
    role="dialog"
    aria-modal="true"
    aria-labelledby="cookie-consent-title"
    aria-live="polite"
  >
    <div class="relative rounded-[7px] bg-white p-5 text-stone-800">
      <div class="flex items-center justify-between gap-4">
        <h2 id="cookie-consent-title" class="text-base font-extrabold">{{ cookieCopy.title }}</h2>
        <div class="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSelector :label="cookieCopy.languageLabel" />
        </div>
      </div>
      <p class="mt-2 text-sm leading-6 text-stone-600">{{ cookieCopy.description }}</p>
      <div v-if="showCookiePreferences" class="mt-4 border-y border-stone-200 py-4">
        <label class="flex cursor-pointer items-start gap-3">
          <input v-model="analyticsPreference" class="mt-1 h-4 w-4 accent-emerald-700" type="checkbox">
          <span>
            <span class="block text-sm font-bold">{{ cookieCopy.analyticsTitle }}</span>
            <span class="block text-xs leading-5 text-stone-600">{{ cookieCopy.analyticsDescription }}</span>
          </span>
        </label>
      </div>
      <div class="mt-5 flex flex-wrap justify-end gap-2">
        <button class="rounded-md border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" type="button" @click="saveCookieConsent(false)">{{ cookieCopy.reject }}</button>
        <button v-if="!showCookiePreferences" class="rounded-md border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" type="button" @click="showCookiePreferences = true">{{ cookieCopy.configure }}</button>
        <button v-else class="rounded-md border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" type="button" @click="saveCookieConsent(analyticsPreference)">{{ cookieCopy.save }}</button>
        <button class="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600" type="button" @click="saveCookieConsent(true)">{{ cookieCopy.acceptAll }}</button>
      </div>
    </div>
  </section>
  </div>
  <Transition name="loading">
    <main v-if="isInitializing" class="fixed inset-0 z-[100] grid place-items-center bg-[#f7f3eb] px-5 text-stone-950">
      <div class="flex flex-col items-center text-center">
        <span class="grid h-14 w-14 place-items-center rounded-lg bg-stone-950 text-white shadow-lg shadow-stone-950/15"><BriefcaseBusiness :size="27" aria-hidden="true" /></span>
        <div class="mt-6 h-1 w-28 overflow-hidden rounded-full bg-stone-200"><span class="block h-full w-1/2 animate-pulse rounded-full bg-coral-500"></span></div>
        <p class="mt-4 text-sm font-bold text-stone-600">Preparando tu espacio</p>
      </div>
    </main>
  </Transition>
</template>

<style>
.loading-enter-active,
.loading-leave-active {
  transition: opacity 500ms ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

.cookie-consent-modal {
  box-shadow: 0 0 0 1px rgb(120 200 189 / 0.45), 0 0 22px rgb(120 200 189 / 0.38), 0 0 38px rgb(242 154 131 / 0.22), 0 20px 25px -5px rgb(11 20 32 / 0.2);
}

.cookie-consent-modal::before {
  position: absolute;
  inset: -60%;
  z-index: 0;
  background: conic-gradient(from 0deg, transparent 0deg, transparent 115deg, #f29a83 145deg, #78c8bd 180deg, transparent 215deg, transparent 360deg);
  animation: cookie-border-glow 5s linear infinite;
  content: '';
}

.theme-dark .cookie-consent-modal > div {
  background: #162331;
}

@keyframes cookie-border-glow {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .cookie-consent-modal::before {
    animation: none;
  }
}
</style>