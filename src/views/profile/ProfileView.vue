<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { ArrowRight, Camera, Download, FileText, FolderKanban, KeyRound, LoaderCircle, LogOut, Mail, Pencil, Plus, ShieldCheck, Sparkles } from '@lucide/vue'
import WorkspaceNav from '../../components/navigation/WorkspaceNav.vue'
import EmailRecipientsInput from '../../components/forms/EmailRecipientsInput.vue'
import { useAuthStore } from '../../stores/authStore'
import { useCvStore } from '../../stores/cvStore'
import { useLocaleStore } from '../../stores/localeStore'
import { dateLocales } from '../../config/locales'

const authStore = useAuthStore()
const cvStore = useCvStore()
const localeStore = useLocaleStore()
const { session } = storeToRefs(authStore)
const { cvDocuments } = storeToRefs(cvStore)
const { translations: copy } = storeToRefs(localeStore)
const passwordForm = ref({ currentPassword: '', password: '', passwordConfirmation: '' })
const passwordError = ref('')
const passwordMessage = ref('')
const isUpdatingPassword = ref(false)
const isLoggingOutAll = ref(false)
const isPasswordModalOpen = ref(false)
const downloadingDocumentId = ref(null)
const downloadError = ref('')
const selectedDownloadDocument = ref(null)
const pdfLanguage = ref('es')
const selectedEmailDocument = ref(null)
const isSendingEmail = ref(false)
const emailError = ref('')
const emailSuccess = ref('')
const emailForm = reactive({ recipientEmails: [], subject: '', body: '', language: 'es' })
const photoInput = ref(null)
const isUploadingPhoto = ref(false)
const photoError = ref('')
const isPhotoPreviewOpen = ref(false)

const displayName = computed(() => session.value?.name || session.value?.email?.split('@')[0] || 'Mi cuenta')
const accountInitial = computed(() => displayName.value.charAt(0).toUpperCase())
const requiresCurrentPassword = computed(() => session.value?.requiresCurrentPassword !== false)

function openPhotoPicker() {
  photoInput.value?.click()
}

function openPhotoPreview() {
  if (session.value?.photoUrl) isPhotoPreviewOpen.value = true
}

async function uploadProfilePhoto(event) {
  const [photo] = event.target.files || []
  event.target.value = ''
  photoError.value = ''
  if (!photo) return

  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!acceptedTypes.includes(photo.type)) {
    photoError.value = 'Selecciona una imagen JPG, JPEG, PNG o WEBP.'
    return
  }
  if (photo.size > 2 * 1024 * 1024) {
    photoError.value = 'La imagen no puede superar los 2 MB.'
    return
  }

  isUploadingPhoto.value = true
  try {
    await authStore.updateProfilePhoto(photo)
  } catch (error) {
    photoError.value = error.message || 'No fue posible actualizar la foto de perfil.'
  } finally {
    isUploadingPhoto.value = false
  }
}

function validatePassword() {
  if (requiresCurrentPassword.value && !passwordForm.value.currentPassword) return 'Ingresa tu contrasena actual.'
  if (passwordForm.value.password.length < 8) return 'La nueva contrasena debe tener al menos 8 caracteres.'
  if (passwordForm.value.password !== passwordForm.value.passwordConfirmation) return 'Las contrasenas no coinciden.'
  return ''
}

async function updatePassword() {
  passwordError.value = validatePassword()
  passwordMessage.value = ''
  if (passwordError.value) return

  isUpdatingPassword.value = true
  try {
    await authStore.updatePassword(passwordForm.value)
    passwordForm.value = { currentPassword: '', password: '', passwordConfirmation: '' }
    passwordMessage.value = 'Contrasena actualizada.'
    isPasswordModalOpen.value = false
  } catch (error) {
    passwordError.value = error.message || 'No fue posible actualizar la contrasena.'
  } finally {
    isUpdatingPassword.value = false
  }
}

async function logoutAll() {
  isLoggingOutAll.value = true
  try {
    await authStore.logoutAll()
  } finally {
    isLoggingOutAll.value = false
    navigateTo('/?auth=login')
  }
}

function openPasswordModal() {
  passwordError.value = ''
  passwordMessage.value = ''
  passwordForm.value = { currentPassword: '', password: '', passwordConfirmation: '' }
  isPasswordModalOpen.value = true
}

function closeModalOnEscape(event) {
  if (event.key !== 'Escape') return
  isPasswordModalOpen.value = false
  selectedDownloadDocument.value = null
  selectedEmailDocument.value = null
  isPhotoPreviewOpen.value = false
}

function getPdfFileName(document) {
  const name = document.data.profile.fullName.trim() || document.name || 'mi-cv'
  const safeName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${safeName || 'mi-cv'}.pdf`
}

function formatExperiencePeriod(startDate, endDate, language) {
  if (!startDate || !endDate) return ''
  const formatter = new Intl.DateTimeFormat(dateLocales[language] || dateLocales.es, { month: 'short', year: 'numeric' })
  const formatDate = (date) => formatter.format(new Date(`${date}T12:00:00`)).replace('.', '')
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

function openPdfLanguageDialog(document) {
  selectedDownloadDocument.value = document
  pdfLanguage.value = localeStore.locale
}

function openEmailDialog(document) {
  emailError.value = ''
  emailSuccess.value = ''
  emailForm.recipientEmails = [session.value?.email || document.data.profile.email].filter(Boolean)
  emailForm.subject = copy.value.editor.emailSubjectDefault.replace('{name}', document.data.profile.fullName || document.name)
  emailForm.body = copy.value.editor.emailBody
  emailForm.language = localeStore.locale
  selectedEmailDocument.value = document
}

async function downloadPdf(language = pdfLanguage.value, emailPayload = null) {
  const document = emailPayload ? selectedEmailDocument.value : selectedDownloadDocument.value
  if (!document) return
  if (downloadingDocumentId.value) return

  if (emailPayload) isSendingEmail.value = true
  else selectedDownloadDocument.value = null
  downloadingDocumentId.value = document.id
  downloadError.value = ''
  try {
    const pdfCopy = language === 'en'
      ? { profile: 'Professional profile', experience: 'Experience', education: 'Education', skills: 'Skills', recommendations: 'Employment recommendations', additional: 'Additional information', languages: 'Languages', interests: 'Interests' }
      : { profile: 'Perfil profesional', experience: 'Experiencia', education: 'Educacion', skills: 'Skills', recommendations: 'Recomendaciones laborales', additional: 'Informacion adicional', languages: 'Idiomas', interests: 'Intereses' }
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const data = document.data
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 18
    const contentWidth = pageWidth - (margin * 2)
    let cursorY = 20

    const addPageIfNeeded = (height = 8) => {
      if (cursorY + height <= pageHeight - margin) return
      pdf.addPage()
      cursorY = margin
    }
    const addText = (text, options = {}) => {
      if (!text) return
      const { size = 10, style = 'normal', color = [28, 25, 23], align = 'left', spacing = 5 } = options
      pdf.setFont('helvetica', style)
      pdf.setFontSize(size)
      pdf.setTextColor(...color)
      const lines = pdf.splitTextToSize(String(text), contentWidth)
      addPageIfNeeded(lines.length * spacing)
      pdf.text(lines, align === 'center' ? pageWidth / 2 : margin, cursorY, { align })
      cursorY += lines.length * spacing
    }
    const addSection = (title) => {
      cursorY += 5
      addPageIfNeeded(13)
      pdf.setDrawColor(214, 211, 209)
      pdf.line(margin, cursorY, pageWidth - margin, cursorY)
      cursorY += 7
      addText(title.toUpperCase(), { size: 10, style: 'bold', color: [87, 83, 78] })
      cursorY += 2
    }
    const addLink = (text, url) => {
      if (!text || !url) return
      const size = 10
      const spacing = 5
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(size)
      pdf.setTextColor(4, 120, 87)
      const lines = pdf.splitTextToSize(String(text), contentWidth)
      addPageIfNeeded(lines.length * spacing)
      const startY = cursorY
      pdf.text(lines, margin, cursorY)
      pdf.link(margin, startY - 3.5, contentWidth, lines.length * spacing, { url })
      cursorY += lines.length * spacing
    }

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(22)
    pdf.setTextColor(28, 25, 23)
    pdf.text(data.profile.fullName || document.name, pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 9
    addText(data.profile.role, { size: 14, style: 'bold', color: [68, 64, 60], align: 'center', spacing: 6 })
    addText([data.profile.city, data.profile.country, data.profile.email, data.profile.phone].filter(Boolean).join(' | '), { size: 9, color: [87, 83, 78], align: 'center', spacing: 4.5 })
    addText(data.profile.linkedIn, { size: 9, style: 'bold', color: [4, 120, 87], align: 'center', spacing: 4.5 })
    cursorY += 4
    pdf.setDrawColor(6, 95, 70)
    pdf.line(margin, cursorY, pageWidth - margin, cursorY)

    if (data.profile.professionalSummary) {
      addSection(pdfCopy.profile)
      addText(data.profile.professionalSummary)
    }
    if (data.experience.length) {
      addSection(pdfCopy.experience)
      data.experience.forEach((item) => {
        addText([item.role, item.company].filter(Boolean).join(' | '), { size: 11, style: 'bold' })
        addText(formatExperiencePeriod(item.startDate, item.endDate, language) || item.period, { size: 9, style: 'bold', color: [87, 83, 78], spacing: 4.5 })
        addText(item.summary)
        cursorY += 3
      })
    }
    if (data.educations.length) {
      addSection(pdfCopy.education)
      data.educations.forEach((education) => {
        addText(education.credential, { size: 11, style: 'bold' })
        addText([education.institution, `${education.startYear} - ${education.endYear}`].filter(Boolean).join(' | '), { size: 9, color: [87, 83, 78], spacing: 4.5 })
        cursorY += 3
      })
    }
    if (data.skills.length) {
      addSection(pdfCopy.skills)
      addText(data.skills.join(' | '))
    }
    if (data.employmentRecommendations?.length) {
      addSection(pdfCopy.recommendations)
      data.employmentRecommendations.forEach((recommendation) => addLink(recommendation.name, recommendation.url))
    }
    if (data.languages.length || data.interests.length) {
      addSection(pdfCopy.additional)
      addText(data.languages.length ? `${pdfCopy.languages}: ${data.languages.join(' | ')}` : '')
      addText(data.interests.length ? `${pdfCopy.interests}: ${data.interests.join(' | ')}` : '')
    }
    if (emailPayload) {
      const pdfFile = new File([pdf.output('blob')], getPdfFileName(document), { type: 'application/pdf' })
      await cvStore.sendCvByEmail({ ...emailPayload, pdf: pdfFile })
      emailSuccess.value = copy.value.editor.emailSent
      selectedEmailDocument.value = null
    } else pdf.save(getPdfFileName(document))
  } catch (error) {
    if (emailPayload) emailError.value = error.message || copy.value.editor.emailFailed
    else downloadError.value = 'No fue posible generar el PDF. Intentalo nuevamente.'
  } finally {
    downloadingDocumentId.value = null
    isSendingEmail.value = false
  }
}

async function sendCvByEmail() {
  if (!emailForm.recipientEmails.length || !emailForm.subject || !emailForm.body) {
    emailError.value = copy.value.editor.completeEmailFields
    return
  }
  await downloadPdf(emailForm.language, { recipientEmails: emailForm.recipientEmails, subject: emailForm.subject, body: emailForm.body })
}

onMounted(() => {
  document.addEventListener('keydown', closeModalOnEscape)
  cvStore.loadCvs()
})
onBeforeUnmount(() => document.removeEventListener('keydown', closeModalOnEscape))
</script>

<template>
  <main class="profile-page min-h-screen bg-[#f7f3eb] text-stone-950" :class="{ 'password-setup-mode': !requiresCurrentPassword }">
    <WorkspaceNav />
    <section class="relative overflow-hidden px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div class="absolute inset-x-0 top-0 -z-10 h-72 bg-[linear-gradient(120deg,_#e7f3f1_0%,_#f8fafb_52%,_#fff3ef_100%)]"></div>
      <div class="mx-auto max-w-7xl">
        <header class="flex flex-col justify-between gap-6 border-b border-stone-300 pb-8 md:flex-row md:items-end">
          <div>
            <p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">{{ copy.profile.eyebrow }}</p>
        <Transition name="photo-preview">
          <div v-if="isPhotoPreviewOpen" class="fixed inset-0 z-[80] grid place-items-center bg-stone-950/75 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Foto de perfil" @click.self="isPhotoPreviewOpen = false">
            <section class="relative w-full max-w-lg overflow-hidden rounded-lg border border-white/20 bg-white p-3 shadow-2xl shadow-black/40">
              <button class="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-stone-950/65 text-white backdrop-blur transition hover:bg-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" type="button" aria-label="Cerrar foto" title="Cerrar" @click="isPhotoPreviewOpen = false">&times;</button>
              <img :src="session?.photoUrl" :alt="displayName" class="aspect-square w-full rounded-md object-cover" />
              <div class="absolute inset-x-3 bottom-3 rounded-b-md bg-gradient-to-t from-stone-950/70 to-transparent px-5 pb-5 pt-12"><p class="text-lg font-black text-white">{{ displayName }}</p></div>
            </section>
          </div>
        </Transition>
            <h1 class="mt-3 text-4xl font-black tracking-normal sm:text-5xl">{{ copy.profile.greeting.replace('{name}', displayName) }}</h1>
            <p class="mt-3 text-lg text-stone-600">{{ copy.profile.subtitle }}</p>
          </div>
          <RouterLink to="/cvs" class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 sm:w-fit"><Plus :size="18" />{{ copy.profile.createCv }}</RouterLink>
        </header>

        <div class="mt-8 grid min-w-0 gap-5 lg:grid-cols-[3fr_8fr]">
          <aside class="min-w-0 space-y-5">
            <section class="min-w-0 rounded-lg border border-stone-300 bg-white p-5 shadow-sm sm:p-6">
              <div class="flex items-center gap-4"><div class="relative h-16 w-16 shrink-0"><span class="absolute -inset-1 rounded-full border-2 border-emerald-200" :class="isUploadingPhoto ? 'animate-ping' : ''"></span><button v-if="session?.photoUrl" class="relative grid h-16 w-16 overflow-hidden rounded-full bg-emerald-900 text-xl font-black text-white ring-4 ring-white transition duration-300 hover:scale-105 hover:ring-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800" type="button" :aria-label="`Ver foto de perfil de ${displayName}`" title="Ver foto de perfil" @click="openPhotoPreview"><img :src="session.photoUrl" :alt="displayName" class="h-full w-full object-cover" /></button><div v-else class="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-emerald-900 text-xl font-black text-white ring-4 ring-white"><span>{{ accountInitial }}</span></div><span v-if="isUploadingPhoto" class="absolute inset-0 z-10 grid place-items-center rounded-full bg-emerald-950/70"><LoaderCircle :size="25" class="animate-spin text-white" aria-label="Subiendo foto" /></span><button class="absolute -bottom-1 -right-1 z-20 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-emerald-700 text-white shadow-md transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:cursor-wait" type="button" :disabled="isUploadingPhoto" aria-label="Editar foto de perfil" title="Editar foto de perfil" @click="openPhotoPicker"><Pencil :size="14" /></button><input ref="photoInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" @change="uploadProfilePhoto" /></div><div class="min-w-0"><h2 class="truncate text-lg font-black">{{ displayName }}</h2><p class="truncate text-sm text-stone-600">{{ session?.email }}</p><button class="mt-1 inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 transition hover:text-emerald-950 disabled:opacity-60" type="button" :disabled="isUploadingPhoto" @click="openPhotoPicker"><Camera :size="13" aria-hidden="true" />{{ isUploadingPhoto ? 'Subiendo foto...' : 'Editar foto' }}</button></div></div>
              <p v-if="photoError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ photoError }}</p>
              <div class="mt-6 border-t border-stone-200 pt-5"><p class="flex items-center gap-2 text-sm font-semibold text-stone-600"><Mail :size="16" class="text-emerald-800" />{{ copy.profile.emailVerified }}</p></div>
            </section>
            <section class="rounded-lg bg-emerald-950 p-6 text-white shadow-xl shadow-emerald-950/20">
              <div class="flex items-center justify-between"><p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-200">{{ copy.profile.completion }}</p><Sparkles :size="20" class="text-amber-300" /></div>
              <p class="mt-4 text-sm leading-6 text-emerald-50">{{ copy.profile.completionText }}</p>
              <div class="mt-6 h-2 overflow-hidden rounded-full bg-emerald-900"><div class="h-full w-4/5 rounded-full bg-amber-300"></div></div>
            </section>
            <section class="rounded-lg border border-stone-300 bg-white p-5 shadow-sm"><div class="flex items-center gap-3"><span class="grid h-9 w-9 place-items-center rounded-md bg-emerald-50 text-emerald-900"><KeyRound :size="18" /></span><h2 class="font-black">{{ copy.profile.security }}</h2></div><RouterLink v-if="session?.isSuperAdmin" to="/admin" class="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-3 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-800"><ShieldCheck :size="17" />Administración</RouterLink><button class="mt-4 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm font-extrabold text-stone-800 hover:border-emerald-800 hover:text-emerald-900" type="button" @click="openPasswordModal">{{ copy.profile.updatePassword }}</button><button class="mt-2 w-full rounded-md border border-red-200 px-3 py-2.5 text-sm font-extrabold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70" type="button" :disabled="isLoggingOutAll" @click="logoutAll"><LogOut :size="16" class="mr-1 inline" />{{ isLoggingOutAll ? copy.profile.processing : copy.profile.logoutAll }}</button></section>
          </aside>

          <section class="min-w-0 rounded-lg border border-stone-300 bg-white p-5 shadow-sm sm:p-7">
            <div class="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4"><div class="min-w-0"><p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">{{ copy.profile.documents }}</p><h2 class="mt-1 text-2xl font-black">{{ copy.profile.documentsText }}</h2></div><RouterLink to="/cvs" class="text-sm font-extrabold text-emerald-800 hover:text-emerald-950">{{ copy.workspace.cvs }}</RouterLink></div>
            <p v-if="downloadError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ downloadError }}</p>
            <div class="mt-6 divide-y divide-stone-200 border-y border-stone-200">
              <div v-for="document in cvDocuments" :key="document.id" class="flex min-w-0 flex-col items-stretch gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><RouterLink to="/editor" class="flex min-w-0 flex-1 items-center gap-3 transition hover:text-emerald-900" @click="cvStore.selectCv(document.id)"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-800"><FileText :size="19" /></span><span class="min-w-0"><strong class="block truncate">{{ document.name }}</strong><span class="mt-1 block text-sm text-stone-500">CV</span></span></RouterLink><div class="flex shrink-0 items-center justify-end gap-1"><button class="grid h-10 w-10 place-items-center rounded-md text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60" type="button" :disabled="downloadingDocumentId !== null" :aria-label="`Descargar ${document.name} en PDF`" :title="`Descargar ${document.name} en PDF`" @click="openPdfLanguageDialog(document)"><Download v-if="downloadingDocumentId !== document.id" :size="18" /><span v-else class="text-xs font-extrabold">...</span></button><button class="grid h-10 w-10 place-items-center rounded-md text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60" type="button" :disabled="downloadingDocumentId !== null" :aria-label="copy.editor.sendEmail" :title="copy.editor.sendEmail" @click="openEmailDialog(document)"><Mail :size="18" /></button><RouterLink to="/editor" class="grid h-10 w-10 place-items-center rounded-md text-stone-600 transition hover:bg-stone-100 hover:text-emerald-900" :aria-label="`Editar ${document.name}`" :title="`Editar ${document.name}`" @click="cvStore.selectCv(document.id)"><ArrowRight :size="18" /></RouterLink></div></div>
              <div v-if="!cvDocuments.length" class="py-8 text-center"><FileText :size="25" class="mx-auto text-stone-400" /><p class="mt-3 font-bold text-stone-700">Aun no tienes CVs</p><RouterLink to="/cvs" class="mt-3 inline-flex text-sm font-extrabold text-emerald-800 hover:text-emerald-950">Crear mi primer CV</RouterLink></div>
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-2">
              <RouterLink to="/portfolios" class="flex items-center justify-between gap-3 rounded-md border border-stone-200 p-4 transition hover:border-emerald-700 hover:bg-emerald-50"><span class="flex items-center gap-3"><FolderKanban :size="19" class="text-emerald-800" /><span><strong class="block text-sm">Portafolios</strong><span class="text-sm text-stone-500">Organiza tus proyectos</span></span></span><ArrowRight :size="17" /></RouterLink>
              <RouterLink to="/cover-letter" class="flex items-center justify-between gap-3 rounded-md border border-stone-200 p-4 transition hover:border-emerald-700 hover:bg-emerald-50"><span class="flex items-center gap-3"><FileText :size="19" class="text-emerald-800" /><span><strong class="block text-sm">Cover letter</strong><span class="text-sm text-stone-500">Prepara tu carta</span></span></span><ArrowRight :size="17" /></RouterLink>
            </div>
          </section>
        </div>

      </div>
    </section>
    <div v-if="isPasswordModalOpen" class="fixed inset-0 z-50 grid place-items-center bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="password-modal-title" @click.self="isPasswordModalOpen = false"><section class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl sm:p-8"><button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900" type="button" aria-label="Cerrar" title="Cerrar" @click="isPasswordModalOpen = false">&times;</button><span class="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-emerald-900"><KeyRound :size="21" /></span><h2 id="password-modal-title" class="mt-5 text-2xl font-black">Cambiar contrasena</h2><p class="mt-2 text-sm leading-6 text-stone-600">Elige una contrasena nueva para proteger tu cuenta.</p><form novalidate class="mt-6 space-y-4" @submit.prevent="updatePassword"><label class="block text-sm font-bold text-stone-700">Contrasena actual<input v-model="passwordForm.currentPassword" type="password" autocomplete="current-password" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label><label class="block text-sm font-bold text-stone-700">Nueva contrasena<input v-model="passwordForm.password" type="password" autocomplete="new-password" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label><label class="block text-sm font-bold text-stone-700">Confirmar contrasena<input v-model="passwordForm.passwordConfirmation" type="password" autocomplete="new-password" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label><p v-if="passwordError" class="text-sm font-semibold text-red-700" role="alert">{{ passwordError }}</p><button class="inline-flex w-full items-center justify-center rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="isUpdatingPassword">{{ isUpdatingPassword ? 'Actualizando...' : 'Actualizar contrasena' }}</button></form></section></div>
    <div v-if="selectedDownloadDocument" class="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-stone-950/45 p-4" role="dialog" aria-modal="true" :aria-label="copy.editor.downloadLanguageTitle" @click.self="selectedDownloadDocument = null">
      <section class="w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl sm:p-6">
        <h2 class="text-xl font-black text-stone-950">{{ copy.editor.downloadLanguageTitle }}</h2>
        <p class="mt-2 text-sm text-stone-600">{{ copy.editor.downloadLanguageText }}</p>
        <select v-model="pdfLanguage" class="mt-5 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-bold text-stone-900"><option value="es">Español</option><option value="en">English</option></select>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700" type="button" @click="selectedDownloadDocument = null">{{ copy.editor.cancel }}</button><button class="rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-extrabold text-white" type="button" @click="downloadPdf()">{{ copy.editor.confirmDownload }}</button></div>
      </section>
    </div>
    <div v-if="selectedEmailDocument" class="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="email-dialog-title" @click.self="selectedEmailDocument = null">
      <form novalidate class="my-auto w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl sm:p-6" @submit.prevent="sendCvByEmail">
        <div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800"><Mail :size="20" /></span><h2 id="email-dialog-title" class="text-xl font-black text-stone-950">{{ copy.editor.emailTitle }}</h2></div>
        <label class="mt-5 block text-sm font-bold text-stone-700">{{ copy.editor.recipientEmail }}<EmailRecipientsInput v-model="emailForm.recipientEmails" :owner-email="session?.email" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ copy.editor.emailSubject }}<input v-model.trim="emailForm.subject" maxlength="255" required class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ copy.editor.emailMessage }}<textarea v-model.trim="emailForm.body" rows="5" maxlength="10000" required class="mt-2 w-full resize-y rounded-md border border-stone-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ copy.editor.emailLanguage }}<select v-model="emailForm.language" class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-bold text-stone-900"><option value="es">Español</option><option value="en">English</option></select></label>
        <p v-if="emailError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ emailError }}</p>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700" type="button" :disabled="isSendingEmail" @click="selectedEmailDocument = null">{{ copy.editor.cancel }}</button><button class="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="isSendingEmail"><Mail :size="17" />{{ isSendingEmail ? copy.editor.sendingEmail : copy.editor.sendEmailConfirm }}</button></div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.photo-preview-enter-active,
.photo-preview-leave-active {
  transition: opacity 240ms ease;
}

.photo-preview-enter-active section,
.photo-preview-leave-active section {
  transition: transform 320ms cubic-bezier(0.16, 1, 0.3, 1), opacity 240ms ease;
}

.photo-preview-enter-from,
.photo-preview-leave-to {
  opacity: 0;
}

.photo-preview-enter-from section,
.photo-preview-leave-to section {
  opacity: 0;
  transform: scale(0.9) translateY(1rem);
}

.password-setup-mode [aria-labelledby='password-modal-title'] form > label:first-child {
  display: none;
}
</style>
