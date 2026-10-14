<script setup>
import { computed, ref } from 'vue'
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CheckCircle2, FileText, Globe2, Languages, List, LogOut, Menu, MessageSquarePlus, ShieldCheck, X } from '@lucide/vue'
import LanguageSelector from '../../src/components/navigation/LanguageSelector.vue'
import ThemeToggle from '../../src/components/navigation/ThemeToggle.vue'
import { useAuthStore } from '../../src/stores/authStore'
import { useLocaleStore } from '../../src/stores/localeStore'

const route = useRoute()
const config = useRuntimeConfig()
const localeStore = useLocaleStore()
const authStore = useAuthStore()
const wikiCopy = computed(() => localeStore.translations.wikimigration)
const accountInitial = computed(() => (authStore.session?.name || authStore.session?.email || '?').charAt(0).toUpperCase())

function slugify(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const { data: country, error } = await useAsyncData(`destination-${route.params.slug}`, async () => {
  const response = await $fetch(`${config.public.apiBaseUrl.replace(/\/$/, '')}/v1/destination-countries`, { headers: { Accept: 'application/json' } })
  if (!response?.success) throw createError({ statusCode: 502, statusMessage: wikiCopy.value.loadFailed })
  const destination = (response.data?.countries || []).find((item) => slugify(item.name) === route.params.slug)
  if (!destination) throw createError({ statusCode: 404, statusMessage: wikiCopy.value.notFound })
  return destination
})

if (error.value) throw error.value

const destination = computed(() => country.value)
const flagUrl = computed(() => `https://flagcdn.com/w160/${destination.value.iso_code?.toLowerCase()}.png`)
const sections = computed(() => [
  { id: 'overview', label: wikiCopy.value.sections.overview },
  { id: 'cv', label: wikiCopy.value.sections.cv },
  { id: 'work', label: wikiCopy.value.sections.work },
  { id: 'checklist', label: wikiCopy.value.sections.checklist },
])
const contributionSection = ref('')
const isMobileMenuOpen = ref(false)

function openContribution(section) {
  contributionSection.value = section
}

async function logout() {
  await authStore.logout()
  navigateTo('/')
}

useSeoMeta({
  title: () => `Guía para trabajar en ${destination.value.name}`,
  description: () => `Guía práctica para preparar tu CV, búsqueda laboral y documentación para trabajar en ${destination.value.name}.`,
  ogTitle: () => `Guía laboral: ${destination.value.name} | adaptacv`,
  ogDescription: () => `Prepara tu CV y organiza tu búsqueda laboral internacional para ${destination.value.name}.`,
})
</script>

<template>
  <main class="wikimigration-page min-h-screen bg-[#f7f3eb] text-stone-950">
    <header class="wikimigration-header sticky top-0 z-40 h-16 border-b border-stone-200 bg-white/95 px-4 backdrop-blur sm:h-20 sm:px-8">
      <nav class="mx-auto flex h-full max-w-7xl items-center justify-between gap-3">
        <RouterLink to="/" class="flex shrink-0 items-center gap-2.5 text-lg font-black text-stone-950"><span class="grid h-9 w-9 place-items-center rounded-lg bg-stone-950 text-white"><BriefcaseBusiness :size="19" /></span><span>adaptacv<span class="text-coral-500">.</span></span></RouterLink>
        <div class="hidden items-center gap-5 sm:flex"><RouterLink to="/" class="text-sm font-bold text-stone-600 hover:text-emerald-900">{{ wikiCopy.home }}</RouterLink><RouterLink to="/wikimigration" class="text-sm font-extrabold text-emerald-900">Wikimigration</RouterLink><ThemeToggle /><LanguageSelector :label="wikiCopy.home" /><RouterLink v-if="authStore.isAuthenticated" to="/profile" class="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-emerald-900 text-sm font-black text-white ring-2 ring-emerald-100" :aria-label="localeStore.translations.workspace.profile" :title="localeStore.translations.workspace.profile"><img v-if="authStore.session?.photoUrl" :src="authStore.session.photoUrl" :alt="authStore.session.name || localeStore.translations.workspace.profile" class="h-full w-full object-cover" /><span v-else>{{ accountInitial }}</span></RouterLink><button v-if="authStore.isAuthenticated" type="button" class="grid h-10 w-10 place-items-center rounded-md text-stone-600 hover:bg-stone-100 hover:text-emerald-900" :aria-label="localeStore.translations.nav.logout" :title="localeStore.translations.nav.logout" @click="logout"><LogOut :size="17" /></button></div><div class="flex items-center gap-1 sm:hidden"><ThemeToggle /><button type="button" class="grid h-10 w-10 place-items-center rounded-md text-stone-600 hover:bg-stone-100 hover:text-emerald-900" :aria-label="localeStore.translations.nav.openMenu" :title="localeStore.translations.nav.openMenu" :aria-expanded="isMobileMenuOpen" @click="isMobileMenuOpen = !isMobileMenuOpen"><X v-if="isMobileMenuOpen" :size="20" /><Menu v-else :size="20" /></button></div>
      </nav>
      <div v-if="isMobileMenuOpen" class="absolute inset-x-0 top-full border-b border-stone-200 bg-white px-4 py-3 shadow-xl sm:hidden"><nav class="mx-auto grid max-w-7xl gap-1"><RouterLink to="/" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">{{ wikiCopy.home }}</RouterLink><RouterLink to="/wikimigration" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">Wikimigration</RouterLink><RouterLink v-if="authStore.isAuthenticated" to="/profile" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">{{ localeStore.translations.workspace.profile }}</RouterLink><button v-if="authStore.isAuthenticated" type="button" class="flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="logout"><LogOut :size="17" />{{ localeStore.translations.nav.logout }}</button><div class="border-t border-stone-200 px-3 pt-3"><LanguageSelector :label="wikiCopy.home" /></div></nav></div>
    </header>

    <section class="border-b border-stone-200 bg-white px-4 py-6 sm:px-8">
      <div class="mx-auto max-w-7xl"><div class="grid gap-6 md:grid-cols-[auto_1fr] md:items-center"><img :src="flagUrl" :alt="destination.name" class="h-14 w-20 object-cover shadow-md sm:h-16 sm:w-24" /><div><p class="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">{{ wikiCopy.guide }}</p><h1 class="mt-2 text-4xl font-black sm:text-5xl">{{ wikiCopy.workIn.replace('{name}', destination.name) }}</h1><p class="mt-3 max-w-2xl text-base leading-7 text-stone-600">{{ wikiCopy.guideIntro }}</p></div></div></div>
    </section>

    <nav class="wikimigration-subnav sticky top-16 z-30 overflow-x-auto border-b border-stone-200 bg-[#f7f3eb]/95 px-4 py-3 backdrop-blur sm:top-20 sm:px-8" :aria-label="wikiCopy.guide"><div class="mx-auto flex min-w-max max-w-7xl items-center gap-1"><RouterLink to="/wikimigration" class="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 bg-white px-2.5 text-sm font-extrabold text-emerald-800 hover:border-emerald-800 hover:bg-emerald-50"><ArrowLeft :size="17" /><span class="hidden sm:inline">{{ wikiCopy.back }}</span><span class="sr-only sm:hidden">{{ wikiCopy.backToWiki }}</span></RouterLink><span class="mx-1 h-6 border-l border-stone-300"></span><List :size="17" class="mr-1 text-emerald-800" /><a v-for="section in sections" :key="section.id" :href="`#${section.id}`" class="rounded-md px-3 py-2 text-sm font-bold text-stone-600 hover:bg-emerald-50 hover:text-emerald-900">{{ section.label }}</a></div></nav>

    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14"><div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <article class="min-w-0 space-y-14">
        <section id="overview" class="scroll-mt-32"><div class="flex items-start justify-between gap-4"><div><p class="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">01 · {{ wikiCopy.sections.overview }}</p><h2 class="mt-3 text-3xl font-black">{{ wikiCopy.beforeStart }}</h2></div><button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-stone-300 text-emerald-800 hover:border-emerald-800 hover:bg-emerald-50" :title="wikiCopy.contribute" :aria-label="wikiCopy.contribute" @click="openContribution(wikiCopy.sections.overview)"><MessageSquarePlus :size="19" /></button></div><p class="mt-4 max-w-3xl text-base leading-8 text-stone-600">{{ wikiCopy.beforeStartText }}</p><div class="mt-7 grid gap-3 sm:grid-cols-2"><div class="border-l-2 border-emerald-700 bg-white p-5"><p class="text-sm font-extrabold">{{ wikiCopy.jobOffer }}</p><p class="mt-2 text-sm leading-6 text-stone-600">{{ wikiCopy.jobOfferText }}</p></div><div class="border-l-2 border-coral-500 bg-white p-5"><p class="text-sm font-extrabold">{{ wikiCopy.officialSources }}</p><p class="mt-2 text-sm leading-6 text-stone-600">{{ wikiCopy.officialSourcesText }}</p></div></div></section>
        <section id="cv" class="scroll-mt-32 border-t border-stone-200 pt-10"><div class="flex items-start justify-between gap-4"><div class="flex gap-4"><FileText :size="24" class="mt-1 shrink-0 text-coral-500" /><div><p class="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">02 · {{ wikiCopy.sections.cv }}</p><h2 class="mt-3 text-3xl font-black">{{ wikiCopy.cvSearch }}</h2></div></div><button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-stone-300 text-emerald-800 hover:border-emerald-800 hover:bg-emerald-50" :title="wikiCopy.contribute" :aria-label="wikiCopy.contribute" @click="openContribution(wikiCopy.cvSearch)"><MessageSquarePlus :size="19" /></button></div><p class="mt-4 max-w-3xl text-base leading-8 text-stone-600">{{ wikiCopy.cvSearchText }}</p><ul class="mt-6 space-y-3"><li v-for="item in wikiCopy.cvTips" :key="item" class="flex gap-3 text-sm leading-6 text-stone-700"><CheckCircle2 :size="18" class="mt-0.5 shrink-0 text-emerald-700" />{{ item }}</li></ul></section>
        <section id="work" class="scroll-mt-32 border-t border-stone-200 pt-10"><div class="flex items-start justify-between gap-4"><div class="flex gap-4"><ShieldCheck :size="24" class="mt-1 shrink-0 text-coral-500" /><div><p class="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">03 · {{ wikiCopy.sections.work }}</p><h2 class="mt-3 text-3xl font-black">{{ wikiCopy.permits }}</h2></div></div><button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-stone-300 text-emerald-800 hover:border-emerald-800 hover:bg-emerald-50" :title="wikiCopy.contribute" :aria-label="wikiCopy.contribute" @click="openContribution(wikiCopy.permits)"><MessageSquarePlus :size="19" /></button></div><p class="mt-4 max-w-3xl text-base leading-8 text-stone-600">{{ wikiCopy.permitsText }}</p><p class="mt-6 border-l-2 border-emerald-700 bg-emerald-50 p-5 text-sm font-semibold leading-6 text-emerald-950">{{ wikiCopy.permitsNotice }}</p></section>
        <section id="checklist" class="scroll-mt-32 border-t border-stone-200 pt-10"><div class="flex items-start justify-between gap-4"><div class="flex gap-4"><Languages :size="24" class="mt-1 shrink-0 text-coral-500" /><div><p class="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">04 · {{ wikiCopy.sections.checklist }}</p><h2 class="mt-3 text-3xl font-black">{{ wikiCopy.checklistTitle }}</h2></div></div><button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-stone-300 text-emerald-800 hover:border-emerald-800 hover:bg-emerald-50" :title="wikiCopy.contribute" :aria-label="wikiCopy.contribute" @click="openContribution(wikiCopy.checklistTitle)"><MessageSquarePlus :size="19" /></button></div><ol class="mt-6 grid gap-3 sm:grid-cols-2"><li v-for="(item, index) in wikiCopy.checklistItems" :key="item" class="flex gap-3 border border-stone-200 bg-white p-4 text-sm font-semibold text-stone-700"><span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-900">{{ index + 1 }}</span>{{ item }}</li></ol></section>
      </article>
      <aside class="h-fit border-t-2 border-emerald-800 bg-white p-5 lg:sticky lg:top-32"><p class="text-sm font-extrabold">{{ wikiCopy.prepareCv }}</p><p class="mt-2 text-sm leading-6 text-stone-600">{{ wikiCopy.prepareCvText }}</p><RouterLink to="/editor" class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-800">{{ wikiCopy.goToEditor }} <ArrowRight :size="17" /></RouterLink></aside>
    </div></div>
    <div v-if="contributionSection" class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="contribution-title" @click.self="contributionSection = ''"><section class="relative w-full max-w-sm border-t-2 border-emerald-800 bg-white p-6 shadow-2xl"><button type="button" class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-md text-stone-500 hover:bg-stone-100" :aria-label="wikiCopy.close" :title="wikiCopy.close" @click="contributionSection = ''"><X :size="19" /></button><MessageSquarePlus :size="25" class="text-coral-500" /><h2 id="contribution-title" class="mt-4 text-xl font-black">{{ wikiCopy.contributeTo.replace('{section}', contributionSection) }}</h2><p class="mt-3 text-sm leading-6 text-stone-600">{{ wikiCopy.contributionBuilding }}</p><button type="button" class="mt-6 w-full rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-800" @click="contributionSection = ''">{{ wikiCopy.understood }}</button></section></div>
  </main>
</template>