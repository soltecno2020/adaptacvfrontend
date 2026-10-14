<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Eye, FilePlus2, FolderKanban, LayoutTemplate, Plus, Sparkles, Trash2, UtensilsCrossed, X } from '@lucide/vue'
import WorkspaceNav from '../../components/navigation/WorkspaceNav.vue'
import { getPortfolioEditorMessages } from '../../config/portfolioEditorLocales'
import { useLocaleStore } from '../../stores/localeStore'
import { usePortfolioStore } from '../../stores/portfolioStore'
import { localizePortfolioTemplate } from '../../utils/portfolioTemplateLocalization'

const templates = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    previewUrl: '/portfolio-templates/minimalist/code.html',
    available: true,
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    previewUrl: '/portfolio-templates/futuristic/code.html',
    available: false,
  },
  {
    id: 'chef',
    name: 'Chef Style',
    previewUrl: '/portfolio-templates/chef/code.html',
    available: false,
  },
  {
    id: 'babysitter-housekeeping',
    name: 'Babysitter & Housekeeping',
    previewUrl: '/portfolio-templates/babysitter-housekeeping/code.html',
    available: true,
  },
]

const portfolioStore = usePortfolioStore()
const localeStore = useLocaleStore()
const { portfolios } = storeToRefs(portfolioStore)
const isCreateDialogOpen = ref(false)
const portfolioName = ref('')
const portfolioNameError = ref('')
const selectedTemplateId = ref('minimalist')
const selectedPortfolioLanguage = ref('es')
const previewTemplateId = ref(null)
const selectedPortfolioToDelete = ref(null)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const previewTemplateSource = ref('')
const templateSources = ref({})
const copy = computed(() => getPortfolioEditorMessages(localeStore.locale))

const portfolioCountLabel = computed(() => `${portfolios.value.length} ${portfolios.value.length === 1 ? copy.value.library.countOne : copy.value.library.countMany}`)
const previewTemplate = computed(() => templates.find((template) => template.id === previewTemplateId.value))
const previewTemplateIndex = computed(() => templates.findIndex((template) => template.id === previewTemplateId.value))
const localizedPreviewHtml = computed(() => {
  if (!previewTemplateSource.value || !import.meta.client) return ''
  const document = new DOMParser().parseFromString(previewTemplateSource.value, 'text/html')
  localizePortfolioTemplate(document, selectedPortfolioLanguage.value)
  return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`
})

function localizedTemplateHtml(templateId) {
  const templateSource = templateSources.value[templateId]
  if (!templateSource || !import.meta.client) return ''
  const document = new DOMParser().parseFromString(templateSource, 'text/html')
  localizePortfolioTemplate(document, selectedPortfolioLanguage.value)
  return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`
}

async function loadTemplateSources() {
  const sources = await Promise.all(templates.map(async (template) => {
    try {
      return [template.id, await $fetch(template.previewUrl, { responseType: 'text' })]
    } catch {
      return [template.id, '']
    }
  }))
  templateSources.value = Object.fromEntries(sources)
}

function getTemplate(templateId) {
  return templates.find((template) => template.id === templateId) ?? templates[0]
}

function templateDescription(templateId) {
  return copy.value.library.templates[templateId]
}

function formatLibraryCopy(key, name) {
  return copy.value.library[key].replace('{name}', name)
}

function openCreateDialog() {
  portfolioName.value = ''
  portfolioNameError.value = ''
  selectedTemplateId.value = 'minimalist'
  selectedPortfolioLanguage.value = ['es', 'en', 'pt-BR'].includes(localeStore.locale) ? localeStore.locale : 'es'
  isCreateDialogOpen.value = true
}

async function openTemplatePreview(templateId) {
  previewTemplateId.value = templateId
  previewTemplateSource.value = ''
  const template = getTemplate(templateId)
  try {
    previewTemplateSource.value = await $fetch(template.previewUrl, { responseType: 'text' })
  } catch {
    // Keep the direct template URL as a preview fallback.
  }
}

function showAdjacentTemplate(direction) {
  const nextIndex = (previewTemplateIndex.value + direction + templates.length) % templates.length
  openTemplatePreview(templates[nextIndex].id)
}

async function createPortfolio() {
  const name = portfolioName.value.trim()
  const selectedTemplate = getTemplate(selectedTemplateId.value)
  if (!selectedTemplate.available) {
    selectedTemplateId.value = 'minimalist'
    return
  }
  if (!name) {
    portfolioNameError.value = copy.value.library.nameRequired
    return
  }

  isSubmitting.value = true
  portfolioNameError.value = ''
  try {
    await portfolioStore.createPortfolio({ name, template_id: selectedTemplateId.value, locale: selectedPortfolioLanguage.value })
    isCreateDialogOpen.value = false
  } catch (error) {
    portfolioNameError.value = error.message
  } finally {
    isSubmitting.value = false
  }
}

function requestDeletePortfolio(portfolio) {
  selectedPortfolioToDelete.value = portfolio
}

async function deletePortfolio() {
  if (!selectedPortfolioToDelete.value) return
  isDeleting.value = true
  try {
    await portfolioStore.deletePortfolio(selectedPortfolioToDelete.value.id)
    selectedPortfolioToDelete.value = null
  } catch {
    // The shared store keeps the error available for the library feedback.
  } finally {
    isDeleting.value = false
  }
}

function closeModalOnEscape(event) {
  if (event.key !== 'Escape') return
  isCreateDialogOpen.value = false
  previewTemplateId.value = null
  selectedPortfolioToDelete.value = null
}

onMounted(() => {
  document.addEventListener('keydown', closeModalOnEscape)
  portfolioStore.loadPortfolios()
  loadTemplateSources()
})
onBeforeUnmount(() => document.removeEventListener('keydown', closeModalOnEscape))
</script>

<template>
  <main class="workspace-page min-h-screen bg-[#f7f3eb] text-stone-950">
    <WorkspaceNav />
    <section class="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div class="mx-auto max-w-7xl">
        <header class="flex flex-col justify-between gap-6 border-b border-stone-300 pb-8 sm:flex-row sm:items-end">
          <div class="max-w-2xl">
            <p class="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-emerald-800"><FolderKanban :size="16" aria-hidden="true" /> {{ copy.library.eyebrow }}</p>
            <h1 class="mt-3 text-4xl font-black tracking-normal text-stone-950 sm:text-5xl">{{ copy.library.title }}</h1>
            <p class="mt-4 text-base leading-7 text-stone-600">{{ copy.library.description }}</p>
          </div>
          <button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900" type="button" @click="openCreateDialog"><Plus :size="18" aria-hidden="true" /> {{ copy.library.addPortfolio }}</button>
        </header>

        <div class="mt-8 flex items-center justify-between">
          <p class="text-sm font-bold text-stone-500">{{ portfolioCountLabel }}</p>
          <p class="hidden text-sm text-stone-500 sm:block">{{ copy.library.choosePortfolio }}</p>
        </div>

        <p v-if="portfolioStore.error" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{{ portfolioStore.error }}</p>
        <div v-else-if="portfolioStore.isLoading" class="mt-4 border border-stone-200 bg-white px-5 py-8 text-sm font-semibold text-stone-500">{{ copy.library.loading }}</div>
        <div v-else class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="portfolio in portfolios" :key="portfolio.id" class="group relative flex min-h-64 flex-col border border-stone-300 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-950/10">
            <div class="flex items-start justify-between gap-4">
              <span class="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-emerald-800"><component :is="portfolio.templateId === 'chef' ? UtensilsCrossed : portfolio.templateId === 'futuristic' ? Sparkles : FolderKanban" :size="21" aria-hidden="true" /></span>
              <button class="grid h-9 w-9 place-items-center rounded-md text-stone-400 opacity-100 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:opacity-0 sm:group-hover:opacity-100" type="button" :aria-label="copy.library.deletePortfolio" :title="copy.library.deletePortfolio" @click="requestDeletePortfolio(portfolio)"><Trash2 :size="17" /></button>
            </div>
            <div class="mt-8">
              <p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ getTemplate(portfolio.templateId).name }}</p>
              <h2 class="mt-2 break-words text-2xl font-black tracking-normal text-stone-950">{{ portfolio.name }}</h2>
              <p class="mt-3 text-sm leading-6 text-stone-500">{{ portfolio.description }}</p>
            </div>
            <div class="mt-auto flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
              <button class="inline-flex items-center gap-2 text-sm font-extrabold text-stone-600 transition hover:text-emerald-800" type="button" @click="openTemplatePreview(portfolio.templateId)"><Eye :size="17" aria-hidden="true" /> {{ copy.library.preview }}</button>
              <NuxtLink class="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-900 transition group-hover:text-emerald-700" :to="`/portfolios/${portfolio.id}`">{{ copy.library.manage }} <ArrowRight :size="18" aria-hidden="true" /></NuxtLink>
            </div>
          </article>

          <button class="group flex min-h-64 flex-col items-center justify-center border border-dashed border-stone-400 bg-transparent p-6 text-center transition hover:border-emerald-700 hover:bg-emerald-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" @click="openCreateDialog">
            <span class="grid h-12 w-12 place-items-center rounded-md bg-white text-emerald-800 shadow-sm transition group-hover:bg-emerald-800 group-hover:text-white"><FilePlus2 :size="22" aria-hidden="true" /></span>
            <span class="mt-4 text-base font-extrabold text-stone-800">{{ copy.library.createAnother }}</span>
            <span class="mt-2 text-sm leading-6 text-stone-500">{{ copy.library.createAnotherDescription }}</span>
          </button>
        </div>
      </div>
    </section>

    <div v-if="isCreateDialogOpen" class="fixed inset-0 z-50 overflow-y-auto bg-stone-950/45 p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="create-portfolio-title" @click.self="isCreateDialogOpen = false">
      <form novalidate class="relative mx-auto my-4 w-full max-w-7xl bg-white p-6 shadow-2xl sm:my-10 sm:p-8" @submit.prevent="createPortfolio">
        <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" :aria-label="copy.dialogs.close" :title="copy.dialogs.close" @click="isCreateDialogOpen = false"><X :size="20" /></button>
        <span class="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-emerald-800"><LayoutTemplate :size="21" aria-hidden="true" /></span>
        <h2 id="create-portfolio-title" class="mt-5 text-2xl font-black tracking-normal">{{ copy.library.createTitle }}</h2>
        <p class="mt-2 text-sm leading-6 text-stone-600">{{ copy.library.createDescription }}</p>
        <div class="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article v-for="template in templates" :key="template.id" class="overflow-hidden border bg-white transition" :class="selectedTemplateId === template.id ? 'border-emerald-800 ring-2 ring-emerald-900/15' : template.available ? 'border-stone-300' : 'border-stone-200 opacity-70'">
            <button class="group block w-full text-left disabled:cursor-not-allowed" type="button" :disabled="!template.available" :aria-disabled="!template.available" @click="selectedTemplateId = template.id">
              <div class="relative aspect-[16/10] overflow-hidden bg-stone-100">
                <iframe :src="localizedTemplateHtml(template.id) ? undefined : template.previewUrl" :srcdoc="localizedTemplateHtml(template.id) || undefined" :title="formatLibraryCopy('templatePreview', template.name)" class="pointer-events-none h-[625%] w-[625%] origin-top-left scale-[0.16] border-0 transition duration-500 group-enabled:group-hover:scale-[0.165]" loading="lazy" tabindex="-1" />
                <span v-if="selectedTemplateId === template.id" class="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-emerald-800 px-2 py-1 text-xs font-extrabold text-white"><Check :size="14" aria-hidden="true" /> {{ copy.library.selected }}</span>
                <span v-else-if="!template.available" class="absolute right-3 top-3 rounded-md bg-stone-950 px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-white">{{ copy.dialogs.comingSoon }}</span>
              </div>
              <div class="p-4">
                <h3 class="text-lg font-black text-stone-950">{{ template.name }}</h3>
                <p class="mt-1 text-sm leading-6 text-stone-600">{{ templateDescription(template.id) }}</p>
              </div>
            </button>
            <button v-if="template.available" class="mx-4 mb-4 inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800 hover:text-emerald-700" type="button" @click="openTemplatePreview(template.id)"><Eye :size="16" aria-hidden="true" /> {{ copy.library.viewFullPortfolio }}</button>
            <p v-else class="mx-4 mb-4 text-sm font-extrabold text-stone-500">{{ copy.dialogs.comingSoon }}</p>
          </article>
        </div>
        <label class="mt-6 block text-sm font-bold text-stone-800">{{ copy.library.portfolioName }}
          <input v-model="portfolioName" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :class="{ 'border-red-500': portfolioNameError }" :placeholder="copy.library.portfolioNamePlaceholder" autofocus />
          <span v-if="portfolioNameError" class="mt-1 block text-sm font-semibold text-red-700">{{ portfolioNameError }}</span>
        </label>
        <label class="mt-5 block text-sm font-bold text-stone-800">{{ copy.dialogs.portfolioLanguage }}
          <select v-model="selectedPortfolioLanguage" class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"><option value="es">{{ copy.dialogs.spanish }}</option><option value="en">{{ copy.dialogs.english }}</option><option value="pt-BR">{{ copy.dialogs.portuguese }}</option></select>
        </label>
        <button class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 disabled:cursor-not-allowed disabled:opacity-60" type="submit" :disabled="isSubmitting">{{ isSubmitting ? copy.library.creating : copy.library.create }} <ArrowRight :size="18" aria-hidden="true" /></button>
      </form>
    </div>

    <div v-if="previewTemplate" class="fixed inset-0 z-[60] bg-white" role="dialog" aria-modal="true" :aria-labelledby="`template-preview-${previewTemplate.id}`">
      <section class="relative flex h-[100dvh] w-screen flex-col bg-white">
        <header class="flex items-center justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
          <div>
            <p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ copy.library.templateLabel }}</p>
            <h2 :id="`template-preview-${previewTemplate.id}`" class="mt-1 text-xl font-black text-stone-950">{{ previewTemplate.name }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <button class="grid h-9 w-9 place-items-center rounded-md text-stone-600 transition hover:bg-stone-100 hover:text-stone-900" type="button" :aria-label="copy.library.previousTemplate" :title="copy.library.previousTemplate" @click="showAdjacentTemplate(-1)"><ChevronLeft :size="21" /></button>
            <button class="grid h-9 w-9 place-items-center rounded-md text-stone-600 transition hover:bg-stone-100 hover:text-stone-900" type="button" :aria-label="copy.library.nextTemplate" :title="copy.library.nextTemplate" @click="showAdjacentTemplate(1)"><ChevronRight :size="21" /></button>
            <button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900" type="button" :aria-label="copy.dialogs.closePreview" :title="copy.dialogs.closePreview" @click="previewTemplateId = null"><X :size="20" /></button>
          </div>
        </header>
        <div class="min-h-0 flex-1 bg-white">
          <iframe :src="localizedPreviewHtml ? undefined : previewTemplate.previewUrl" :srcdoc="localizedPreviewHtml || undefined" :title="formatLibraryCopy('portfolioFrame', previewTemplate.name)" class="block h-full w-full border-0 bg-white" />
        </div>
      </section>
    </div>

    <div v-if="selectedPortfolioToDelete" class="fixed inset-0 z-[70] grid place-items-center bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-portfolio-title" @click.self="selectedPortfolioToDelete = null">
      <section class="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-2xl sm:p-7">
        <div class="grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-700"><Trash2 :size="21" aria-hidden="true" /></div>
        <h2 id="delete-portfolio-title" class="mt-5 text-xl font-black text-stone-950">{{ copy.library.deleteTitle }}</h2>
        <p class="mt-2 text-sm leading-6 text-stone-600">{{ copy.library.deletePrefix }} <strong class="font-extrabold text-stone-800">{{ selectedPortfolioToDelete.name }}</strong>. {{ copy.library.deleteWarning }}</p>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" :disabled="isDeleting" @click="selectedPortfolioToDelete = null">{{ copy.library.cancel }}</button><button class="rounded-md bg-red-700 px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60" type="button" :disabled="isDeleting" @click="deletePortfolio">{{ isDeleting ? copy.library.deleting : copy.library.delete }}</button></div>
      </section>
    </div>
  </main>
</template>