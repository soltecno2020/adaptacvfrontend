<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowRight, BriefcaseBusiness, Copy, FilePlus2, FileText, FileUp, Mail, Plus, Trash2, X } from '@lucide/vue'
import WorkspaceNav from '../../components/navigation/WorkspaceNav.vue'
import EmailRecipientsInput from '../../components/forms/EmailRecipientsInput.vue'
import { useAuthStore } from '../../stores/authStore'
import { useCvStore } from '../../stores/cvStore'
import { useLocaleStore } from '../../stores/localeStore'

const cvStore = useCvStore()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { cvDocuments, isLoadingCvs, cvsError } = storeToRefs(cvStore)
const { session } = storeToRefs(authStore)
const { selectedLanguageId } = storeToRefs(localeStore)
const isCreateDialogOpen = ref(false)
const cvName = ref('')
const cvNameError = ref('')
const sectorQuery = ref('')
const selectedSector = ref('')
const sectorError = ref('')
const isSectorListOpen = ref(false)
const nameInput = ref(null)
const sectors = ref([])
const sectorsError = ref('')
const isLoadingSectors = ref(false)
const isCreating = ref(false)
const createError = ref('')
const previousCvFile = ref(null)
const previousCvInput = ref(null)
const importError = ref('')
const selectedCvToDelete = ref(null)
const isDeletingCv = ref(false)
const duplicatingCvId = ref(null)
const duplicateError = ref('')
const selectedEmailDocument = ref(null)
const isSendingEmail = ref(false)
const emailError = ref('')
const emailSuccess = ref('')
const emailForm = reactive({ recipientEmails: [], subject: '', body: '', language: 'es' })
const expandedCvId = ref(null)

const copy = computed(() => localeStore.translations.cvLibrary)
const editorCopy = computed(() => localeStore.translations.editor)
const importCopy = computed(() => ({
  es: { label: 'Importar un CV anterior', hint: 'PDF o DOCX, máximo 5 MB. La IA extraerá los datos para que los revises en el editor.', remove: 'Quitar archivo', invalid: 'Selecciona un archivo PDF o DOCX de hasta 5 MB.', importing: 'Extrayendo información del CV...' },
  en: { label: 'Import a previous CV', hint: 'PDF or DOCX, maximum 5 MB. AI will extract the details for you to review in the editor.', remove: 'Remove file', invalid: 'Select a PDF or DOCX file up to 5 MB.', importing: 'Extracting CV information...' },
  'pt-BR': { label: 'Importar um CV anterior', hint: 'PDF ou DOCX, máximo de 5 MB. A IA extrairá os dados para você revisar no editor.', remove: 'Remover arquivo', invalid: 'Selecione um arquivo PDF ou DOCX de até 5 MB.', importing: 'Extraindo informações do CV...' },
}[localeStore.locale] || {}))
const cvCountLabel = computed(() => `${cvDocuments.value.length} ${cvDocuments.value.length === 1 ? copy.value.countOne : copy.value.countMany}`)
const filteredSectors = computed(() => {
  const query = sectorQuery.value.trim().toLocaleLowerCase()
  return query
    ? sectors.value.filter((sector) => `${sector.code} ${sector.name} ${sector.description}`.toLocaleLowerCase().includes(query))
    : sectors.value
})

async function openCreateDialog() {
  cvName.value = ''
  cvNameError.value = ''
  sectorQuery.value = ''
  selectedSector.value = ''
  sectorError.value = ''
  createError.value = ''
  importError.value = ''
  previousCvFile.value = null
  if (previousCvInput.value) previousCvInput.value.value = ''
  isSectorListOpen.value = false
  isCreateDialogOpen.value = true
  await nextTick()
  nameInput.value?.focus()
  await loadSectors()
}

async function createCv() {
  cvNameError.value = ''
  sectorError.value = ''
  if (!cvName.value.trim()) {
    cvNameError.value = copy.value.nameRequired
  }
  if (!selectedSector.value) sectorError.value = copy.value.sectorRequired
  if (cvNameError.value || sectorError.value) return

  isCreating.value = true
  createError.value = ''
  try {
    const importedCv = previousCvFile.value
      ? await cvStore.importCvFromFile(previousCvFile.value, localeStore.locale)
      : null
    const document = await cvStore.createCv(cvName.value, selectedSector.value)
    if (importedCv) await cvStore.applyImportedCv(document.id, importedCv)
    isCreateDialogOpen.value = false
    openEditor(document.id)
  } catch (error) {
    createError.value = error.message || copy.value.createFailed
  } finally {
    isCreating.value = false
  }
}

function selectPreviousCv(event) {
  const [file] = event.target.files || []
  importError.value = ''
  if (!file) return

  const validExtension = /\.(pdf|docx)$/i.test(file.name)
  if (!validExtension || file.size > 5 * 1024 * 1024) {
    previousCvFile.value = null
    event.target.value = ''
    importError.value = importCopy.value.invalid
    return
  }

  previousCvFile.value = file
}

function removePreviousCv() {
  previousCvFile.value = null
  importError.value = ''
  if (previousCvInput.value) previousCvInput.value.value = ''
}

function openEditor(id) {
  cvStore.selectCv(id)
}

function toggleCvAccordion(id) {
  expandedCvId.value = expandedCvId.value === id ? null : id
}

function requestDeleteCv(document) {
  selectedCvToDelete.value = document
}

async function duplicateCv(document) {
  duplicatingCvId.value = document.id
  duplicateError.value = ''
  try {
    const name = copy.value.duplicateName.replace('{name}', document.name)
    await cvStore.duplicateCv(document, name)
  } catch (error) {
    duplicateError.value = error.message || copy.value.duplicateFailed
  } finally {
    duplicatingCvId.value = null
  }
}

async function deleteCv() {
  const document = selectedCvToDelete.value
  if (!document) return

  isDeletingCv.value = true
  try {
    await cvStore.deleteCv(document.id)
    selectedCvToDelete.value = null
  } catch (error) {
    createError.value = error.message || copy.value.deleteFailed
  } finally {
    isDeletingCv.value = false
  }
}

function openEmailDialog(document) {
  emailError.value = ''
  emailSuccess.value = ''
  emailForm.recipientEmails = [session.value?.email || document.data.profile.email].filter(Boolean)
  emailForm.subject = editorCopy.value.emailSubjectDefault.replace('{name}', document.data.profile.fullName || document.name)
  emailForm.body = editorCopy.value.emailBody
  emailForm.language = localeStore.locale
  selectedEmailDocument.value = document
}

async function generatePdfForEmail(document, language = emailForm.language) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const data = document.data || {}
  const profile = data.profile || {}
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - (margin * 2)
  let cursorY = 20

  const addText = (text, options = {}) => {
    if (!text) return
    const { size = 10, style = 'normal', color = [28, 25, 23], align = 'left', spacing = 5 } = options
    pdf.setFont('helvetica', style)
    pdf.setFontSize(size)
    pdf.setTextColor(...color)
    const lines = pdf.splitTextToSize(String(text), contentWidth)
    if (cursorY + (lines.length * spacing) > pageHeight - margin) {
      pdf.addPage()
      cursorY = margin
    }
    pdf.text(lines, align === 'center' ? pageWidth / 2 : margin, cursorY, { align })
    cursorY += lines.length * spacing
  }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(22)
  pdf.setTextColor(28, 25, 23)
  pdf.text(profile.fullName || document.name || 'CV', pageWidth / 2, cursorY, { align: 'center' })
  cursorY += 10

  if (profile.role) addText(profile.role, { size: 13, style: 'bold', align: 'center', color: [68, 64, 60], spacing: 6 })
  const contactInfo = [profile.city, profile.country, profile.email, profile.phone].filter(Boolean).join(' | ')
  if (contactInfo) addText(contactInfo, { size: 9, color: [87, 83, 78], align: 'center', spacing: 4.5 })
  if (profile.linkedIn) addText(profile.linkedIn, { size: 9, style: 'bold', color: [4, 120, 87], align: 'center', spacing: 4.5 })

  if (profile.professionalSummary) {
    cursorY += 6
    pdf.setDrawColor(214, 211, 209)
    pdf.line(margin, cursorY, pageWidth - margin, cursorY)
    cursorY += 7
    addText(language === 'en' ? 'Professional profile' : 'Perfil profesional', { size: 11, style: 'bold', color: [87, 83, 78] })
    addText(profile.professionalSummary)
  }

  if ((data.experience || []).length) {
    addText(language === 'en' ? 'Experience' : 'Experiencia', { size: 11, style: 'bold', color: [87, 83, 78] })
    data.experience.forEach((item) => {
      addText([item.role, item.company].filter(Boolean).join(' | '), { size: 11, style: 'bold' })
      const period = item.startDate && item.endDate ? `${item.startDate} - ${item.endDate}` : item.period || ''
      if (period) addText(period, { size: 9, color: [87, 83, 78], spacing: 4.5 })
      if (item.summary) addText(item.summary)
    })
  }

  if ((data.educations || []).length) {
    addText(language === 'en' ? 'Education' : 'Educación', { size: 11, style: 'bold', color: [87, 83, 78] })
    data.educations.forEach((item) => {
      addText([item.program, item.institution].filter(Boolean).join(' | '), { size: 10, style: 'bold' })
      if (item.graduationYear) addText(String(item.graduationYear), { size: 9, color: [87, 83, 78] })
    })
  }

  if ((data.languages || []).length || (data.interests || []).length) {
    addText(language === 'en' ? 'Languages and interests' : 'Idiomas e intereses', { size: 11, style: 'bold', color: [87, 83, 78] })
    if (data.languages?.length) addText(`${language === 'en' ? 'Languages' : 'Idiomas'}: ${data.languages.join(' | ')}`)
    if (data.interests?.length) addText(`${language === 'en' ? 'Interests' : 'Intereses'}: ${data.interests.join(' | ')}`)
  }

  const pdfBlob = pdf.output('blob')
  const safeName = (profile.fullName || document.name || 'mi-cv')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'mi-cv'
  return new File([pdfBlob], `${safeName}.pdf`, { type: 'application/pdf' })
}

async function sendEmailForDocument() {
  if (!selectedEmailDocument.value) return
  if (!emailForm.recipientEmails.length || !emailForm.subject || !emailForm.body) {
    emailError.value = editorCopy.value.completeEmailFields
    return
  }

  isSendingEmail.value = true
  emailError.value = ''
  try {
    const pdfFile = await generatePdfForEmail(selectedEmailDocument.value, emailForm.language)
    await cvStore.sendCvByEmail({
      recipientEmails: emailForm.recipientEmails,
      subject: emailForm.subject,
      body: emailForm.body,
      pdf: pdfFile,
    })
    emailSuccess.value = editorCopy.value.emailSent
    selectedEmailDocument.value = null
  } catch (error) {
    emailError.value = error.message || editorCopy.value.emailFailed
  } finally {
    isSendingEmail.value = false
  }
}

function selectSector(sector) {
  selectedSector.value = sector
  sectorQuery.value = `${sector.code} - ${sector.name}`
  sectorError.value = ''
  isSectorListOpen.value = false
}

async function loadSectors() {
  if (sectors.value.length || isLoadingSectors.value) return
  if (selectedLanguageId.value == null) return

  const { public: { apiBaseUrl } } = useRuntimeConfig()
  isLoadingSectors.value = true
  sectorsError.value = ''

  try {
    const languageId = encodeURIComponent(selectedLanguageId.value)
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/v1/industries?language_id=${languageId}`, {
      headers: { Accept: 'application/json' },
    })
    if (!response?.success) throw new Error(response?.message || copy.value.industriesFailed)
    sectors.value = response.data?.industries || []
  } catch (error) {
    sectorsError.value = error.data?.message || error.message || copy.value.industriesFailed
  } finally {
    isLoadingSectors.value = false
  }
}

function closeModalOnEscape(event) {
  if (event.key !== 'Escape') return
  isCreateDialogOpen.value = false
  if (!isDeletingCv.value) selectedCvToDelete.value = null
}

onMounted(() => {
  document.addEventListener('keydown', closeModalOnEscape)
  cvStore.loadCvs()
})

watch(selectedLanguageId, async () => {
  sectors.value = []
  selectedSector.value = ''
  sectorQuery.value = ''
  if (isCreateDialogOpen.value) await loadSectors()
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
            <p class="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.12em] text-emerald-800"><BriefcaseBusiness :size="16" aria-hidden="true" /> {{ copy.eyebrow }}</p>
            <h1 class="mt-3 text-4xl font-black tracking-normal text-stone-950 sm:text-5xl">{{ copy.title }}</h1>
            <p class="mt-4 text-base leading-7 text-stone-600">{{ copy.description }}</p>
          </div>
          <button class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900" type="button" @click="openCreateDialog"><Plus :size="18" aria-hidden="true" /> {{ copy.addCv }}</button>
        </header>

        <div class="mt-8 flex items-center justify-between">
          <p class="text-sm font-bold text-stone-500">{{ cvCountLabel }}</p>
          <p class="hidden text-sm text-stone-500 sm:block">{{ copy.chooseCv }}</p>
        </div>
        <p v-if="cvsError" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{{ cvsError }}</p>
        <p v-if="duplicateError" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{{ duplicateError }}</p>
        <p v-if="emailSuccess" class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" role="status">{{ emailSuccess }}</p>

        <div class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article v-for="document in cvDocuments" :key="document.id" class="group relative flex min-h-64 cursor-pointer flex-col border border-stone-300 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-950/10" :class="expandedCvId === document.id ? 'border-emerald-700 shadow-lg shadow-emerald-950/10' : ''" @click="toggleCvAccordion(document.id)">
            <div class="flex items-start justify-between gap-4">
              <span class="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-emerald-800"><FileText :size="21" aria-hidden="true" /></span>
              <div class="flex items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                <button class="grid h-9 w-9 place-items-center rounded-md text-stone-400 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-wait disabled:opacity-50" type="button" :disabled="duplicatingCvId !== null" :aria-label="duplicatingCvId === document.id ? copy.duplicatingCv : copy.duplicateCv" :title="duplicatingCvId === document.id ? copy.duplicatingCv : copy.duplicateCv" @click.stop="duplicateCv(document)"><Copy :size="17" /></button>
                <button class="grid h-9 w-9 place-items-center rounded-md text-stone-400 transition hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-not-allowed disabled:opacity-60" type="button" :disabled="isSendingEmail" :aria-label="editorCopy.sendEmail" :title="editorCopy.sendEmail" @click.stop="openEmailDialog(document)"><Mail :size="17" /></button>
                <button class="grid h-9 w-9 place-items-center rounded-md text-stone-400 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" type="button" :aria-label="copy.deleteCv" :title="copy.deleteCv" @click.stop="requestDeleteCv(document)"><Trash2 :size="17" /></button>
              </div>
            </div>
            <div class="mt-8">
              <p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ copy.customCv }}</p>
              <h2 class="mt-2 break-words text-2xl font-black tracking-normal text-stone-950">{{ document.name }}</h2>
              <p class="mt-3 text-sm leading-6 text-stone-500">{{ document.sector || copy.undefinedSector }}</p>
            </div>

            <div v-if="expandedCvId === document.id" class="mt-4 border-t border-stone-200 pt-4">
              <p class="text-sm leading-6 text-stone-600">{{ document.sector || copy.undefinedSector }}</p>
              <div class="mt-4 flex flex-wrap gap-2">
                <button class="rounded-md bg-emerald-900 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-emerald-800" type="button" @click.stop="openEditor(document.id)">{{ copy.openEditor }}</button>
                <button class="rounded-md border border-stone-300 px-3 py-2 text-xs font-extrabold text-stone-700 transition hover:border-emerald-700 hover:text-emerald-900" type="button" @click.stop="openEmailDialog(document)">{{ editorCopy.sendEmail }}</button>
              </div>
            </div>

            <RouterLink :to="{ name: 'editor' }" class="mt-auto inline-flex items-center justify-between border-t border-stone-200 pt-4 text-sm font-extrabold text-emerald-900 transition group-hover:text-emerald-700" @click.stop="openEditor(document.id)">{{ copy.openEditor }} <ArrowRight :size="18" aria-hidden="true" /></RouterLink>
          </article>

          <div v-if="isLoadingCvs" class="flex min-h-64 flex-col items-center justify-center border border-dashed border-stone-300 p-6 text-center text-sm font-semibold text-stone-500">{{ copy.loadingCvs }}</div>
          <button class="group flex min-h-64 flex-col items-center justify-center border border-dashed border-stone-400 bg-transparent p-6 text-center transition hover:border-emerald-700 hover:bg-emerald-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" @click="openCreateDialog">
            <span class="grid h-12 w-12 place-items-center rounded-md bg-white text-emerald-800 shadow-sm transition group-hover:bg-emerald-800 group-hover:text-white"><FilePlus2 :size="22" aria-hidden="true" /></span>
            <span class="mt-4 text-base font-extrabold text-stone-800">{{ copy.createAnother }}</span>
            <span class="mt-2 text-sm leading-6 text-stone-500">{{ copy.createAnotherDescription }}</span>
          </button>
        </div>
      </div>
    </section>

    <div v-if="isCreateDialogOpen" class="fixed inset-0 z-50 grid place-items-center bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="create-cv-title" @click.self="isCreateDialogOpen = false">
      <form novalidate class="relative w-full max-w-md bg-white p-6 shadow-2xl sm:p-8" @submit.prevent="createCv">
        <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" :aria-label="copy.close" :title="copy.close" @click="isCreateDialogOpen = false"><X :size="20" /></button>
        <span class="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-emerald-800"><FilePlus2 :size="21" aria-hidden="true" /></span>
        <h2 id="create-cv-title" class="mt-5 text-2xl font-black tracking-normal">{{ copy.createTitle }}</h2>
        <p class="mt-2 text-sm leading-6 text-stone-600">{{ copy.createDescription }}</p>
        <label class="mt-6 block text-sm font-bold text-stone-800">{{ copy.cvName }}
          <input ref="nameInput" v-model="cvName" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :class="{ 'border-red-500': cvNameError }" :placeholder="copy.cvNamePlaceholder" />
          <span v-if="cvNameError" class="mt-1 block text-sm font-semibold text-red-700">{{ cvNameError }}</span>
        </label>
        <label class="mt-5 block text-sm font-bold text-stone-800">{{ copy.sector }}
          <div class="relative mt-2"><input v-model="sectorQuery" role="combobox" aria-autocomplete="list" :aria-expanded="isSectorListOpen" autocomplete="off" class="w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :class="{ 'border-red-500': sectorError }" :placeholder="copy.sectorPlaceholder" @focus="isSectorListOpen = true" @input="selectedSector = ''" /><div v-if="isSectorListOpen" class="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-stone-200 bg-white py-1 shadow-lg" role="listbox"><p v-if="isLoadingSectors" class="px-3 py-2 text-sm text-stone-500">{{ copy.loadingSectors }}</p><template v-else><button v-for="sector in filteredSectors" :key="sector.id" class="block w-full px-3 py-2 text-left text-sm font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900" type="button" role="option" :aria-selected="selectedSector?.id === sector.id" @mousedown.prevent="selectSector(sector)"><span class="mr-2 text-emerald-800">{{ sector.code }}</span>{{ sector.name }}</button><p v-if="!filteredSectors.length" class="px-3 py-2 text-sm text-stone-500">{{ copy.noSectors }}</p></template></div></div>
          <span v-if="sectorError" class="mt-1 block text-sm font-semibold text-red-700">{{ sectorError }}</span>
          <span v-if="sectorsError" class="mt-1 block text-sm font-semibold text-red-700">{{ sectorsError }}</span>
        </label>
        <section class="mt-5 border-t border-stone-200 pt-5">
          <p class="text-sm font-bold text-stone-800">{{ importCopy.label }}</p>
          <p class="mt-1 text-xs leading-5 text-stone-500">{{ importCopy.hint }}</p>
          <label v-if="!previousCvFile" class="mt-3 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-stone-400 px-4 py-3 text-sm font-extrabold text-emerald-900 transition hover:border-emerald-700 hover:bg-emerald-50"><FileUp :size="18" aria-hidden="true" />{{ importCopy.label }}<input ref="previousCvInput" class="sr-only" type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" @change="selectPreviousCv" /></label>
          <div v-else class="mt-3 flex items-center gap-3 border border-emerald-200 bg-emerald-50 px-3 py-3"><FileText :size="18" class="shrink-0 text-emerald-800" aria-hidden="true" /><span class="min-w-0 flex-1 truncate text-sm font-bold text-emerald-950">{{ previousCvFile.name }}</span><button class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-emerald-800 transition hover:bg-emerald-100" type="button" :aria-label="importCopy.remove" :title="importCopy.remove" @click="removePreviousCv"><X :size="16" /></button></div>
          <p v-if="importError" class="mt-2 text-sm font-semibold text-red-700" role="alert">{{ importError }}</p>
        </section>
        <p v-if="createError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ createError }}</p>
        <button class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="isCreating">{{ isCreating ? (previousCvFile ? importCopy.importing : copy.creating) : copy.createAndEdit }} <ArrowRight v-if="!isCreating" :size="18" aria-hidden="true" /></button>
      </form>
    </div>

    <div v-if="selectedCvToDelete" class="fixed inset-0 z-[60] grid place-items-center bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-cv-title" @click.self="!isDeletingCv && (selectedCvToDelete = null)">
      <section class="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-2xl sm:p-7">
        <div class="grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-700"><Trash2 :size="21" aria-hidden="true" /></div>
        <h2 id="delete-cv-title" class="mt-5 text-xl font-black text-stone-950">{{ copy.deleteTitle }}</h2>
        <p class="mt-2 text-sm leading-6 text-stone-600">{{ copy.deletePrefix }} <strong class="font-extrabold text-stone-800">{{ selectedCvToDelete.name }}</strong>. {{ copy.deleteWarning }}</p>
        <p v-if="createError" class="mt-3 text-sm font-semibold text-red-700" role="alert">{{ createError }}</p>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700" type="button" :disabled="isDeletingCv" @click="selectedCvToDelete = null">{{ copy.cancel }}</button><button class="rounded-md bg-red-700 px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-70" type="button" :disabled="isDeletingCv" @click="deleteCv">{{ isDeletingCv ? copy.deleting : copy.delete }}</button></div>
      </section>
    </div>

    <div v-if="selectedEmailDocument" class="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="cv-email-dialog-title" @click.self="selectedEmailDocument = null">
      <form novalidate class="my-auto w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl sm:p-6" @submit.prevent="sendEmailForDocument">
        <div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800"><Mail :size="20" /></span><h2 id="cv-email-dialog-title" class="text-xl font-black text-stone-950">{{ editorCopy.emailTitle }}</h2></div>
        <label class="mt-5 block text-sm font-bold text-stone-700">{{ editorCopy.recipientEmail }}<EmailRecipientsInput v-model="emailForm.recipientEmails" :owner-email="session?.email" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.emailSubject }}<input v-model.trim="emailForm.subject" maxlength="255" required class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.emailMessage }}<textarea v-model.trim="emailForm.body" rows="5" maxlength="10000" required class="mt-2 w-full resize-y rounded-md border border-stone-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.emailLanguage }}<select v-model="emailForm.language" class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-bold text-stone-900"><option value="es">Español</option><option value="en">English</option></select></label>
        <p v-if="emailError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ emailError }}</p>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700" type="button" :disabled="isSendingEmail" @click="selectedEmailDocument = null">{{ editorCopy.cancel }}</button><button class="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="isSendingEmail"><Mail :size="17" />{{ isSendingEmail ? editorCopy.sendingEmail : editorCopy.sendEmailConfirm }}</button></div>
      </form>
    </div>
  </main>
</template>