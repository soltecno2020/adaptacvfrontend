<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Check } from '@lucide/vue'
import { getPortfolioEditorMessages } from '../../src/config/portfolioEditorLocales'
import { createCvPdfBlob, getCvPdfFileName } from '../../src/utils/cvPdf'
import { populatePortfolioExperience } from '../../src/utils/portfolioExperience'
import { populatePortfolioCareTemplate } from '../../src/utils/portfolioCareTemplate'
import { populatePortfolioProjects } from '../../src/utils/portfolioProjects'
import { localizePortfolioTemplate } from '../../src/utils/portfolioTemplateLocalization'

const route = useRoute()
const config = useRuntimeConfig()
const portfolio = ref(null)
const templateSource = ref('')
const error = ref('')
const isLoading = ref(true)
const cvDownloadUrl = ref('')
const cvDownloadName = ref('')
const previewFrame = ref(null)
const isMessageDialogOpen = ref(false)
const isSendingMessage = ref(false)
const messageError = ref('')
const messageSuccess = ref('')
const messageForm = ref({ subject: '', message: '' })
let messageSuccessTimer
const portfolioAssetOrigin = new URL(config.public.apiBaseUrl).origin
const isPortfolioAssetUrl = (value) => {
  const url = String(value || '')
  if (/^\/?storage\/portfolio-assets\//.test(url)) return true
  try {
    const parsed = new URL(url)
    return /^\/storage\/portfolio-assets\//.test(parsed.pathname)
  } catch {
    return false
  }
}
const getPortfolioAssetUrl = (value) => {
  if (!isPortfolioAssetUrl(value)) return ''
  const path = String(value).replace(/^https?:\/\/[^/]+/i, '')
  return new URL(path, portfolioAssetOrigin).href
}

const templateId = computed(() => portfolio.value?.template_id || portfolio.value?.templateId || 'minimalist')
const templateUrl = computed(() => `/portfolio-templates/${templateId.value}/code.html`)
const portfolioLanguage = computed(() => {
  const language = portfolio.value?.content?.theme?.language
  if (['es', 'en', 'pt-BR'].includes(language)) return language
  return ['es', 'en', 'pt-BR'].includes(portfolio.value?.locale) ? portfolio.value.locale : 'es'
})
const conversationCopy = computed(() => getPortfolioEditorMessages(portfolioLanguage.value).conversation)

function getBlocks() {
  const content = portfolio.value?.content || {}
  return [
    ...(content.blocks || []),
    ...(content.sections || []).flatMap((section) => section.blocks || []),
  ]
}

function getSection(sectionId) {
  return portfolio.value?.content?.sections?.find((section) => section.id === sectionId)
}

function getBlock(type) {
  return getBlocks().find((block) => block.type === type && !block.data?.role && block.enabled !== false)?.data || {}
}

function getMenuBlock(role) {
  return getBlocks().find((block) => block.data?.role === role && block.enabled !== false)?.data || {}
}

function getCoverBlock(role) {
  return getBlocks().find((block) => block.data?.role === role)?.data || {}
}

function getProjects() {
  return getBlocks().filter((block) => block.data?.role === 'project')
}

function getConversationBlock() {
  return getBlocks().find((block) => block.data?.role === 'conversation')?.data || {}
}

function getFooterBlock(role) {
  return getBlocks().find((block) => block.data?.role === role)
}

function projectCopy() {
  const copies = {
    es: { untitled: 'Proyecto sin título', explore: 'Explorar proyecto', description: 'Descripción del proyecto', architecture: 'Arquitectura y solución', stack: 'Tecnologías', demoAccess: 'Acceso de demostración', demoUsername: 'Usuario', demoPassword: 'Contraseña', liveDemo: 'Ver demo en vivo', sourceCode: 'Código fuente' },
    en: { untitled: 'Untitled project', explore: 'Explore project', description: 'Project description', architecture: 'Architecture and solution', stack: 'Technologies', demoAccess: 'Demo access', demoUsername: 'Username', demoPassword: 'Password', liveDemo: 'View live demo', sourceCode: 'Source code' },
    'pt-BR': { untitled: 'Projeto sem título', explore: 'Explorar projeto', description: 'Descrição do projeto', architecture: 'Arquitetura e solução', stack: 'Tecnologias', demoAccess: 'Acesso à demonstração', demoUsername: 'Usuário', demoPassword: 'Senha', liveDemo: 'Ver demo ao vivo', sourceCode: 'Código-fonte' },
  }
  return copies[portfolioLanguage.value] || copies.es
}

function populateProjects(document) {
  const shouldShowProjects = getSection('projects')?.enabled !== false && portfolio.value?.content?.theme?.showProjects !== false
  const projectsSection = document.querySelector('[data-portfolio-section="projects"]')
  if (projectsSection) projectsSection.hidden = !shouldShowProjects
  document.querySelectorAll('a[href="#proyectos"]').forEach((element) => { element.hidden = !shouldShowProjects })
  populatePortfolioProjects(document, getProjects(), projectCopy(), portfolioAssetOrigin, shouldShowProjects)
}

function populateExperience(document) {
  const shouldShowExperience = getSection('experience-capabilities')?.enabled !== false
  const experienceSection = document.querySelector('[data-portfolio-section="experience-capabilities"]')
  if (experienceSection) experienceSection.hidden = !shouldShowExperience
  document.querySelectorAll('a[href="#stack-y-experiencia"]').forEach((element) => { element.hidden = !shouldShowExperience })
  populatePortfolioExperience(document, getBlocks().filter((block) => ['experience-intro', 'capabilities-heading', 'capability', 'experience-heading', 'experience', 'experience-cv'].includes(block.data?.role)), getPortfolioEditorMessages(portfolioLanguage.value).experience, { url: cvDownloadUrl.value, name: cvDownloadName.value })
}

function populateConversation(document) {
  const conversation = getConversationBlock()
  const setText = (field, value) => {
    const element = document.querySelector(`[data-portfolio-field="${field}"]`)
    if (element && value) element.textContent = value
  }
  setText('conversation-eyebrow', conversation.eyebrow)
  setText('conversation-title', conversation.heading)
  setText('conversation-description', conversation.description)
  setText('conversation-action', conversation.actionLabel)
  setText('conversation-email', portfolio.value?.user?.email || '')

  document.querySelectorAll('[data-portfolio-block="conversation"]').forEach((element) => {
    element.hidden = getBlocks().find((block) => block.data?.role === 'conversation')?.enabled === false
  })
}

function populateFooter(document) {
  const identityBlock = getFooterBlock('footer-identity')
  const channelsBlock = getFooterBlock('footer-channels')
  const contactBlock = getFooterBlock('footer-contact')
  const identity = identityBlock?.data || {}
  const channels = channelsBlock?.data || {}
  const contact = contactBlock?.data || {}
  const setText = (field, value) => {
    const element = document.querySelector(`[data-portfolio-field="${field}"]`)
    if (element && value) element.textContent = value
  }

  setText('footer-brand', identity.brand)
  setText('footer-name', identity.name || portfolio.value?.user?.name || '')
  setText('footer-summary', identity.summary)
  setText('footer-location', identity.location)
  setText('footer-channels-title', channels.heading)
  const legacyChannels = [
    { label: 'GitHub', url: channels.githubUrl },
    { label: 'LinkedIn', url: channels.linkedinUrl },
    { label: 'Read.cv', url: channels.readcvUrl },
    { label: 'X / Twitter', url: channels.twitterUrl },
  ]
  const channelItems = Array.isArray(channels.channels) ? channels.channels : legacyChannels
  const channelsList = document.querySelector('[data-portfolio-field="footer-channels-list"]') || document.querySelector('[data-portfolio-field="footer-github"]')?.parentElement
  if (templateId.value !== 'babysitter-housekeeping' && channelsList) {
    channelsList.replaceChildren(...channelItems.map((channel) => {
      const link = document.createElement('a')
      link.className = 'font-body-md text-body-md text-on-surface hover:text-primary transition-colors flex items-center gap-space-xs'
      link.textContent = channel.label || ''
      if (/^https?:\/\//i.test(channel.url || '')) {
        link.href = channel.url
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
      }
      const icon = document.createElement('span')
      icon.className = 'material-symbols-outlined text-sm'
      icon.textContent = 'arrow_outward'
      link.append(icon)
      return link
    }))
  }
  setText('footer-contact-title', contact.title)
  setText('footer-contact-description', contact.description)
  setText('footer-email', portfolio.value?.user?.email || '')
  const email = document.querySelector('[data-portfolio-field="footer-email"]')
  if (email && portfolio.value?.user?.email) email.href = `mailto:${portfolio.value.user.email}`

  for (const [role, block] of [['footer-identity', identityBlock], ['footer-channels', channelsBlock], ['footer-contact', contactBlock]]) {
    document.querySelectorAll(`[data-portfolio-block="${role}"]`).forEach((element) => {
      element.hidden = block?.enabled === false
    })
  }
}

function openMessageDialog(initialMessage = {}) {
  messageError.value = ''
  messageSuccess.value = ''
  messageForm.value = { subject: initialMessage.subject || '', message: initialMessage.message || '' }
  isMessageDialogOpen.value = true
}

function wireConversationAction(document) {
  document?.querySelectorAll('[data-portfolio-action="conversation-open"]').forEach((action) => {
    if (action.dataset.adaptacvBound) return
    action.dataset.adaptacvBound = 'true'
    action.addEventListener('click', (event) => {
      event.preventDefault()
      openMessageDialog()
    })
  })

  const inquiryForm = document.querySelector('#inquiry-form')
  if (inquiryForm && !inquiryForm.dataset.adaptacvBound) {
    inquiryForm.dataset.adaptacvBound = 'true'
    inquiryForm.addEventListener('submit', (event) => {
      event.preventDefault()
      const [name, email] = Array.from(inquiryForm.querySelectorAll('input'))
      const [region, scope] = Array.from(inquiryForm.querySelectorAll('select'))
      const message = [
        `Name: ${name?.value || ''}`,
        `Email: ${email?.value || ''}`,
        `Location: ${region?.selectedOptions?.[0]?.textContent || ''}`,
        `Support: ${scope?.selectedOptions?.[0]?.textContent || ''}`,
      ].filter((line) => !line.endsWith(': ')).join('\n').slice(0, 400)
      const inquiry = getBlocks().find((block) => block.data?.role === 'care-inquiry')?.data || {}
      openMessageDialog({ subject: inquiry.title || 'Care service inquiry', message })
    })
  }
}

function initializePreview(document) {
  if (!document) return
  populateProjects(document)
  wireConversationAction(document)
}

async function sendMessage() {
  const subject = messageForm.value.subject.trim()
  const message = messageForm.value.message.trim()
  const hasLink = /https?:\/\/|www\./i.test(`${subject}\n${message}`)
  if (!subject || !message || hasLink || message.length > 400) {
    messageError.value = conversationCopy.value.invalid
    return
  }

  isSendingMessage.value = true
  messageError.value = ''
  try {
    const apiBaseUrl = config.public.apiBaseUrl.replace(/\/$/, '')
    await $fetch(`${apiBaseUrl}/v1/public/portfolios/${encodeURIComponent(route.params.slug)}/messages`, {
      method: 'POST',
      body: { subject, message },
    })
    messageForm.value = { subject: '', message: '' }
    isMessageDialogOpen.value = false
    messageSuccess.value = conversationCopy.value.sent
    window.clearTimeout(messageSuccessTimer)
    messageSuccessTimer = window.setTimeout(() => { messageSuccess.value = '' }, 4500)
  } catch (requestError) {
    messageError.value = requestError?.data?.message || conversationCopy.value.failed
  } finally {
    isSendingMessage.value = false
  }
}

async function prepareCvDownload() {
  const cvId = getCoverBlock('actions').cvId
  const publicCv = portfolio.value?.user?.cv
  const cv = String(publicCv?.id) === String(cvId)
    ? publicCv
    : portfolio.value?.user?.cvs?.find((item) => String(item.id) === String(cvId))
  if (!cv) return

  const blob = await createCvPdfBlob(cv, portfolioLanguage.value)
  cvDownloadUrl.value = URL.createObjectURL(blob)
  cvDownloadName.value = getCvPdfFileName(cv)
}

function populateCover(document) {
  const intro = getCoverBlock('intro')
  const specialties = getCoverBlock('specialties')
  const actions = getCoverBlock('actions')
  const profile = getCoverBlock('profile')
  const metrics = getCoverBlock('metrics')
  const terminal = getCoverBlock('terminal')
  const setText = (field, value) => {
    const element = document.querySelector(`[data-portfolio-field="${field}"]`)
    if (element && value) element.textContent = value
  }

  setText('hero-eyebrow', intro.eyebrow)
  setText('hero-specialty-first', specialties.first)
  setText('hero-specialty-second', specialties.second)
  setText('hero-specialty-third', specialties.third)
  setText('hero-primary-action', actions.primaryLabel)
  setText('hero-secondary-action', actions.secondaryLabel)

  const cvDownload = document.querySelector('[data-portfolio-action="cv-download"]')
  if (cvDownload) {
    if (cvDownloadUrl.value) {
      cvDownload.href = cvDownloadUrl.value
      cvDownload.download = cvDownloadName.value
      cvDownload.removeAttribute('aria-disabled')
    } else {
      cvDownload.removeAttribute('href')
      cvDownload.setAttribute('aria-disabled', 'true')
    }
  }
  setText('hero-profile-status', profile.status)
  setText('hero-profile-performance', profile.performance)
  setText('hero-metric-first-value', metrics.firstValue)
  setText('hero-metric-first-label', metrics.firstLabel)
  setText('hero-metric-second-value', metrics.secondValue)
  setText('hero-metric-second-label', metrics.secondLabel)
  setText('hero-metric-third-value', metrics.thirdValue)
  setText('hero-metric-third-label', metrics.thirdLabel)
  setText('hero-terminal-branch', terminal.branch)
  setText('hero-terminal-precision', terminal.precision)
  setText('hero-terminal-fps', terminal.fps)

  const profileImage = document.querySelector('[data-portfolio-field="hero-image"]')
  if (profileImage && isPortfolioAssetUrl(profile.imageUrl)) profileImage.src = getPortfolioAssetUrl(profile.imageUrl)

  for (const block of getSection('cover')?.blocks || []) {
    if (!block.data?.role) continue
    document.querySelectorAll(`[data-portfolio-block="${block.data.role}"]`).forEach((element) => {
      element.hidden = block.enabled === false
    })
  }
}

function populateMenu(document) {
  const header = document.querySelector('header')
  if (!header) return

  const logo = getMenuBlock('logo')
  const identity = getMenuBlock('identity')
  const availability = getMenuBlock('availability')
  const avatar = getMenuBlock('avatar')
  const logoElement = header.querySelector('[aria-label="AdaptaCV"]')
  if (logoElement && logo.text) logoElement.textContent = logo.text

  const identityLink = header.querySelector('a[data-path="dossier-&-bio"]')
  const identityElements = Array.from((identityLink || logoElement?.nextElementSibling)?.querySelectorAll('div.flex.flex-col span') || [])
  if (identityElements[0]) identityElements[0].textContent = identity.text || portfolio.value?.user?.name || portfolio.value?.name || ''
  if (identityElements[1]) identityElements[1].textContent = identity.subtitle || ''

  const availabilityElement = Array.from(header.querySelectorAll('span')).find((element) => /disponible|available/i.test(element.textContent))
  if (availabilityElement && availability.text) availabilityElement.textContent = availability.text

  const avatarElement = Array.from(header.querySelectorAll('img')).find((element) => !element.closest('[aria-label="AdaptaCV"]')) || header.querySelector('img')
  if (avatarElement) {
    avatarElement.src = getPortfolioAssetUrl(avatar.imageUrl) || `/portfolio-templates/${templateId.value}/profile-avatar.svg`
    avatarElement.alt = `Retrato de ${portfolio.value?.user?.name || portfolio.value?.name || ''}`
  }
}

function setSectionContent(document, sectionId, block) {
  if (!block || !Object.keys(block).length) return
  const section = document.querySelector(`[data-portfolio-section="${sectionId}"]`)
  if (!section) return
  const title = section.querySelector('h2')
  const summary = section.querySelector('p')
  if (title && (block.title || block.headline)) title.textContent = block.title || block.headline
  if (summary && (block.summary || block.body || block.subtitle)) summary.textContent = block.summary || block.body || block.subtitle
}

const renderedTemplate = computed(() => {
  if (!templateSource.value || !portfolio.value || !import.meta.client) return ''
  const document = new DOMParser().parseFromString(templateSource.value, 'text/html')
  localizePortfolioTemplate(document, portfolioLanguage.value)
  populateMenu(document)
  populateCover(document)
  populateProjects(document)
  populateExperience(document)
  populateConversation(document)
  populateFooter(document)
  if (templateId.value === 'babysitter-housekeeping') populatePortfolioCareTemplate(document, getBlocks(), portfolio.value?.user?.email || '', portfolio.value?.user?.name || '')
  const intro = getCoverBlock('intro')
  const hero = Object.keys(intro).length ? intro : getBlock('hero')
  const profile = getCoverBlock('profile')
  const fallbackName = portfolio.value.name || 'Tu nombre'
  const name = hero.name || portfolio.value?.user?.name || fallbackName
  const headline = hero.headline || (templateId.value === 'babysitter-housekeeping' ? '' : hero.title || '')
  const summary = hero.summary || hero.body || hero.subtitle || ''
  const image = getPortfolioAssetUrl(profile.imageUrl) || portfolio.value.cover_image_url || portfolio.value.coverImageUrl || `/portfolio-templates/${templateId.value}/profile-avatar.svg`
  const setText = (field, value) => {
    const element = document.querySelector(`[data-portfolio-field="${field}"]`)
    if (element && value) element.textContent = value
  }

  setText('hero-name', name)
  setText('hero-headline', headline)
  setText('hero-summary', summary)
  const heroImage = document.querySelector('[data-portfolio-field="hero-image"]')
  if (heroImage && image) {
    heroImage.src = image
    heroImage.alt = `Retrato de ${name}`
  }

  setSectionContent(document, 'projects', getBlock('projects'))
  setSectionContent(document, 'experience-capabilities', getBlock('experience'))
  setSectionContent(document, 'conversation', getBlock('conversation'))
  setSectionContent(document, 'conversation', getBlock('contact'))
  setSectionContent(document, 'cover', getBlock('about'))

  return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`
})

onMounted(async () => {
  try {
    const apiBaseUrl = config.public.apiBaseUrl.replace(/\/$/, '')
    const response = await $fetch(`${apiBaseUrl}/v1/public/portfolios/${encodeURIComponent(route.params.slug)}`)
    const data = response?.success === true ? response.data : response
    portfolio.value = data?.portfolio || data
    if (!portfolio.value?.id) throw new Error('El portafolio no está disponible.')
    await Promise.all([
      prepareCvDownload(),
      $fetch(templateUrl.value, { responseType: 'text' }).then((source) => { templateSource.value = source }),
    ])
  } catch (requestError) {
    error.value = requestError?.data?.message || requestError.message || 'No fue posible cargar este portafolio.'
  } finally {
    isLoading.value = false
  }
})

onBeforeUnmount(() => {
  if (cvDownloadUrl.value) URL.revokeObjectURL(cvDownloadUrl.value)
  window.clearTimeout(messageSuccessTimer)
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f3eb] text-stone-950">
    <div v-if="isLoading" class="grid min-h-screen place-items-center text-sm font-semibold text-stone-600">Cargando portafolio...</div>
    <div v-else-if="error" class="grid min-h-screen place-items-center px-6 text-center"><div><h1 class="text-2xl font-black">Portafolio no disponible</h1><p class="mt-3 text-stone-600">{{ error }}</p></div></div>
    <iframe v-else ref="previewFrame" :srcdoc="renderedTemplate" :title="portfolio.name" class="block min-h-screen w-full border-0 bg-white" @load="initializePreview(previewFrame?.contentDocument)" />
    <div v-if="isMessageDialogOpen" class="fixed inset-0 z-50 grid place-items-center bg-stone-950/50 p-4" role="dialog" aria-modal="true" :aria-label="conversationCopy.modalTitle" @click.self="isMessageDialogOpen = false">
      <form class="w-full max-w-lg bg-white p-6 shadow-2xl sm:p-8" @submit.prevent="sendMessage">
        <div class="flex items-start justify-between gap-4"><div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ conversationCopy.defaultEyebrow }}</p><h2 class="mt-1 text-2xl font-black text-stone-950">{{ conversationCopy.modalTitle }}</h2></div><button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 hover:bg-stone-100" type="button" :aria-label="conversationCopy.cancel" @click="isMessageDialogOpen = false">&times;</button></div>
        <label class="mt-6 block text-sm font-bold text-stone-700">{{ conversationCopy.subject }}<input v-model="messageForm.subject" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" maxlength="160" required /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ conversationCopy.message }}<textarea v-model="messageForm.message" class="mt-2 min-h-36 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" :placeholder="conversationCopy.messagePlaceholder" maxlength="400" required /></label>
        <p class="mt-2 text-right text-xs font-semibold text-stone-500">{{ messageForm.message.length }}/400</p><p class="mt-2 text-xs font-semibold text-stone-500">{{ conversationCopy.messageLimit }}</p>
        <p v-if="messageError" class="mt-4 text-sm font-bold text-red-700">{{ messageError }}</p>
        <div class="mt-6 flex justify-end gap-3"><button class="px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-100" type="button" @click="isMessageDialogOpen = false">{{ conversationCopy.cancel }}</button><button class="bg-emerald-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60" :disabled="isSendingMessage" type="submit">{{ conversationCopy.send }}</button></div>
      </form>
    </div>
    <Transition name="toast"><div v-if="messageSuccess" class="fixed right-4 top-4 z-[60] flex max-w-sm items-center gap-3 border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-950 shadow-xl shadow-emerald-950/10 sm:right-6 sm:top-6" role="status"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-800 text-white"><Check :size="17" /></span><span>{{ messageSuccess }}</span></div></Transition>
  </main>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>