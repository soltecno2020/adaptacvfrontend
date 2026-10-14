<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowRight, BriefcaseBusiness, ChevronRight, Globe2, LogOut, Menu, MessageSquarePlus, Search, X } from '@lucide/vue'
import LanguageSelector from '../../components/navigation/LanguageSelector.vue'
import ThemeToggle from '../../components/navigation/ThemeToggle.vue'
import { useAuthStore } from '../../stores/authStore'
import { useLocaleStore } from '../../stores/localeStore'

const localeStore = useLocaleStore()
const authStore = useAuthStore()
const wikiCopy = computed(() => localeStore.translations.wikimigration)
const accountInitial = computed(() => (authStore.session?.name || authStore.session?.email || '?').charAt(0).toUpperCase())
const query = ref('')
const countries = ref([])
const isLoading = ref(true)
const loadError = ref('')
const isMobileMenuOpen = ref(false)

function getGuide(country) {
  return {
    id: country.id,
    name: country.name,
    flag: `https://flagcdn.com/w80/${country.iso_code?.toLowerCase()}.png`,
    language: wikiCopy.value.initialGuide,
    region: wikiCopy.value.internationalDestination,
    priority: wikiCopy.value.initialGuide,
    permit: 'Verificar con fuentes oficiales',
    currency: 'Consultar moneda local',
    overview: wikiCopy.value.initialOverview,
    cv: 'Adapta tu CV al idioma, formato y requisitos de la oferta laboral.',
    work: 'Consulta los requisitos de visado, residencia y permiso de trabajo directamente con fuentes oficiales.',
    tips: ['Revisa los requisitos oficiales vigentes.', 'Adapta tu CV a cada oferta laboral.', 'Verifica las condiciones de trabajo antes de postular.'],
    sources: ['Autoridad migratoria y laboral oficial'],
    isFeatured: false,
  }
}

const destinations = computed(() => countries.value.map(getGuide))
const filteredDestinations = computed(() => destinations.value.filter((destination) => {
  const normalizedQuery = query.value.trim().toLowerCase()
  const matchesQuery = !normalizedQuery || [destination.name, destination.language, destination.region, destination.priority].join(' ').toLowerCase().includes(normalizedQuery)
  return matchesQuery
}))

async function loadDestinations() {
  isLoading.value = true
  loadError.value = ''
  try {
    const { public: { apiBaseUrl } } = useRuntimeConfig()
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/v1/destination-countries`, { headers: { Accept: 'application/json' } })
    if (!response?.success) throw new Error(response?.message || wikiCopy.value.listLoadFailed)
    countries.value = response.data?.countries || []
  } catch (error) {
    loadError.value = error.data?.message || error.message || wikiCopy.value.listLoadFailed
  } finally {
    isLoading.value = false
  }
}

function destinationPath(destination) {
  const slug = destination.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `/wikimigration/${slug}`
}

async function logout() {
  await authStore.logout()
  navigateTo('/')
}

onMounted(loadDestinations)
</script>

<template>
  <main class="wikimigration-page min-h-screen bg-[#f7f3eb] text-stone-950">
    <header class="wikimigration-header sticky top-0 z-40 h-16 border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:h-20 sm:px-8">
      <nav class="mx-auto flex h-full max-w-7xl items-center justify-between gap-3">
        <RouterLink to="/" class="flex shrink-0 items-center gap-2.5 text-lg font-black text-stone-950"><span class="grid h-9 w-9 place-items-center rounded-lg bg-stone-950 text-white"><BriefcaseBusiness :size="19" /></span><span>adaptacv<span class="text-coral-500">.</span></span></RouterLink>
        <div class="hidden items-center gap-5 sm:flex"><RouterLink to="/" class="text-sm font-bold text-stone-600 hover:text-emerald-900">{{ wikiCopy.home }}</RouterLink><RouterLink to="/wikimigration" class="text-sm font-extrabold text-emerald-900">Wikimigration</RouterLink><ThemeToggle /><LanguageSelector :label="wikiCopy.home" /><RouterLink v-if="authStore.isAuthenticated" to="/profile" class="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-emerald-900 text-sm font-black text-white ring-2 ring-emerald-100" :aria-label="localeStore.translations.workspace.profile" :title="localeStore.translations.workspace.profile"><img v-if="authStore.session?.photoUrl" :src="authStore.session.photoUrl" :alt="authStore.session.name || localeStore.translations.workspace.profile" class="h-full w-full object-cover" /><span v-else>{{ accountInitial }}</span></RouterLink><button v-if="authStore.isAuthenticated" type="button" class="grid h-10 w-10 place-items-center rounded-md text-stone-600 hover:bg-stone-100 hover:text-emerald-900" :aria-label="localeStore.translations.nav.logout" :title="localeStore.translations.nav.logout" @click="logout"><LogOut :size="17" /></button></div>
        <div class="flex items-center gap-1 sm:hidden"><ThemeToggle /><button type="button" class="grid h-10 w-10 place-items-center rounded-md text-stone-600 hover:bg-stone-100 hover:text-emerald-900" :aria-label="localeStore.translations.nav.openMenu" :title="localeStore.translations.nav.openMenu" :aria-expanded="isMobileMenuOpen" @click="isMobileMenuOpen = !isMobileMenuOpen"><X v-if="isMobileMenuOpen" :size="20" /><Menu v-else :size="20" /></button></div>
      </nav>
      <div v-if="isMobileMenuOpen" class="absolute inset-x-0 top-full border-b border-stone-200 bg-white px-4 py-3 shadow-xl sm:hidden"><nav class="mx-auto grid max-w-7xl gap-1"><RouterLink to="/" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">{{ wikiCopy.home }}</RouterLink><RouterLink to="/wikimigration" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">Wikimigration</RouterLink><RouterLink v-if="authStore.isAuthenticated" to="/profile" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">{{ localeStore.translations.workspace.profile }}</RouterLink><button v-if="authStore.isAuthenticated" type="button" class="flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="logout"><LogOut :size="17" />{{ localeStore.translations.nav.logout }}</button><div class="border-t border-stone-200 px-3 pt-3"><LanguageSelector :label="wikiCopy.home" /></div></nav></div>
    </header>

    <section class="border-b border-stone-200 bg-emerald-950 px-4 py-12 text-white sm:px-8 sm:py-16">
      <div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div><p class="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-200"><Globe2 :size="15" /> {{ wikiCopy.community }}</p><h1 class="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">Wikimigration</h1><p class="mt-5 max-w-2xl text-base leading-7 text-emerald-100 sm:text-lg">{{ wikiCopy.tagline }}</p></div>
        <div class="border-l-2 border-coral-500 pl-5 text-sm leading-6 text-emerald-100"><strong class="block text-base text-white">{{ wikiCopy.communityGuide }}</strong> {{ wikiCopy.officialNotice }}</div>
      </div>
    </section>

    <section class="px-4 py-8 sm:px-8" aria-label="Filtros de destinos">
      <div class="mx-auto max-w-7xl"><div class="border-l-2 border-coral-500 bg-white px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-6"><div class="flex items-start gap-3"><MessageSquarePlus :size="20" class="mt-0.5 shrink-0 text-coral-500" /><p class="text-sm leading-6 text-stone-700"><strong>{{ wikiCopy.building }}</strong> {{ wikiCopy.buildingText }}</p></div><span class="mt-2 inline-block shrink-0 text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800 sm:mt-0">{{ wikiCopy.communityAdaptacv }}</span></div><div class="mt-6 border-b border-stone-200 pb-6"><label class="relative block w-full max-w-xl"><Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" /><input v-model="query" type="search" :placeholder="wikiCopy.search" class="w-full rounded-md border border-stone-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label></div>
        <div class="mt-6 grid gap-4 md:grid-cols-3"><RouterLink v-for="destination in filteredDestinations" :key="destination.id" :to="destinationPath(destination)" class="group relative border border-stone-300 bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-700 hover:shadow-lg"><div class="flex items-start justify-between gap-3"><img :src="destination.flag" :alt="destination.name" class="h-7 w-9 object-cover shadow-sm" /><span class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ destination.priority }}</span></div><h2 class="mt-5 text-2xl font-black">{{ destination.name }}</h2><p class="mt-2 text-sm font-semibold text-stone-500">{{ destination.region }}</p><p class="mt-4 text-sm leading-6 text-stone-600">{{ destination.overview }}</p><span class="mt-5 inline-flex items-center gap-1 text-sm font-extrabold text-emerald-800">{{ wikiCopy.viewGuide }} <ChevronRight :size="17" /></span></RouterLink></div>
        <p v-if="isLoading" class="py-12 text-center text-sm font-semibold text-stone-600">{{ wikiCopy.loading }}</p>
        <div v-else-if="loadError" class="mt-6 border-l-2 border-coral-500 bg-coral-50 p-5 text-sm font-semibold text-stone-700"><p>{{ loadError }}</p><button type="button" class="mt-3 font-extrabold text-emerald-800 hover:text-emerald-950" @click="loadDestinations">{{ wikiCopy.retry }}</button></div>
        <p v-if="!filteredDestinations.length" class="py-12 text-center text-sm font-semibold text-stone-600">{{ wikiCopy.noResults }}</p>
      </div>
    </section>

    <section class="px-4 py-12 sm:px-8"><div class="mx-auto flex max-w-7xl flex-col gap-6 border-t-2 border-emerald-800 pt-8 md:flex-row md:items-end md:justify-between"><div><p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">{{ wikiCopy.nextStep }}</p><h2 class="mt-2 max-w-xl text-3xl font-black">{{ wikiCopy.readyCv }}</h2></div><RouterLink to="/editor" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-900 px-5 py-3.5 text-sm font-extrabold text-white hover:bg-emerald-800">{{ wikiCopy.createCv }} <ArrowRight :size="18" /></RouterLink></div></section>
  </main>
</template>