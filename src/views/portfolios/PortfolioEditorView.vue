<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowLeft, BarChart3, Check, ChevronDown, ChevronUp, Clock3, ExternalLink, Eye, EyeOff, GripVertical, ImagePlus, LayoutPanelTop, LoaderCircle, Plus, RotateCcw, Save, Send, Settings2, Trash2, Upload, X } from '@lucide/vue'
import WorkspaceNav from '../../components/navigation/WorkspaceNav.vue'
import PortfolioGeoMap from '../../components/portfolios/PortfolioGeoMap.vue'
import { getPortfolioEditorMessages } from '../../config/portfolioEditorLocales'
import { useAuthStore } from '../../stores/authStore'
import { useCvStore } from '../../stores/cvStore'
import { useLocaleStore } from '../../stores/localeStore'
import { usePortfolioStore } from '../../stores/portfolioStore'
import { populatePortfolioExperience } from '../../utils/portfolioExperience'
import { populatePortfolioCareTemplate } from '../../utils/portfolioCareTemplate'
import { populatePortfolioProjects } from '../../utils/portfolioProjects'
import { localizePortfolioTemplate } from '../../utils/portfolioTemplateLocalization'

const props = defineProps({ portfolioId: { type: [String, Number], required: true } })

const authStore = useAuthStore()
const cvStore = useCvStore()
const localeStore = useLocaleStore()
const portfolioStore = usePortfolioStore()
const editorCopy = computed(() => getPortfolioEditorMessages(localeStore.locale))
const portfolioLanguage = computed(() => portfolio.value?.content?.theme?.language || portfolio.value?.locale || 'es')
const portfolioCopy = computed(() => getPortfolioEditorMessages(portfolioLanguage.value))
const portfolio = ref(null)
const selectedBlockId = ref(null)
const isLoading = ref(true)
const loadError = ref('')
const saveState = ref('')
const heroUnavailableToast = ref('')
const isSettingsOpen = ref(false)
const isRevisionPanelOpen = ref(false)
const isPreviewOpen = ref(false)
const isMetricsOpen = ref(false)
const portfolioReport = ref(null)
const portfolioReportError = ref('')
const isLoadingPortfolioReport = ref(false)
const portfolioReportFrom = ref('')
const portfolioReportTo = ref('')
const geoReport = ref(null)
const geoReportError = ref('')
const isLoadingGeoReport = ref(false)
const selectedGeoCountryCode = ref('')
const revisions = ref([])
const isLoadingRevisions = ref(false)
const coverInput = ref(null)
const assetInput = ref(null)
const assetTarget = ref(null)
const isSynchronizingPortfolio = ref(false)
const templateSource = ref('')
const livePreviewHtml = ref('')
const editorPreviewFrame = ref(null)
const editorPreviewViewport = ref(null)
const fullscreenPreviewFrame = ref(null)
const expandedSectionId = ref('')
const newCapabilityTechnology = ref('')
const isIconPickerOpen = ref(false)
const iconPickerSkillIndex = ref(null)
const expandedSkillIndex = ref(null)
const expandedExperienceIndex = ref(null)
const expandedFooterChannelIndex = ref(null)
const editorPreviewScale = ref(1)
const editorPreviewFrameWidth = ref(1440)
const editorPreviewFrameHeight = ref(680)
let saveTimer
let isSavingPortfolio = false
let hasQueuedPortfolioSave = false
let heroUnavailableToastTimer
let previewResizeObserver

const capabilityIcons = [
  'code_blocks', 'terminal', 'language', 'data_object', 'storage', 'cloud', 'api', 'dns',
  'palette', 'brush', 'design_services', 'view_in_ar', 'speed', 'security', 'smartphone', 'account_tree',
]
const careEditorLabels = computed(() => ({
  es: { overview: 'Contenido del perfil', registry: 'Etiqueta profesional', availabilityLabel: 'Etiqueta de disponibilidad', legalFirst: 'Verificación o credencial 1', legalSecond: 'Verificación o credencial 2', rate: 'Tarifa', domainEyebrow: 'Etiqueta de servicios', domainTitle: 'Título de servicios', domainDescription: 'Descripción de servicios', childcareLabel: 'Pestaña de cuidado infantil', housekeepingLabel: 'Pestaña de housekeeping', testimonial: 'Recomendación', location: 'Ubicación o referencia', quote: 'Texto de la recomendación', rating: 'Calificación (1 a 5)', certifications: 'Confianza y certificaciones', eyebrow: 'Etiqueta', title: 'Título', description: 'Descripción', vaultText: 'Nota de referencias', certificate: 'Certificación', addCertificate: 'Agregar certificación', remove: 'Eliminar', icon: 'Icono', accreditationsTitle: 'Título de acreditaciones', accreditation: 'Acreditación', addAccreditation: 'Agregar acreditación', privacyFirst: 'Nota de privacidad 1', privacySecond: 'Nota de privacidad 2', inquiry: 'Formulario de consulta', nameLabel: 'Etiqueta del nombre', namePlaceholder: 'Ejemplo del nombre', emailLabel: 'Etiqueta del correo', emailPlaceholder: 'Ejemplo del correo', regionLabel: 'Etiqueta de ubicación', scopeLabel: 'Etiqueta del tipo de apoyo', submitLabel: 'Texto del botón', confirmationTitle: 'Título de confirmación', confirmationDescription: 'Mensaje de confirmación', securityLabel: 'Nota de privacidad', directLine: 'Teléfono de contacto', regions: 'Opciones de ubicación', scopes: 'Opciones de servicio', option: 'Opción', addOption: 'Agregar opción' },
  en: { overview: 'Profile content', registry: 'Professional label', availabilityLabel: 'Availability label', legalFirst: 'Credential or check 1', legalSecond: 'Credential or check 2', rate: 'Rate', domainEyebrow: 'Services label', domainTitle: 'Services title', domainDescription: 'Services description', childcareLabel: 'Childcare tab', housekeepingLabel: 'Housekeeping tab', testimonial: 'Testimonial', location: 'Location or reference', quote: 'Testimonial text', rating: 'Rating (1 to 5)', certifications: 'Trust and qualifications', eyebrow: 'Label', title: 'Title', description: 'Description', vaultText: 'References note', certificate: 'Qualification', addCertificate: 'Add qualification', remove: 'Remove', icon: 'Icon', accreditationsTitle: 'Accreditations title', accreditation: 'Accreditation', addAccreditation: 'Add accreditation', privacyFirst: 'Privacy note 1', privacySecond: 'Privacy note 2', inquiry: 'Inquiry form', nameLabel: 'Name label', namePlaceholder: 'Name example', emailLabel: 'Email label', emailPlaceholder: 'Email example', regionLabel: 'Location label', scopeLabel: 'Support type label', submitLabel: 'Button text', confirmationTitle: 'Confirmation title', confirmationDescription: 'Confirmation message', securityLabel: 'Privacy note', directLine: 'Contact phone', regions: 'Location options', scopes: 'Service options', option: 'Option', addOption: 'Add option' },
  'pt-BR': { overview: 'Conteúdo do perfil', registry: 'Etiqueta profissional', availabilityLabel: 'Etiqueta de disponibilidade', legalFirst: 'Verificação ou credencial 1', legalSecond: 'Verificação ou credencial 2', rate: 'Valor', domainEyebrow: 'Etiqueta de serviços', domainTitle: 'Título dos serviços', domainDescription: 'Descrição dos serviços', childcareLabel: 'Aba de cuidados infantis', housekeepingLabel: 'Aba de limpeza', testimonial: 'Recomendação', location: 'Local ou referência', quote: 'Texto da recomendação', rating: 'Avaliação (1 a 5)', certifications: 'Confiança e qualificações', eyebrow: 'Etiqueta', title: 'Título', description: 'Descrição', vaultText: 'Nota sobre referências', certificate: 'Qualificação', addCertificate: 'Adicionar qualificação', remove: 'Remover', icon: 'Ícone', accreditationsTitle: 'Título das credenciais', accreditation: 'Credencial', addAccreditation: 'Adicionar credencial', privacyFirst: 'Nota de privacidade 1', privacySecond: 'Nota de privacidade 2', inquiry: 'Formulário de contato', nameLabel: 'Etiqueta do nome', namePlaceholder: 'Exemplo do nome', emailLabel: 'Etiqueta do e-mail', emailPlaceholder: 'Exemplo do e-mail', regionLabel: 'Etiqueta da localização', scopeLabel: 'Etiqueta do tipo de apoio', submitLabel: 'Texto do botão', confirmationTitle: 'Título de confirmação', confirmationDescription: 'Mensagem de confirmação', securityLabel: 'Nota de privacidade', directLine: 'Telefone de contato', regions: 'Opções de localização', scopes: 'Opções de serviço', option: 'Opção', addOption: 'Adicionar opção' },
}[localeStore.locale] || {}))

const portfolioSections = [
  { id: 'menu', title: 'Menú', description: 'Navegación y etiqueta profesional.' },
  { id: 'cover', title: 'Portada', description: 'Presentación y contenido principal.' },
  { id: 'projects', title: 'Proyectos', description: 'Trabajo y casos destacados.' },
  { id: 'experience-capabilities', title: 'Trayectoria & Capacidades', description: 'Experiencia, habilidades y credenciales.' },
  { id: 'conversation', title: 'Inicia una conversación', description: 'Llamado a la acción y contacto.' },
  { id: 'footer', title: 'Footer', description: 'Cierre, enlaces y datos legales.' },
]
const optionalTechnicalSectionIds = new Set(['projects', 'experience-capabilities'])
const sections = computed(() => portfolio.value?.content?.sections || [])
const blocks = computed(() => sections.value.flatMap((section) => section.blocks || []))
const visibleBlocks = computed(() => blocks.value.filter((block) => portfolio.value?.templateId !== 'babysitter-housekeeping' || block.data?.role !== 'footer-channels'))
const selectedBlock = computed(() => blocks.value.find((block) => block.id === selectedBlockId.value) || null)
const selectedSection = computed(() => sections.value.find((section) => section.blocks?.some((block) => block.id === selectedBlockId.value)) || null)
const canRemoveSelectedBlock = computed(() => !selectedBlock.value?.data?.role || selectedBlock.value.data.role === 'project')
const isPublished = computed(() => portfolio.value?.status === 'published')
const statusLabel = computed(() => isPublished.value ? editorCopy.value.ui.published : editorCopy.value.ui.draft)
const templateLabel = computed(() => ({ minimalist: 'Minimalist', futuristic: 'Futuristic', chef: 'Chef Style', 'babysitter-housekeeping': 'Babysitter & Housekeeping' })[portfolio.value?.templateId] || portfolio.value?.templateId)
const templatePreviewUrl = computed(() => `/portfolio-templates/${portfolio.value?.templateId || 'minimalist'}/code.html`)
const publicPortfolioUrl = computed(() => {
  if (!portfolio.value?.slug) return ''
  return `${window.location.origin}/p/${encodeURIComponent(portfolio.value.slug)}`
})
const coverHeroes = computed(() => sections.value.find((section) => section.id === 'cover')?.blocks || [])
const heroBlock = computed(() => coverHeroes.value.find((block) => block.data?.role === 'intro') || coverHeroes.value.find((block) => block.type === 'hero') || { data: {} })
const portfolioAssetOrigin = new URL(useRuntimeConfig().public.apiBaseUrl).origin
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
const heroData = computed(() => ({
  name: heroBlock.value.data?.name || authStore.session?.name || portfolio.value?.name || editorCopy.value.ui.yourProfessionalName,
  headline: heroBlock.value.data?.headline || (portfolio.value?.templateId === 'babysitter-housekeeping' ? '' : editorCopy.value.defaults.professional),
  summary: heroBlock.value.data?.summary || heroBlock.value.data?.body || (portfolio.value?.templateId === 'babysitter-housekeeping' ? '' : editorCopy.value.defaults.summary),
  image: heroBlock.value.data?.imageUrl || portfolio.value?.content?.theme?.heroImageUrl || `/portfolio-templates/${portfolio.value?.templateId || 'minimalist'}/profile-avatar.svg`,
}))
const menuHeroes = computed(() => sections.value.find((section) => section.id === 'menu')?.blocks || [])
const cvDocuments = computed(() => cvStore.cvDocuments)
const projectBlocks = computed(() => sections.value.find((section) => section.id === 'projects')?.blocks || [])
const experienceBlocks = computed(() => sections.value.find((section) => section.id === 'experience-capabilities')?.blocks || [])
const footerBlocks = computed(() => sections.value.find((section) => section.id === 'footer')?.blocks || [])
const editorPreviewStyle = computed(() => ({
  width: `${editorPreviewFrameWidth.value}px`,
  height: `${editorPreviewFrameHeight.value}px`,
  transform: `scale(${editorPreviewScale.value})`,
  transformOrigin: 'top left',
}))
const portfolioReportMaxViews = computed(() => Math.max(...(portfolioReport.value?.daily || []).map((item) => item.views), 1))

function updateEditorPreviewScale() {
  const viewport = editorPreviewViewport.value
  if (!viewport || !import.meta.client) return
  const isMobile = window.innerWidth < 768
  const frameWidth = isMobile ? viewport.clientWidth : 1440
  const scale = isMobile ? 1 : Math.min(viewport.clientWidth / frameWidth, 1)
  editorPreviewFrameWidth.value = frameWidth
  editorPreviewScale.value = scale
  editorPreviewFrameHeight.value = Math.max(viewport.clientHeight / scale, 680)
}

function populateHero(document) {
  if (!document) return

  const coverHero = (role) => coverHeroes.value.find((block) => block.data?.role === role)
  const setText = (field, value) => {
    const element = document.querySelector(`[data-portfolio-field="${field}"]`)
    if (element) element.textContent = value ?? ''
  }

  const intro = coverHero('intro')?.data || heroData.value
  const specialties = coverHero('specialties')?.data || {}
  const actions = coverHero('actions')?.data || {}
  const profile = coverHero('profile')?.data || {}
  const metrics = coverHero('metrics')?.data || {}
  const terminal = coverHero('terminal')?.data || {}
  setText('hero-eyebrow', intro.eyebrow)
  setText('hero-name', heroData.value.name)
  setText('hero-headline', heroData.value.headline)
  setText('hero-summary', heroData.value.summary)
  setText('hero-specialty-first', specialties.first)
  setText('hero-specialty-second', specialties.second)
  setText('hero-specialty-third', specialties.third)
  setText('hero-primary-action', actions.primaryLabel)
  setText('hero-secondary-action', actions.secondaryLabel)
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
  const heroImage = document.querySelector('[data-portfolio-field="hero-image"]')
  if (heroImage) {
    heroImage.src = getPortfolioAssetUrl(profile.imageUrl) || heroData.value.image
    heroImage.alt = `Retrato de ${heroData.value.name}`
  }

  for (const block of coverHeroes.value) {
    document.querySelectorAll(`[data-portfolio-block="${block.data?.role}"]`).forEach((element) => {
      element.hidden = block.enabled === false
    })
  }

  const menu = document.querySelector('header')
  if (!menu) return
  const menuHero = (role) => menuHeroes.value.find((block) => block.data?.role === role)?.data
  const logo = menuHero('logo')
  const identity = menuHero('identity')
  const availability = menuHero('availability')
  const avatar = menuHero('avatar')
  const logoElement = menu.querySelector('[aria-label="AdaptaCV"]')
  if (logoElement) {
    logoElement.dataset.portfolioBlock = 'logo'
    if (logo?.text) logoElement.textContent = logo.text
  }
  const identityElements = menu.querySelectorAll('div.flex.flex-col span')
  const identityElement = identityElements[0]?.parentElement
  if (identityElement) identityElement.dataset.portfolioBlock = 'identity'
  if (identityElements[0]) identityElements[0].textContent = identity?.text || authStore.session?.name || heroData.value.name
  if (identityElements[1] && (identity?.subtitle || portfolio.value?.templateId === 'babysitter-housekeeping')) identityElements[1].textContent = identity?.subtitle || ''
  const availabilityElement = Array.from(menu.querySelectorAll('span')).find((element) => /DISPONIBLE|AVAILABLE|DISPONÍVEL/i.test(element.textContent))
  if (availabilityElement) {
    availabilityElement.dataset.portfolioBlock = 'availability'
    if (availability?.text) availabilityElement.textContent = availability.text
  }
  const avatarElement = Array.from(menu.querySelectorAll('img')).find((element) => !element.closest('[aria-label="AdaptaCV"]')) || menu.querySelector('img')
  if (avatarElement) {
    ;(avatarElement.parentElement || avatarElement).dataset.portfolioBlock = 'avatar'
    avatarElement.src = getPortfolioAssetUrl(avatar?.imageUrl) || heroData.value.image
    avatarElement.alt = `Retrato de ${heroData.value.name}`
  }
  const projectsSection = document.querySelector('[data-portfolio-section="projects"]')
  const projectsSectionModel = sections.value.find((section) => section.id === 'projects')
  const shouldShowProjects = projectsSectionModel?.enabled !== false
  if (projectsSection) projectsSection.hidden = !shouldShowProjects
  document.querySelectorAll('a[href="#proyectos"]').forEach((element) => { element.hidden = !shouldShowProjects })
  populatePortfolioProjects(document, projectBlocks.value, portfolioCopy.value.project, portfolioAssetOrigin, shouldShowProjects)
  const experienceSectionModel = sections.value.find((section) => section.id === 'experience-capabilities')
  const shouldShowExperience = experienceSectionModel?.enabled !== false
  const experienceSection = document.querySelector('[data-portfolio-section="experience-capabilities"]')
  if (experienceSection) experienceSection.hidden = !shouldShowExperience
  document.querySelectorAll('a[href="#stack-y-experiencia"]').forEach((element) => { element.hidden = !shouldShowExperience })
  populatePortfolioExperience(document, experienceBlocks.value, portfolioCopy.value.experience)
  const conversation = blocks.value.find((block) => block.data?.role === 'conversation')
  if (conversation) {
    setText('conversation-eyebrow', conversation.data.eyebrow)
    setText('conversation-title', conversation.data.heading)
    setText('conversation-description', conversation.data.description)
    setText('conversation-action', conversation.data.actionLabel)
    setText('conversation-email', authStore.session?.email || '')
  }
  const footerHero = (role) => blocks.value.find((block) => block.data?.role === role)
  const footerIdentity = footerHero('footer-identity')?.data
  const footerChannels = footerHero('footer-channels')?.data
  const footerContact = footerHero('footer-contact')?.data
  const footer = document.querySelector('footer')
  setText('footer-brand', footerIdentity?.brand)
  setText('footer-name', footerIdentity?.name || authStore.session?.name || '')
  setText('footer-summary', footerIdentity?.summary)
  setText('footer-location', footerIdentity?.location)
  if (footer && portfolio.value?.templateId !== 'babysitter-housekeeping' && !document.querySelector('[data-portfolio-field="footer-brand"]')) {
    const identity = [footerIdentity?.brand, footerIdentity?.name || authStore.session?.name, footerIdentity?.summary, footerIdentity?.location]
      .filter(Boolean)
      .join(' · ')
    const identityElement = footer.querySelector(':scope > div > div:last-child') || footer
    identityElement.textContent = identity
  }
  setText('footer-channels-title', footerChannels?.heading)
  const channelsList = document.querySelector('[data-portfolio-field="footer-channels-list"]')
    || document.querySelector('[data-portfolio-field="footer-github"]')?.parentElement
    || footer?.querySelector('a')?.parentElement
  if (portfolio.value?.templateId !== 'babysitter-housekeeping' && channelsList && Array.isArray(footerChannels?.channels)) {
    channelsList.replaceChildren(...footerChannels.channels.map((channel) => {
      const link = document.createElement('a')
      link.className = 'font-body-md text-body-md text-on-surface hover:text-primary transition-colors flex items-center gap-space-xs'
      link.textContent = channel.label || portfolioCopy.value.footer.untitledChannel
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
  setText('footer-contact-title', footerContact?.title)
  setText('footer-contact-description', footerContact?.description)
  setText('footer-email', authStore.session?.email || '')
  const footerEmail = document.querySelector('[data-portfolio-field="footer-email"]')
  if (footerEmail && authStore.session?.email) footerEmail.href = `mailto:${authStore.session.email}`
  for (const role of ['footer-identity', 'footer-channels', 'footer-contact']) {
    document.querySelectorAll(`[data-portfolio-block="${role}"]`).forEach((element) => {
      element.hidden = footerHero(role)?.enabled === false
    })
  }
  if (portfolio.value?.templateId === 'babysitter-housekeeping') populatePortfolioCareTemplate(document, blocks.value, authStore.session?.email || '', authStore.session?.name || '')
}

function createLivePreviewHtml() {
  if (!templateSource.value || !import.meta.client) return ''

  const document = new DOMParser().parseFromString(templateSource.value, 'text/html')
  localizePortfolioTemplate(document, portfolioLanguage.value)
  populateHero(document)

  return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`
}

function updateLiveHero() {
  populateHero(editorPreviewFrame.value?.contentDocument)
  populateHero(fullscreenPreviewFrame.value?.contentDocument)
  bindPreviewSelection(editorPreviewFrame.value?.contentDocument)
  bindPreviewSelection(fullscreenPreviewFrame.value?.contentDocument)
  highlightSelectedBlock(editorPreviewFrame.value?.contentDocument)
  highlightSelectedBlock(fullscreenPreviewFrame.value?.contentDocument)
}

function bindPreviewSelection(document) {
  if (!document || document.documentElement.dataset.adaptacvSelectionBound) return
  document.documentElement.dataset.adaptacvSelectionBound = 'true'
  document.addEventListener('click', (event) => {
    const link = event.target?.closest?.('a[href]')
    if (link) {
      event.preventDefault()
      const href = link.getAttribute('href') || ''
      const target = href.startsWith('#') && href.length > 1
        ? document.getElementById(decodeURIComponent(href.slice(1)))
        : null
      if (target) {
        if (document.defaultView.frameElement === editorPreviewFrame.value) {
          const previewPanel = editorPreviewFrame.value?.closest('section')
          if (previewPanel) {
            const panelTop = previewPanel.getBoundingClientRect().top + window.scrollY
            window.scrollTo(0, Math.max(0, panelTop - 80))
          }
        }
        const targetTop = target.getBoundingClientRect().top + document.defaultView.scrollY
        document.defaultView.scrollTo({ top: targetTop, behavior: 'instant' })
      }
      return
    }
    if (event.target?.closest?.('#project-carousel-controls')) return
    const target = event.target?.closest?.('[data-portfolio-block-id], [data-portfolio-block], [data-portfolio-section], header, footer')
    if (!target) return

    const blockId = target.closest('[data-portfolio-block-id]')?.dataset.portfolioBlockId
    const role = target.closest('[data-portfolio-block]')?.dataset.portfolioBlock
    let block = blockId ? blocks.value.find((item) => String(item.id) === String(blockId)) : null
    if (!block && role) block = blocks.value.find((item) => item.data?.role === role)

    const sectionId = target.closest('[data-portfolio-section]')?.dataset.portfolioSection
      || (target.closest('header') ? 'menu' : target.closest('footer') ? 'footer' : '')
    const section = sections.value.find((item) => item.id === sectionId)
    if (!block && section) block = section.blocks?.find((item) => item.enabled !== false) || section.blocks?.[0]
    if (!block) return

    selectedBlockId.value = block.id
    expandedSectionId.value = section?.id || sections.value.find((item) => item.blocks?.some((entry) => entry.id === block.id))?.id || ''
  }, true)
  document.addEventListener('submit', (event) => event.preventDefault(), true)
}

function highlightSelectedBlock(document, shouldScroll = false) {
  if (!document) return

  let style = document.getElementById('adaptacv-editor-selection-style')
  if (!style) {
    style = document.createElement('style')
    style.id = 'adaptacv-editor-selection-style'
    style.textContent = `
      [data-adaptacv-selected="true"] {
        outline: 3px solid #059669 !important;
        outline-offset: 5px !important;
        box-shadow: 0 0 0 7px rgba(5, 150, 105, 0.16) !important;
        transition: outline-color 160ms ease, box-shadow 160ms ease !important;
      }
    `
    document.head.append(style)
  }

  document.querySelectorAll('[data-adaptacv-selected]').forEach((element) => element.removeAttribute('data-adaptacv-selected'))
  if (!selectedBlock.value) return

  const role = selectedBlock.value.data?.role
  let targets = Array.from(document.querySelectorAll(`[data-portfolio-block-id="${CSS.escape(String(selectedBlock.value.id))}"]`))
  if (!targets.length && role) targets = Array.from(document.querySelectorAll(`[data-portfolio-block="${role}"]`))
  if (!targets.length && selectedSection.value) {
    targets = Array.from(document.querySelectorAll(`[data-portfolio-section="${selectedSection.value.id}"]`))
  }
  if (!targets.length && selectedSection.value?.id === 'menu') targets = [document.querySelector('header')].filter(Boolean)

  targets.forEach((element) => element.setAttribute('data-adaptacv-selected', 'true'))
  if (shouldScroll) targets.find((element) => !element.hidden)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function sectionLabel(sectionId) {
  if (sectionId === 'hero') return editorCopy.value.blocks.hero
  return editorCopy.value.sections[sectionId] || sectionId.replaceAll('-', ' ')
}

function blockLabel(block) {
  if (block.data?.role?.startsWith('footer-')) return editorCopy.value.footer[block.data.role.replace('footer-', '')] || block.data.title
  return editorCopy.value.blocks[block.data?.role] || block.data?.title || editorCopy.value.blocks.hero
}

function sectionTitle(section) {
  return editorCopy.value.sections[section.id] || section.title
}

function visibleSectionBlocks(section) {
  return section.blocks.filter((block) => portfolio.value?.templateId !== 'babysitter-housekeeping' || block.data?.role !== 'footer-channels')
}

function isSectionVisible(section) {
  return section?.enabled !== false
}

function setSectionVisibility(section, enabled) {
  if (!section) return
  section.enabled = enabled
  if (section.id === 'projects') portfolio.value.content.theme.showProjects = enabled
  updateLiveHero()
  scheduleSave()
}

function toggleSectionVisibility(section) {
  setSectionVisibility(section, !isSectionVisible(section))
}

function formatRevisionDate(value) {
  if (!value) return editorCopy.value.dialogs.savedVersion
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const locales = { es: 'es-ES', en: 'en-US', 'pt-BR': 'pt-BR' }
  return new Intl.DateTimeFormat(locales[localeStore.locale] || locales.es, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function createMenuHeroes(templateId = portfolio.value?.templateId) {
  const { blocks, defaults } = editorCopy.value
  const isCarePortfolio = templateId === 'babysitter-housekeeping'
  return [
    { id: 'menu-logo', type: 'hero', enabled: true, data: { role: 'logo', title: blocks.logo, text: 'AdaptaCV', summary: '', body: '', translations: {} } },
    { id: 'menu-identity', type: 'hero', enabled: true, data: { role: 'identity', title: blocks.identity, text: '', subtitle: isCarePortfolio ? 'Babysitter & Housekeeping' : '', summary: '', body: '', translations: {} } },
    { id: 'menu-availability', type: 'hero', enabled: true, data: { role: 'availability', title: blocks.availability, text: defaults.availability, summary: '', body: '', translations: {} } },
    { id: 'menu-avatar', type: 'hero', enabled: true, data: { role: 'avatar', title: blocks.avatar, imageUrl: '', summary: '', body: '', translations: {} } },
  ]
}

function createCoverHeroes(existingHero, templateId = portfolio.value?.templateId) {
  const existingData = existingHero?.data || {}
  const isCarePortfolio = templateId === 'babysitter-housekeeping'
  const { blocks, defaults } = editorCopy.value
  return [
    { id: existingHero?.id || 'cover-intro', type: 'hero', enabled: existingHero?.enabled !== false, data: { ...existingData, role: 'intro', title: blocks.intro, eyebrow: existingData.eyebrow || (isCarePortfolio ? 'Care professional' : defaults.eyebrow), name: existingData.name || '', headline: existingData.headline || '', summary: existingData.summary || existingData.body || '', translations: existingData.translations || {} } },
    { id: 'cover-specialties', type: 'hero', enabled: true, data: { role: 'specialties', title: blocks.specialties, first: isCarePortfolio ? 'CHILDCARE' : defaults.specialtyFirst, second: isCarePortfolio ? 'HOUSEKEEPING' : defaults.specialtySecond, third: isCarePortfolio ? 'FAMILY SUPPORT' : defaults.specialtyThird, translations: {} } },
    { id: 'cover-actions', type: 'hero', enabled: true, data: { role: 'actions', title: blocks.actions, primaryLabel: isCarePortfolio ? 'Start a conversation' : defaults.downloadCv, secondaryLabel: isCarePortfolio ? 'Explore services' : defaults.contact, cvId: '', translations: {} } },
    { id: 'cover-profile', type: 'hero', enabled: true, data: { role: 'profile', title: blocks.profile, imageUrl: existingData.imageUrl || '', status: isCarePortfolio ? '' : defaults.liveStudio, performance: isCarePortfolio ? '' : defaults.render, translations: {} } },
    { id: 'cover-metrics', type: 'hero', enabled: true, data: isCarePortfolio ? { role: 'metrics', title: blocks.metrics, firstValue: '', firstLabel: '', secondValue: '', secondLabel: '', thirdValue: '', thirdLabel: '', fourthValue: '', fourthLabel: '', translations: {} } : { role: 'metrics', title: blocks.metrics, firstValue: '+24', firstLabel: defaults.projects, secondValue: '99.8%', secondLabel: defaults.satisfaction, thirdValue: 'Awwwards', thirdLabel: 'Dev 2024', translations: {} } },
    { id: 'cover-terminal', type: 'hero', enabled: true, data: { role: 'terminal', title: blocks.terminal, branch: 'git:main* [clean]', precision: 'architectural', fps: '120', translations: {} } },
  ]
}

function createExperienceBlocks(templateId = portfolio.value?.templateId) {
  const { experience } = editorCopy.value
  const isCarePortfolio = templateId === 'babysitter-housekeeping'
  const careCapabilities = [
    { category: 'Childcare', title: 'Childcare routines', description: 'Safe, structured daily support adapted to each family.', tagline: 'Care shaped around each child', technologies: [], icon: 'child_care' },
    { category: 'Development', title: 'Learning through play', description: 'Age-appropriate activities that encourage curiosity and confidence.', tagline: 'Play with purpose', technologies: [], icon: 'toys' },
    { category: 'Wellbeing', title: 'Meals and wellbeing', description: 'Practical support with routines, meals, and family preferences.', tagline: 'Thoughtful daily routines', technologies: [], icon: 'restaurant' },
    { category: 'Housekeeping', title: 'Daily housekeeping', description: 'Organized cleaning and care for a comfortable home.', tagline: 'A calm, cared-for home', technologies: [], icon: 'cleaning_services' },
    { category: 'Home care', title: 'Laundry and organization', description: 'Careful laundry, wardrobe order, and household organization.', tagline: 'Order in every detail', technologies: [], icon: 'dry_cleaning' },
    { category: 'Coordination', title: 'Household coordination', description: 'Reliable support for errands, supplies, and daily home routines.', tagline: 'Reliable household support', technologies: [], icon: 'home' },
  ]
  return [
    { id: 'experience-intro', type: 'hero', enabled: true, data: { role: 'experience-intro', title: isCarePortfolio ? 'Care and home support' : experience.defaultTitle, eyebrow: isCarePortfolio ? 'Services' : experience.defaultEyebrow, translations: {} } },
    { id: 'capabilities-heading', type: 'hero', enabled: true, data: { role: 'capabilities-heading', title: isCarePortfolio ? 'Childcare & home support' : experience.defaultCapabilitiesTitle, count: isCarePortfolio ? 'Excellence in practice' : '04 DOMINIOS', childcareTitle: 'Babysitting & childcare', housekeepingTitle: 'Housekeeping', skills: isCarePortfolio ? careCapabilities : [{ title: 'Frontend Core', description: '', technologies: [], icon: 'code_blocks' }], translations: {} } },
    { id: 'experience-heading', type: 'hero', enabled: true, data: { role: 'experience-heading', title: experience.defaultExperienceTitle, label: experience.defaultTimelineLabel, experiences: [{ position: 'Lead Developer', company: '', period: '', currentLabel: '', description: '' }], translations: {} } },
    { id: 'experience-cv', type: 'hero', enabled: true, data: { role: 'experience-cv', eyebrow: experience.defaultCvEyebrow, title: experience.defaultCvTitle, meta: experience.defaultCvMeta, actionLabel: experience.defaultCvAction, linkedinUrl: '', translations: {} } },
    ...(isCarePortfolio ? [
      { id: 'care-overview', type: 'hero', enabled: true, data: { role: 'care-overview', registry: '', availabilityLabel: 'Availability', legalFirst: '', legalSecond: '', rate: '', domainDescription: 'Reliable, thoughtful care tailored to each family.', translations: {} } },
      { id: 'care-testimonial', type: 'hero', enabled: true, data: { role: 'care-testimonial', location: '', quote: '', rating: 0, translations: {} } },
      { id: 'care-certifications', type: 'hero', enabled: true, data: { role: 'care-certifications', eyebrow: 'Trust & qualifications', title: 'Care built on trust', description: 'Add qualifications and references families can verify.', vaultText: '', certificates: [], accreditationsTitle: 'Qualifications', accreditations: [], privacyFirst: '', privacySecond: '', translations: {} } },
      { id: 'care-inquiry', type: 'hero', enabled: true, data: { role: 'care-inquiry', eyebrow: 'Get in touch', title: 'Let’s talk about your household needs', description: 'Share a few details and start a conversation about the support your family is looking for.', nameLabel: 'Your name', namePlaceholder: 'Name', emailLabel: 'Email address', emailPlaceholder: 'you@example.com', regionLabel: 'Location', scopeLabel: 'Type of support', submitLabel: 'Send inquiry', confirmationTitle: 'Thank you for reaching out', confirmationDescription: 'Your inquiry is ready. Continue securely to send your message.', securityLabel: '', directLine: '', regions: [{ value: 'local', label: 'Local area' }, { value: 'relocation', label: 'Open to relocation' }, { value: 'travel', label: 'Travel required' }], scopes: [{ value: 'babysitting', label: 'Babysitting & childcare' }, { value: 'housekeeping', label: 'Housekeeping' }, { value: 'combined', label: 'Combined childcare and housekeeping' }, { value: 'other', label: 'Other support' }], translations: {} } },
    ] : []),
  ]
}

function createConversationBlocks() {
  const { blocks, conversation } = editorCopy.value
  return [{ id: 'conversation', type: 'hero', enabled: true, data: { role: 'conversation', title: blocks.conversation, eyebrow: conversation.defaultEyebrow, heading: conversation.defaultHeading, description: conversation.defaultDescription, actionLabel: conversation.defaultAction, translations: {} } }]
}

function createFooterBlocks(templateId = portfolio.value?.templateId) {
  const { footer } = editorCopy.value
  const isCarePortfolio = templateId === 'babysitter-housekeeping'
  return [
    { id: 'footer-identity', type: 'hero', enabled: true, data: { role: 'footer-identity', title: footer.identity, brand: 'AdaptaCV', name: '', summary: isCarePortfolio ? '' : footer.defaultSummary, location: isCarePortfolio ? '' : footer.defaultLocation, copyright: isCarePortfolio ? '' : footer.defaultCopyright, legalLinkOne: '', legalUrlOne: '', legalLinkTwo: '', legalUrlTwo: '', translations: {} } },
    { id: 'footer-channels', type: 'hero', enabled: true, data: { role: 'footer-channels', title: footer.channels, heading: footer.defaultChannelsTitle, channels: [{ label: 'GitHub', url: '' }, { label: 'LinkedIn', url: '' }, { label: 'Read.cv', url: '' }, { label: 'X / Twitter', url: '' }], translations: {} } },
    { id: 'footer-contact', type: 'hero', enabled: true, data: { role: 'footer-contact', title: isCarePortfolio ? 'Contact' : footer.defaultContactTitle, description: isCarePortfolio ? '' : footer.defaultContactDescription, phoneLabel: 'Phone', phone: '', whatsappLabel: 'WhatsApp', whatsapp: '', emailLabel: 'Email', translations: {} } },
  ]
}

function normalizePortfolio(value) {
  const draft = clone(value)
  draft.content = draft.content || {}
  draft.content.theme = draft.content.theme || {}
  if (!['es', 'en', 'pt-BR'].includes(draft.content.theme.language)) draft.content.theme.language = ['es', 'en', 'pt-BR'].includes(draft.locale) ? draft.locale : 'es'
  if (typeof draft.content.theme.showProjects !== 'boolean') draft.content.theme.showProjects = true
  const existingBlocks = (draft.content.blocks || []).filter((block) => !['menu', 'hero', 'projects', 'experience', 'conversation', 'footer'].includes(block.type)).map((block) => ({
    ...block,
    enabled: block.enabled !== false,
    data: { title: '', summary: '', body: '', translations: {}, ...block.data },
  }))
  const existingSections = draft.content.sections || []
  const isCarePortfolio = draft.templateId === 'babysitter-housekeeping'
  const careCoverDefaults = isCarePortfolio ? createCoverHeroes(null, draft.templateId) : []
  const careExperienceDefaults = isCarePortfolio ? createExperienceBlocks(draft.templateId) : []
  const careFooterDefaults = isCarePortfolio ? createFooterBlocks(draft.templateId) : []
  const findDefaultData = (defaults, role) => defaults.find((block) => block.data?.role === role)?.data || {}
  const careDefaults = {
    intro: findDefaultData(careCoverDefaults, 'intro'),
    specialties: findDefaultData(careCoverDefaults, 'specialties'),
    actions: findDefaultData(careCoverDefaults, 'actions'),
    profile: findDefaultData(careCoverDefaults, 'profile'),
    metrics: findDefaultData(careCoverDefaults, 'metrics'),
    capabilities: findDefaultData(careExperienceDefaults, 'capabilities-heading'),
    footerIdentity: findDefaultData(careFooterDefaults, 'footer-identity'),
    footerContact: findDefaultData(careFooterDefaults, 'footer-contact'),
  }
  draft.content.sections = portfolioSections.map((section) => {
    const current = existingSections.find((item) => item.id === section.id)
    const currentBlocks = (current?.blocks || []).filter((block) => block.data?.role !== 'footer-credits')
    const existingCoverHero = currentBlocks.find((block) => block.data?.role === 'intro') || currentBlocks.find((block) => block.type === 'hero') || existingBlocks.find((block) => block.type === 'hero')
    const defaultBlocks = section.id === 'menu' ? createMenuHeroes(draft.templateId) : section.id === 'cover' ? createCoverHeroes(existingCoverHero, draft.templateId) : section.id === 'experience-capabilities' ? createExperienceBlocks(draft.templateId) : section.id === 'conversation' ? createConversationBlocks() : section.id === 'footer' ? createFooterBlocks(draft.templateId) : []
    const shouldUpgradeCover = section.id === 'cover' && !currentBlocks.some((block) => block.data?.role === 'intro')
    const sectionBlocks = shouldUpgradeCover || !currentBlocks.length ? defaultBlocks : currentBlocks
    const systemRoles = ['experience-intro', 'capabilities-heading', 'experience-heading', 'experience-cv', 'care-overview', 'care-testimonial', 'care-certifications', 'care-inquiry', 'conversation', 'footer-identity', 'footer-channels', 'footer-contact']
    const missingSystemBlocks = defaultBlocks.filter((defaultBlock) => systemRoles.includes(defaultBlock.data.role) && !sectionBlocks.some((block) => block.data?.role === defaultBlock.data.role))
    return {
      ...section,
      ...current,
      enabled: current?.enabled !== false && (section.id !== 'projects' || draft.content.theme.showProjects !== false),
      blocks: [...sectionBlocks, ...missingSystemBlocks].map((block) => {
        const data = { title: '', summary: '', body: '', translations: {}, ...block.data }
        if (isCarePortfolio) {
          if (data.role === 'intro') {
            if (data.eyebrow === editorCopy.value.defaults.eyebrow) data.eyebrow = careDefaults.intro.eyebrow
            if (data.headline === editorCopy.value.defaults.professional) data.headline = ''
            if (data.summary === editorCopy.value.defaults.summary) data.summary = ''
          }
          if (data.role === 'specialties') {
            for (const field of ['first', 'second', 'third']) {
              if (data[field] === editorCopy.value.defaults[`specialty${field[0].toUpperCase()}${field.slice(1)}`]) data[field] = careDefaults.specialties[field]
            }
          }
          if (data.role === 'actions') {
            if (data.primaryLabel === editorCopy.value.defaults.downloadCv) data.primaryLabel = careDefaults.actions.primaryLabel
            if (data.secondaryLabel === editorCopy.value.defaults.contact) data.secondaryLabel = careDefaults.actions.secondaryLabel
          }
          if (data.role === 'profile') {
            if (data.status === editorCopy.value.defaults.liveStudio) data.status = ''
            if (data.performance === editorCopy.value.defaults.render) data.performance = ''
          }
          if (data.role === 'care-overview') {
            const samples = {
              registry: 'Swiss Domestic Guild • EU Care Registry (CH-VD 8820)',
              legalFirst: 'Schengen & UK Clear',
              legalSecond: 'Swiss LAMal & LAA Covered',
              rate: '€38 – €55 / hr',
            }
            for (const [field, value] of Object.entries(samples)) {
              if (data[field] === value || data[field] === 'Rate available on request') data[field] = ''
            }
          }
          if (data.role === 'metrics') {
            const oldSamples = { firstValue: '+24', firstLabel: editorCopy.value.defaults.projects, secondValue: '99.8%', secondLabel: editorCopy.value.defaults.satisfaction, thirdValue: 'Awwwards', thirdLabel: 'Dev 2024' }
            for (const [field, value] of Object.entries(oldSamples)) {
              if (data[field] === value) data[field] = ''
            }
            data.fourthValue = data.fourthValue === '100% NDA' ? '' : data.fourthValue || ''
            data.fourthLabel = data.fourthLabel === 'Strict Protocol' ? '' : data.fourthLabel || ''
          }
          if (data.role === 'capabilities-heading') {
            if (data.title === editorCopy.value.experience.defaultCapabilitiesTitle) data.title = careDefaults.capabilities.title
            if (data.count === '04 DOMINIOS') data.count = careDefaults.capabilities.count
            data.childcareTitle ||= careDefaults.capabilities.childcareTitle
            data.housekeepingTitle ||= careDefaults.capabilities.housekeepingTitle
          }
          if (data.role === 'footer-identity') {
            if (data.summary === editorCopy.value.footer.defaultSummary || data.summary === 'Private governess, bilingual infant care, and confidential residence governance for distinguished international estates across Western Europe.') data.summary = ''
            if (data.location === editorCopy.value.footer.defaultLocation || data.location === 'Paris • Genève • London • Monaco') data.location = ''
            data.copyright ??= ''
            data.legalLinkOne ??= ''
            data.legalUrlOne ??= ''
            data.legalLinkTwo ??= ''
            data.legalUrlTwo ??= ''
          }
          if (data.role === 'footer-contact') {
            if (data.title === editorCopy.value.footer.defaultContactTitle) data.title = careDefaults.footerContact.title
            if (data.description === editorCopy.value.footer.defaultContactDescription) data.description = ''
            data.phoneLabel ||= 'Phone'
            data.phone ||= ''
            data.whatsappLabel ||= 'WhatsApp'
            data.whatsapp ||= ''
            data.emailLabel ||= 'Email'
          }
          if (data.role === 'care-testimonial') {
            if (data.location === 'Kensington W8') data.location = ''
            if (data.quote === 'Éléonore has an almost architectural composure. She organized our nursery and chalet with absolute grace.') data.quote = ''
          }
          if (data.role === 'care-certifications') {
            if (data.vaultText === 'Encrypted Client Vault Available on Request') data.vaultText = ''
            if (data.privacyFirst === 'Strict Bilateral NDA Protocol') data.privacyFirst = ''
            if (data.privacySecond === 'GDPR Private Vault') data.privacySecond = ''
          }
          if (data.role === 'care-inquiry') {
            if (data.securityLabel === 'End-to-End Encrypted') data.securityLabel = ''
            if (data.directLine === 'Direct Cabinet Line: +41 (22) 819 04 20') data.directLine = ''
          }
        }
        if (data.role === 'capabilities-heading') {
          const legacySkills = sectionBlocks.filter((item) => item.data?.role === 'capability').map((item) => item.data)
          const skills = Array.isArray(data.skills) ? data.skills : []
          data.skills = [...skills, ...legacySkills].map((skill) => ({
            title: '', description: '', icon: 'code_blocks', ...skill,
            technologies: Array.isArray(skill.technologies) ? skill.technologies : String(skill.technologies || '').split(',').map((item) => item.trim()).filter(Boolean),
          }))
          if (isCarePortfolio && data.skills.length === 1 && data.skills[0].title === 'Frontend Core' && !data.skills[0].description && !data.skills[0].technologies.length) {
            data.skills = careDefaults.capabilities.skills.map((skill) => ({ ...skill, technologies: [...skill.technologies] }))
          }
        }
        if (data.role === 'experience-heading') {
          const legacyExperiences = sectionBlocks.filter((item) => item.data?.role === 'experience').map((item) => item.data)
          const experiences = Array.isArray(data.experiences) ? data.experiences : []
          data.experiences = [...experiences, ...legacyExperiences].map((experience) => ({ position: '', company: '', period: '', currentLabel: '', description: '', ...experience }))
        }
        if (data.role === 'footer-channels') {
          const legacyChannels = [
            { label: 'GitHub', url: data.githubUrl },
            { label: 'LinkedIn', url: data.linkedinUrl },
            { label: 'Read.cv', url: data.readcvUrl },
            { label: 'X / Twitter', url: data.twitterUrl },
          ]
          data.channels = (Array.isArray(data.channels) ? data.channels : legacyChannels).map((channel) => ({ label: '', url: '', ...channel }))
          delete data.githubUrl
          delete data.linkedinUrl
          delete data.readcvUrl
          delete data.twitterUrl
        }
        return { ...block, enabled: block.enabled !== false, data }
      }).filter((block) => !['capability', 'experience'].includes(block.data.role)),
    }
  })
  draft.content.theme.showProjects = draft.content.sections.find((section) => section.id === 'projects')?.enabled !== false
  delete draft.content.blocks
  return draft
}

function addBlock(section) {
  if (section.id !== 'projects') {
    showHeroUnavailableToast()
    return
  }
  const block = { id: crypto.randomUUID(), type: 'projects', enabled: true, data: { role: 'project', title: editorCopy.value.project.untitled, imageUrl: '', imageAlt: '', badges: '', summary: '', tagline: '', description: '', architecture: '', stack: '', demoUrl: '', showDemoButton: true, demoUsername: '', showDemoUsername: false, demoPassword: '', showDemoPassword: false, githubUrl: '', showSourceButton: true, firstMetricValue: '', firstMetricLabel: '', secondMetricValue: '', secondMetricLabel: '', thirdMetricValue: '', thirdMetricLabel: '', translations: {} } }
  section.blocks.push(block)
  selectedBlockId.value = block.id
  expandedSectionId.value = section.id
  scheduleSave()
}

function showHeroUnavailableToast() {
  heroUnavailableToast.value = editorCopy.value.ui.heroUnavailable
  window.clearTimeout(heroUnavailableToastTimer)
  heroUnavailableToastTimer = window.setTimeout(() => { heroUnavailableToast.value = '' }, 4000)
}

function addCapabilityTechnology() {
  const skill = selectedBlock.value?.data?.skills?.[iconPickerSkillIndex.value]
  const technology = newCapabilityTechnology.value.trim()
  if (!technology || !skill) return
  if (!Array.isArray(skill.technologies)) skill.technologies = []
  if (!skill.technologies.includes(technology)) skill.technologies.push(technology)
  newCapabilityTechnology.value = ''
  scheduleSave()
}

function removeCapabilityTechnology(index) {
  const skill = selectedBlock.value?.data?.skills?.[iconPickerSkillIndex.value]
  if (!skill) return
  skill.technologies.splice(index, 1)
  scheduleSave()
}

function addCapabilitySkill() {
  if (selectedBlock.value?.data?.role !== 'capabilities-heading') return
  selectedBlock.value.data.skills.push({ title: editorCopy.value.experience.untitledCapability, description: '', technologies: [], icon: 'code_blocks' })
  expandedSkillIndex.value = selectedBlock.value.data.skills.length - 1
  scheduleSave()
}

function removeCapabilitySkill(index) {
  if (selectedBlock.value?.data?.role !== 'capabilities-heading') return
  selectedBlock.value.data.skills.splice(index, 1)
  if (expandedSkillIndex.value === index) expandedSkillIndex.value = null
  else if (expandedSkillIndex.value > index) expandedSkillIndex.value -= 1
  scheduleSave()
}

function addExperienceItem() {
  if (selectedBlock.value?.data?.role !== 'experience-heading') return
  selectedBlock.value.data.experiences.push({ position: editorCopy.value.experience.untitledExperience, company: '', period: '', currentLabel: '', description: '' })
  expandedExperienceIndex.value = selectedBlock.value.data.experiences.length - 1
  scheduleSave()
}

function removeExperienceItem(index) {
  if (selectedBlock.value?.data?.role !== 'experience-heading') return
  selectedBlock.value.data.experiences.splice(index, 1)
  if (expandedExperienceIndex.value === index) expandedExperienceIndex.value = null
  else if (expandedExperienceIndex.value > index) expandedExperienceIndex.value -= 1
  scheduleSave()
}

function addFooterChannel() {
  if (selectedBlock.value?.data?.role !== 'footer-channels') return
  selectedBlock.value.data.channels.push({ label: editorCopy.value.footer.untitledChannel, url: '' })
  expandedFooterChannelIndex.value = selectedBlock.value.data.channels.length - 1
  scheduleSave()
}

function removeFooterChannel(index) {
  if (selectedBlock.value?.data?.role !== 'footer-channels') return
  selectedBlock.value.data.channels.splice(index, 1)
  if (expandedFooterChannelIndex.value === index) expandedFooterChannelIndex.value = null
  else if (expandedFooterChannelIndex.value > index) expandedFooterChannelIndex.value -= 1
  scheduleSave()
}

function selectCapabilityIcon(icon, index) {
  const skill = selectedBlock.value?.data?.skills?.[index]
  if (!skill) return
  skill.icon = icon
  isIconPickerOpen.value = false
  iconPickerSkillIndex.value = null
  scheduleSave()
}

function removeBlock() {
  if (!canRemoveSelectedBlock.value) return
  const section = sections.value.find((item) => item.blocks?.some((block) => block.id === selectedBlockId.value))
  if (!section) return
  section.blocks = section.blocks.filter((block) => block.id !== selectedBlockId.value)
  selectedBlockId.value = null
  scheduleSave()
}

async function replacePortfolio(value, selectedId = selectedBlockId.value) {
  isSynchronizingPortfolio.value = true
  const normalized = normalizePortfolio(value)
  const contentWasNormalized = JSON.stringify(value.content || {}) !== JSON.stringify(normalized.content || {})
  portfolio.value = normalized
  selectedBlockId.value = selectedId || blocks.value[0]?.id || null
  await nextTick()
  isSynchronizingPortfolio.value = false
  if (contentWasNormalized) scheduleSave()
}

async function loadTemplateSource() {
  templateSource.value = ''
  livePreviewHtml.value = ''
  try {
    templateSource.value = await $fetch(templatePreviewUrl.value, { responseType: 'text' })
    livePreviewHtml.value = createLivePreviewHtml()
  } catch (error) {
    saveState.value = error.message || editorCopy.value.ui.loadingPreviewError
  }
}

function openPublicPortfolio() {
  if (!publicPortfolioUrl.value) {
    saveState.value = editorCopy.value.ui.slugRequired
    return
  }
  window.open(publicPortfolioUrl.value, '_blank', 'noopener,noreferrer')
}

async function openMetrics() {
  isMetricsOpen.value = true
  await Promise.all([fetchPortfolioReport(), fetchGeoReport()])
}

async function fetchPortfolioReport() {
  if (!portfolio.value?.id) return
  isLoadingPortfolioReport.value = true
  portfolioReportError.value = ''
  try {
    portfolioReport.value = await portfolioStore.getViewReport(portfolio.value.id, {
      from: portfolioReportFrom.value,
      to: portfolioReportTo.value,
    })
  } catch (error) {
    portfolioReportError.value = error.message || 'No fue posible cargar las visualizaciones.'
  } finally {
    isLoadingPortfolioReport.value = false
  }
}

async function fetchGeoReport(force = false) {
  if (!portfolio.value?.id) return
  if (isLoadingGeoReport.value) return
  isLoadingGeoReport.value = true
  geoReportError.value = ''
  try {
    geoReport.value = await portfolioStore.getGeoReport(portfolio.value.id, { force })
  } catch (error) {
    geoReportError.value = error.message || 'No fue posible cargar el mapa de visitas.'
  } finally {
    isLoadingGeoReport.value = false
  }
}

async function refreshGeoReport(scrollTop = window.scrollY) {
  await fetchGeoReport(true)
  await nextTick()
  window.scrollTo(0, scrollTop)
}

function selectGeoCountry(countryCode) {
  selectedGeoCountryCode.value = countryCode
}


function scheduleSave() {
  if (!portfolio.value || isSynchronizingPortfolio.value) return
  saveState.value = editorCopy.value.ui.unsaved
  if (isSavingPortfolio) {
    hasQueuedPortfolioSave = true
    return
  }
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(savePortfolio, 700)
}

async function savePortfolio() {
  if (!portfolio.value) return
  window.clearTimeout(saveTimer)
  if (isSavingPortfolio) {
    hasQueuedPortfolioSave = true
    return
  }

  isSavingPortfolio = true
  saveState.value = editorCopy.value.ui.saving
  try {
    do {
      hasQueuedPortfolioSave = false
      const draft = portfolio.value
      const portfolioId = draft.id
      const updated = await portfolioStore.updatePortfolio(portfolioId, {
        name: draft.name,
        template_id: draft.templateId,
        visibility: draft.visibility,
        content: clone(draft.content),
      })

      if (portfolio.value?.id !== portfolioId) return
      portfolio.value.updated_at = updated.updated_at
      portfolio.value.updatedAt = updated.updatedAt || updated.updated_at
    } while (hasQueuedPortfolioSave)

    saveState.value = editorCopy.value.ui.saved
  } catch (error) {
    saveState.value = error.message
  } finally {
    isSavingPortfolio = false
    hasQueuedPortfolioSave = false
  }
}

function moveBlock(direction) {
  const section = sections.value.find((item) => item.blocks?.some((block) => block.id === selectedBlockId.value))
  if (!section) return
  const index = section.blocks.findIndex((block) => block.id === selectedBlockId.value)
  const destination = index + direction
  if (index < 0 || destination < 0 || destination >= section.blocks.length) return
  const [block] = section.blocks.splice(index, 1)
  section.blocks.splice(destination, 0, block)
  scheduleSave()
}

async function togglePublication() {
  try {
    if (!isPublished.value) {
      window.clearTimeout(saveTimer)
      portfolio.value.visibility = 'public'
      await savePortfolio()
    }

    const updated = isPublished.value
      ? await portfolioStore.unpublishPortfolio(portfolio.value.id)
      : await portfolioStore.publishPortfolio(portfolio.value.id)
    await replacePortfolio(updated)
    saveState.value = updated.status === 'published' ? editorCopy.value.ui.published : editorCopy.value.ui.draft
  } catch (error) {
    saveState.value = error.message
  }
}

async function uploadCover(event) {
  const [file] = event.target.files || []
  if (!file || !portfolio.value) return
  saveState.value = editorCopy.value.ui.saving
  try {
    await replacePortfolio(await portfolioStore.uploadCover(portfolio.value.id, file))
    saveState.value = editorCopy.value.ui.saved
  } catch (error) {
    saveState.value = error.message
  } finally {
    event.target.value = ''
  }
}

function selectAssetTarget(block) {
  assetTarget.value = block
  assetInput.value?.click()
}

async function uploadAsset(event) {
  const [file] = event.target.files || []
  const target = assetTarget.value
  if (!file || !target || !portfolio.value) return

  saveState.value = editorCopy.value.ui.saving
  try {
    const uploaded = await portfolioStore.uploadAsset(portfolio.value.id, file)
    const imageUrl = uploaded?.asset_url || uploaded?.url || uploaded?.asset?.url
    if (!imageUrl) throw new Error(editorCopy.value.ui.loadingPreviewError)
    target.data.imageUrl = imageUrl
    window.clearTimeout(saveTimer)
    const updated = await portfolioStore.updatePortfolio(portfolio.value.id, {
      name: portfolio.value.name,
      template_id: portfolio.value.templateId,
      visibility: portfolio.value.visibility,
      content: portfolio.value.content,
    })
    await replacePortfolio(updated, target.id)
    saveState.value = editorCopy.value.ui.saved
  } catch (error) {
    saveState.value = error.message
  } finally {
    assetTarget.value = null
    event.target.value = ''
  }
}

async function loadRevisions() {
  isRevisionPanelOpen.value = true
  isLoadingRevisions.value = true
  try {
    const data = await portfolioStore.getRevisions(portfolio.value.id)
    revisions.value = Array.isArray(data) ? data : data?.revisions || []
  } catch (error) {
    saveState.value = error.message
  } finally {
    isLoadingRevisions.value = false
  }
}

async function restoreRevision(revision) {
  try {
    await replacePortfolio(await portfolioStore.restoreRevision(portfolio.value.id, revision.id), null)
    isRevisionPanelOpen.value = false
    saveState.value = editorCopy.value.ui.saved
  } catch (error) {
    saveState.value = error.message
  }
}

watch(() => selectedBlock.value?.data, scheduleSave, { deep: true })
watch(() => portfolio.value?.name, scheduleSave)
watch(() => portfolio.value?.visibility, scheduleSave)
watch([coverHeroes, menuHeroes, projectBlocks, experienceBlocks, footerBlocks], () => nextTick(updateLiveHero), { deep: true })
watch(selectedBlockId, () => nextTick(() => {
  highlightSelectedBlock(editorPreviewFrame.value?.contentDocument, true)
  highlightSelectedBlock(fullscreenPreviewFrame.value?.contentDocument, true)
}))
watch(portfolioLanguage, () => {
  scheduleSave()
  livePreviewHtml.value = createLivePreviewHtml()
})

onMounted(async () => {
  try {
    const [loadedPortfolio] = await Promise.all([
      portfolioStore.loadPortfolio(props.portfolioId),
      cvStore.loadCvs(),
    ])
    await replacePortfolio(loadedPortfolio, null)
    await loadTemplateSource()
  } catch (error) {
    loadError.value = error.message
  } finally {
    isLoading.value = false
    await nextTick()
    previewResizeObserver = new ResizeObserver(updateEditorPreviewScale)
    if (editorPreviewViewport.value) previewResizeObserver.observe(editorPreviewViewport.value)
    window.addEventListener('resize', updateEditorPreviewScale)
    updateEditorPreviewScale()
  }
})

onBeforeUnmount(() => {
  window.clearTimeout(saveTimer)
  window.clearTimeout(heroUnavailableToastTimer)
  window.removeEventListener('resize', updateEditorPreviewScale)
  previewResizeObserver?.disconnect()
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f3eb] text-stone-950">
    <WorkspaceNav />
    <div v-if="isLoading" class="mx-auto max-w-7xl px-6 py-16 text-sm font-semibold text-stone-500">{{ editorCopy.ui.loading }}</div>
    <div v-else-if="loadError" class="mx-auto max-w-7xl px-6 py-16 text-sm font-semibold text-red-700">{{ loadError }}</div>
    <section v-else-if="portfolio" class="mx-auto max-w-[1800px] px-3 py-4 sm:px-6">
      <header class="flex flex-col gap-4 border-b border-stone-300 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <NuxtLink to="/portfolios" class="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-stone-300 bg-white text-stone-700 hover:border-emerald-800 hover:text-emerald-800" :aria-label="editorCopy.ui.back" :title="editorCopy.ui.back"><ArrowLeft :size="19" /></NuxtLink>
          <div class="min-w-0"><input v-model="portfolio.name" class="w-full truncate bg-transparent text-lg font-black outline-none sm:text-2xl" :aria-label="editorCopy.ui.portfolioName" /><p class="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-500 sm:text-xs"><span class="h-1.5 w-1.5 rounded-full" :class="isPublished ? 'bg-emerald-600' : 'bg-amber-500'" />{{ templateLabel }} · {{ saveState || statusLabel }}</p></div>
        </div>
        <div class="flex flex-wrap items-center gap-2"><button class="grid h-10 w-10 place-items-center rounded-md border border-stone-300 bg-white text-stone-700 hover:text-emerald-800" type="button" title="Métricas" aria-label="Métricas" @click="openMetrics"><BarChart3 :size="18" /></button><button class="grid h-10 w-10 place-items-center rounded-md border border-stone-300 bg-white text-stone-700 hover:text-emerald-800" type="button" :title="editorCopy.ui.preview" :aria-label="editorCopy.ui.preview" @click="isPreviewOpen = true"><Eye :size="18" /></button><button class="grid h-10 w-10 place-items-center rounded-md border border-stone-300 bg-white text-stone-700 hover:text-emerald-800" type="button" :title="publicPortfolioUrl ? editorCopy.ui.openPublic : editorCopy.ui.publicUnavailable" :aria-label="editorCopy.ui.openPublic" @click="openPublicPortfolio"><ExternalLink :size="18" /></button><button class="grid h-10 w-10 place-items-center rounded-md border border-stone-300 bg-white text-stone-700 hover:text-emerald-800" type="button" :title="editorCopy.ui.revisions" :aria-label="editorCopy.ui.revisions" @click="loadRevisions"><Clock3 :size="18" /></button><button class="grid h-10 w-10 place-items-center rounded-md border border-stone-300 bg-white text-stone-700 hover:text-emerald-800" type="button" :title="editorCopy.ui.settings" :aria-label="editorCopy.ui.settings" @click="isSettingsOpen = true"><Settings2 :size="18" /></button><button class="grid h-10 w-10 place-items-center rounded-md border border-stone-300 bg-white text-stone-700 hover:text-emerald-800" type="button" :title="editorCopy.ui.saveNow" :aria-label="editorCopy.ui.saveNow" @click="savePortfolio"><Save :size="18" /></button><button class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-3 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-800 sm:w-auto sm:px-4 sm:text-sm" type="button" @click="togglePublication"><Send :size="17" /> {{ isPublished ? editorCopy.ui.unpublish : editorCopy.ui.publish }}</button></div>
      </header>

      <div class="mt-5 grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)_360px]">
        <aside class="order-2 self-start border border-stone-300 bg-white p-3 sm:p-4 xl:sticky xl:top-20 xl:order-1">
          <div><p class="text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-800 sm:text-xs">{{ editorCopy.ui.structure }}</p><h2 class="mt-1 text-base font-black sm:text-lg">{{ editorCopy.ui.sectionsTitle }}</h2><p class="mt-2 text-[11px] leading-5 text-stone-500 sm:text-xs">{{ editorCopy.ui.sectionsHint }}</p></div>
          <div class="mt-4 divide-y divide-stone-200 overflow-hidden rounded-md border-y border-stone-200 bg-stone-50/50 xl:overflow-visible xl:bg-transparent">
            <section v-for="section in sections" :key="section.id">
              <div class="flex items-center gap-1 py-1">
                <button class="flex min-w-0 flex-1 items-center gap-2 py-2 text-left" type="button" @click="expandedSectionId = expandedSectionId === section.id ? '' : section.id"><ChevronDown :size="17" class="shrink-0 transition" :class="expandedSectionId === section.id ? 'rotate-180' : ''" /><span class="min-w-0 flex-1 text-sm font-extrabold text-stone-800">{{ sectionTitle(section) }}</span><span class="text-xs font-bold text-stone-400">{{ visibleSectionBlocks(section).length }}</span></button>
                <button v-if="optionalTechnicalSectionIds.has(section.id)" class="grid h-8 w-8 shrink-0 place-items-center rounded-md text-stone-600 hover:bg-stone-100 hover:text-emerald-800" type="button" :title="isSectionVisible(section) ? editorCopy.ui.hideSection : editorCopy.ui.showSection" :aria-label="isSectionVisible(section) ? editorCopy.ui.hideSection : editorCopy.ui.showSection" :aria-pressed="isSectionVisible(section)" @click="toggleSectionVisibility(section)"><Eye v-if="isSectionVisible(section)" :size="16" /><EyeOff v-else :size="16" /></button>
              </div>
              <div v-if="expandedSectionId === section.id" class="space-y-1 pb-3">
                <button v-for="block in visibleSectionBlocks(section)" :key="block.id" class="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm font-bold" :class="selectedBlockId === block.id ? 'bg-emerald-50 text-emerald-900' : 'text-stone-600 hover:bg-stone-100'" type="button" @click="selectedBlockId = block.id"><GripVertical :size="15" class="shrink-0 text-stone-400" /><span class="min-w-0 flex-1 truncate">{{ blockLabel(block) }}</span><Eye v-if="block.enabled" :size="15" /><EyeOff v-else :size="15" /></button>
                <button v-if="section.id !== 'experience-capabilities'" class="inline-flex w-full items-center gap-2 px-2 py-2 text-sm font-extrabold text-emerald-800 hover:bg-emerald-50" type="button" @click="addBlock(section)"><Plus :size="16" /> {{ section.id === 'projects' ? editorCopy.project.add : editorCopy.ui.addHero }}</button>
              </div>
            </section>
          </div>
        </aside>

        <section class="order-1 min-h-[420px] overflow-hidden border border-stone-300 bg-white xl:order-2">
          <div class="flex items-center justify-between border-b border-stone-200 px-3 py-3 sm:px-5"><span class="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-stone-500 sm:text-xs"><LayoutPanelTop :size="16" /> {{ editorCopy.ui.design }} {{ templateLabel }}</span><span class="text-[10px] font-bold text-stone-400 sm:text-xs">{{ visibleBlocks.filter((block) => block.enabled).length }} {{ editorCopy.ui.visibleSections }}</span></div>
          <div ref="editorPreviewViewport" class="h-[360px] overflow-auto bg-white sm:h-[480px] xl:h-[calc(100vh-180px)] xl:min-h-[680px] xl:overflow-hidden">
            <iframe v-if="livePreviewHtml" ref="editorPreviewFrame" :srcdoc="livePreviewHtml" :style="editorPreviewStyle" :title="`Diseño ${templateLabel}`" class="block shrink-0 border-0 bg-white" @load="updateLiveHero" />
            <iframe v-else :src="templatePreviewUrl" :style="editorPreviewStyle" :title="`Diseño ${templateLabel}`" class="block shrink-0 border-0 bg-white" />
          </div>
        </section>

        <aside v-if="selectedBlock" class="order-3 self-start w-full border border-stone-300 bg-white p-4 sm:p-5 xl:sticky xl:top-20 xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto xl:overscroll-contain xl:order-3">
          <div class="flex items-center justify-between gap-3"><div><p class="text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-800 sm:text-xs">{{ editorCopy.ui.properties }}</p><h2 class="mt-1 text-base font-black sm:text-lg">{{ blockLabel(selectedBlock) }}</h2></div><button class="grid h-9 w-9 place-items-center rounded-md text-stone-600 hover:bg-stone-100" type="button" :title="selectedBlock.enabled ? editorCopy.ui.hideSection : editorCopy.ui.showSection" :aria-label="selectedBlock.enabled ? editorCopy.ui.hideSection : editorCopy.ui.showSection" @click="selectedBlock.enabled = !selectedBlock.enabled; scheduleSave()"><EyeOff v-if="selectedBlock.enabled" :size="18" /><Eye v-else :size="18" /></button></div>
          <div class="mt-4 space-y-3">
          <template v-if="selectedBlock.data.role === 'logo' || selectedBlock.data.role === 'availability'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ selectedBlock.data.role === 'logo' ? editorCopy.ui.logoText : editorCopy.ui.availabilityText }}<input v-model="selectedBlock.data.text" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'identity'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.ui.name }}<input v-model="selectedBlock.data.text" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" :placeholder="editorCopy.ui.yourProfessionalName" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.specialty }}<input v-model="selectedBlock.data.subtitle" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" :placeholder="editorCopy.ui.headlineExample" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'avatar'">
            <div class="mt-6"><div class="flex items-center justify-between gap-3"><p class="text-sm font-bold text-stone-700">{{ editorCopy.ui.profileImage }}</p><button class="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800 hover:text-emerald-700" type="button" @click="selectAssetTarget(selectedBlock)"><Upload :size="16" /> {{ editorCopy.ui.uploadImage }}</button></div><img v-if="isPortfolioAssetUrl(selectedBlock.data.imageUrl)" :src="getPortfolioAssetUrl(selectedBlock.data.imageUrl)" :alt="editorCopy.ui.profileImage" class="mt-3 h-32 w-full rounded-md border border-stone-200 object-cover" /></div>
          </template>
          <template v-else-if="selectedBlock.data.role === 'intro' || (selectedBlock.type === 'hero' && !selectedBlock.data.role)">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.ui.professionalLabel }}<input v-model="selectedBlock.data.eyebrow" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.name }}<input v-model="selectedBlock.data.name" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" :placeholder="editorCopy.ui.yourProfessionalName" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.professionalHeadline }}<input v-model="selectedBlock.data.headline" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" :placeholder="editorCopy.ui.headlineExample" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.presentation }}<textarea v-model="selectedBlock.data.summary" class="mt-2 min-h-32 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" :placeholder="editorCopy.ui.summaryPlaceholder" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'specialties'">
            <label v-for="field in ['first', 'second', 'third']" :key="field" class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.specialty }}<input v-model="selectedBlock.data[field]" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'actions'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.ui.primaryAction }}<input v-model="selectedBlock.data.primaryLabel" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.secondaryAction }}<input v-model="selectedBlock.data.secondaryLabel" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.cv.associated }}<select v-model="selectedBlock.data.cvId" class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-800"><option value="">{{ cvDocuments.length ? editorCopy.cv.select : editorCopy.cv.empty }}</option><option v-for="document in cvDocuments" :key="document.id" :value="document.id">{{ document.name }}</option></select></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'profile'">
            <div class="mt-6"><div class="flex items-center justify-between gap-3"><p class="text-sm font-bold text-stone-700">{{ editorCopy.ui.profileImage }}</p><button class="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800 hover:text-emerald-700" type="button" @click="selectAssetTarget(selectedBlock)"><Upload :size="16" /> {{ editorCopy.ui.uploadImage }}</button></div><img v-if="isPortfolioAssetUrl(selectedBlock.data.imageUrl)" :src="getPortfolioAssetUrl(selectedBlock.data.imageUrl)" :alt="editorCopy.ui.profileImage" class="mt-3 h-32 w-full rounded-md border border-stone-200 object-cover" /></div>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.status }}<input v-model="selectedBlock.data.status" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.performance }}<input v-model="selectedBlock.data.performance" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'metrics'">
            <div v-for="metric in (portfolio?.templateId === 'babysitter-housekeeping' ? ['first', 'second', 'third', 'fourth'] : ['first', 'second', 'third'])" :key="metric" class="mt-4 grid grid-cols-[110px_1fr] gap-2"><label class="text-sm font-bold text-stone-700">{{ editorCopy.ui.value }}<input v-model="selectedBlock.data[`${metric}Value`]" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="text-sm font-bold text-stone-700">{{ editorCopy.ui.label }}<input v-model="selectedBlock.data[`${metric}Label`]" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label></div>
          </template>
          <template v-else-if="selectedBlock.data.role === 'project'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.project.title }}<input v-model="selectedBlock.data.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <div class="mt-4"><div class="flex items-center justify-between gap-3"><p class="text-sm font-bold text-stone-700">{{ editorCopy.project.image }}</p><button class="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800 hover:text-emerald-700" type="button" @click="selectAssetTarget(selectedBlock)"><Upload :size="16" /> {{ editorCopy.ui.uploadImage }}</button></div><img v-if="isPortfolioAssetUrl(selectedBlock.data.imageUrl)" :src="getPortfolioAssetUrl(selectedBlock.data.imageUrl)" :alt="selectedBlock.data.imageAlt || selectedBlock.data.title" class="mt-3 h-32 w-full rounded-md border border-stone-200 object-cover" /></div>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.imageAlt }}<input v-model="selectedBlock.data.imageAlt" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.badges }}<input v-model="selectedBlock.data.badges" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" :placeholder="editorCopy.project.badgesHint" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.summary }}<textarea v-model="selectedBlock.data.summary" class="mt-2 min-h-24 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.tagline }}<input v-model="selectedBlock.data.tagline" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.description }}<textarea v-model="selectedBlock.data.description" class="mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.architecture }}<textarea v-model="selectedBlock.data.architecture" class="mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.technologies }}<input v-model="selectedBlock.data.stack" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" :placeholder="editorCopy.project.badgesHint" /></label>
            <div v-for="metric in ['first', 'second', 'third']" :key="metric" class="mt-4 grid grid-cols-2 gap-2"><label class="text-sm font-bold text-stone-700">{{ editorCopy.project.metricValue }}<input v-model="selectedBlock.data[`${metric}MetricValue`]" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="text-sm font-bold text-stone-700">{{ editorCopy.project.metricLabel }}<input v-model="selectedBlock.data[`${metric}MetricLabel`]" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label></div>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.demoUrl }}<input v-model="selectedBlock.data.demoUrl" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" placeholder="https://..." /></label>
            <label class="mt-3 flex items-center gap-3 text-sm font-bold text-stone-700"><input v-model="selectedBlock.data.showDemoButton" class="h-4 w-4 accent-emerald-800" type="checkbox" /> {{ editorCopy.project.showDemoButton }}</label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.demoUsername }}<input v-model="selectedBlock.data.demoUsername" autocomplete="username" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-3 flex items-center gap-3 text-sm font-bold text-stone-700"><input v-model="selectedBlock.data.showDemoUsername" class="h-4 w-4 accent-emerald-800" type="checkbox" /> {{ editorCopy.project.showDemoUsername }}</label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.demoPassword }}<input v-model="selectedBlock.data.demoPassword" autocomplete="off" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" type="text" /></label>
            <label class="mt-3 flex items-center gap-3 text-sm font-bold text-stone-700"><input v-model="selectedBlock.data.showDemoPassword" class="h-4 w-4 accent-emerald-800" type="checkbox" /> {{ editorCopy.project.showDemoPassword }}</label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.project.githubUrl }}<input v-model="selectedBlock.data.githubUrl" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" placeholder="https://..." /></label>
            <label class="mt-3 flex items-center gap-3 text-sm font-bold text-stone-700"><input v-model="selectedBlock.data.showSourceButton" class="h-4 w-4 accent-emerald-800" type="checkbox" /> {{ editorCopy.project.showSourceButton }}</label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'experience-intro'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.experience.eyebrow }}<input v-model="selectedBlock.data.eyebrow" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.experience.sectionTitle }}<input v-model="selectedBlock.data.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'capabilities-heading'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.experience.headingTitle }}<input v-model="selectedBlock.data.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.experience.headingLabel }}<input v-model="selectedBlock.data.count" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <template v-if="portfolio?.templateId === 'babysitter-housekeeping'"><label class="mt-4 block text-sm font-bold text-stone-700">Babysitting &amp; childcare<input v-model="selectedBlock.data.childcareTitle" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-4 block text-sm font-bold text-stone-700">Housekeeping<input v-model="selectedBlock.data.housekeepingTitle" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label></template>
            <template v-if="portfolio?.templateId === 'babysitter-housekeeping'"><label class="mt-4 block text-sm font-bold text-stone-700">Babysitting &amp; childcare<input v-model="selectedBlock.data.childcareTitle" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-4 block text-sm font-bold text-stone-700">Housekeeping<input v-model="selectedBlock.data.housekeepingTitle" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label></template>
            <div class="mt-5 border-t border-stone-200 pt-4">
              <div class="flex items-center justify-between gap-3"><p class="text-sm font-black text-stone-800">{{ editorCopy.experience.skills }}</p><button class="grid h-9 w-9 place-items-center rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="button" :title="editorCopy.experience.addCapability" :aria-label="editorCopy.experience.addCapability" @click="addCapabilitySkill"><Plus :size="18" /></button></div>
              <article v-for="(skill, skillIndex) in selectedBlock.data.skills" :key="skillIndex" class="mt-3 overflow-hidden rounded-md border border-stone-200">
                <div class="flex min-w-0 items-center gap-2 bg-stone-50 p-2">
                  <button class="grid h-9 w-9 shrink-0 place-items-center rounded border border-stone-200 bg-white text-emerald-800" type="button" :title="editorCopy.experience.selectIcon" :aria-label="editorCopy.experience.selectIcon" @click="isIconPickerOpen = iconPickerSkillIndex !== skillIndex || !isIconPickerOpen; iconPickerSkillIndex = skillIndex"><span class="material-symbols-outlined text-xl leading-none whitespace-nowrap">{{ skill.icon || 'code_blocks' }}</span></button>
                  <button class="min-w-0 flex-1 truncate text-left text-sm font-black text-stone-800" type="button" :aria-expanded="expandedSkillIndex === skillIndex" @click="expandedSkillIndex = expandedSkillIndex === skillIndex ? null : skillIndex">{{ skill.title || editorCopy.experience.untitledCapability }}</button>
                  <button class="grid h-8 w-8 shrink-0 place-items-center rounded text-red-700 hover:bg-red-50" type="button" :title="editorCopy.experience.removeSkill" :aria-label="editorCopy.experience.removeSkill" @click="removeCapabilitySkill(skillIndex)"><Trash2 :size="16" /></button>
                  <button class="grid h-8 w-8 shrink-0 place-items-center rounded text-stone-600 hover:bg-stone-200" type="button" :title="expandedSkillIndex === skillIndex ? editorCopy.ui.hideSection : editorCopy.ui.showSection" :aria-label="expandedSkillIndex === skillIndex ? editorCopy.ui.hideSection : editorCopy.ui.showSection" @click="expandedSkillIndex = expandedSkillIndex === skillIndex ? null : skillIndex"><ChevronDown :size="17" class="transition" :class="expandedSkillIndex === skillIndex ? 'rotate-180' : ''" /></button>
                </div>
                <div v-if="isIconPickerOpen && iconPickerSkillIndex === skillIndex" class="grid grid-cols-6 gap-1 border-t border-stone-200 bg-white p-2"><button v-for="icon in capabilityIcons" :key="icon" class="grid h-10 w-10 place-items-center overflow-hidden rounded-md border text-emerald-800 hover:border-emerald-800 hover:bg-emerald-50" :class="skill.icon === icon ? 'border-emerald-800 bg-emerald-50' : 'border-stone-200'" type="button" :title="icon" :aria-label="icon" @click="selectCapabilityIcon(icon, skillIndex)"><span class="material-symbols-outlined text-xl leading-none whitespace-nowrap">{{ icon }}</span></button></div>
                <div v-if="expandedSkillIndex === skillIndex" class="border-t border-stone-200 p-3">
                  <label v-if="portfolio?.templateId === 'babysitter-housekeeping'" class="block text-sm font-bold text-stone-700">Service category<input v-model="skill.category" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label>
                  <label class="block text-sm font-bold text-stone-700">{{ editorCopy.experience.capabilityTitle }}<input v-model="skill.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label>
                  <label class="mt-3 block text-sm font-bold text-stone-700">{{ editorCopy.experience.capabilityDescription }}<textarea v-model="skill.description" class="mt-2 min-h-20 w-full resize-y rounded-md border border-stone-300 px-3 py-2 text-sm leading-5 outline-none focus:border-emerald-800" /></label>
                  <label v-if="portfolio?.templateId === 'babysitter-housekeeping'" class="mt-3 block text-sm font-bold text-stone-700">Service tagline<input v-model="skill.tagline" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label>
                  <div class="mt-3"><p class="text-sm font-bold text-stone-700">{{ editorCopy.experience.technologies }}</p><div class="mt-2 flex gap-2"><input v-model="newCapabilityTechnology" class="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" :placeholder="editorCopy.experience.technologyPlaceholder" @focus="iconPickerSkillIndex = skillIndex" @keydown.enter.prevent="addCapabilityTechnology" /><button class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="button" :title="editorCopy.experience.addTechnology" :aria-label="editorCopy.experience.addTechnology" @click="iconPickerSkillIndex = skillIndex; addCapabilityTechnology()"><Plus :size="17" /></button></div><div v-if="skill.technologies.length" class="mt-2 flex flex-wrap gap-2"><span v-for="(technology, technologyIndex) in skill.technologies" :key="`${technology}-${technologyIndex}`" class="inline-flex items-center gap-1 rounded bg-emerald-50 py-1 pl-2 pr-1 text-xs font-bold text-emerald-900">{{ technology }}<button class="grid h-5 w-5 place-items-center rounded hover:bg-emerald-100" type="button" :title="editorCopy.experience.removeTechnology" :aria-label="`${editorCopy.experience.removeTechnology}: ${technology}`" @click="iconPickerSkillIndex = skillIndex; removeCapabilityTechnology(technologyIndex)"><X :size="13" /></button></span></div></div>
                </div>
              </article>
            </div>
          </template>
          <template v-else-if="selectedBlock.data.role === 'experience-heading'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.experience.headingTitle }}<input v-model="selectedBlock.data.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.experience.headingLabel }}<input v-model="selectedBlock.data.label" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <div class="mt-5 border-t border-stone-200 pt-4"><div class="flex items-center justify-between gap-3"><p class="text-sm font-black text-stone-800">{{ editorCopy.experience.experiences }}</p><button class="grid h-9 w-9 place-items-center rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="button" :title="editorCopy.experience.addExperience" :aria-label="editorCopy.experience.addExperience" @click="addExperienceItem"><Plus :size="18" /></button></div><article v-for="(experience, experienceIndex) in selectedBlock.data.experiences" :key="experienceIndex" class="mt-3 overflow-hidden rounded-md border border-stone-200"><div class="flex min-w-0 items-center gap-2 bg-stone-50 p-2"><button class="min-w-0 flex-1 truncate text-left text-sm font-black text-stone-800" type="button" :aria-expanded="expandedExperienceIndex === experienceIndex" @click="expandedExperienceIndex = expandedExperienceIndex === experienceIndex ? null : experienceIndex">{{ experience.position || editorCopy.experience.untitledExperience }}</button><span class="max-w-24 truncate text-xs font-semibold text-stone-500">{{ experience.period }}</span><button class="grid h-8 w-8 shrink-0 place-items-center rounded text-red-700 hover:bg-red-50" type="button" :title="editorCopy.experience.removeExperience" :aria-label="editorCopy.experience.removeExperience" @click="removeExperienceItem(experienceIndex)"><Trash2 :size="16" /></button><button class="grid h-8 w-8 shrink-0 place-items-center rounded text-stone-600 hover:bg-stone-200" type="button" :title="expandedExperienceIndex === experienceIndex ? editorCopy.ui.hideSection : editorCopy.ui.showSection" :aria-label="expandedExperienceIndex === experienceIndex ? editorCopy.ui.hideSection : editorCopy.ui.showSection" @click="expandedExperienceIndex = expandedExperienceIndex === experienceIndex ? null : experienceIndex"><ChevronDown :size="17" class="transition" :class="expandedExperienceIndex === experienceIndex ? 'rotate-180' : ''" /></button></div><div v-if="expandedExperienceIndex === experienceIndex" class="border-t border-stone-200 p-3"><label class="block text-sm font-bold text-stone-700">{{ editorCopy.experience.position }}<input v-model="experience.position" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-3 block text-sm font-bold text-stone-700">{{ editorCopy.experience.company }}<input v-model="experience.company" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label><div class="mt-3 grid grid-cols-2 gap-2"><label class="block text-sm font-bold text-stone-700">{{ editorCopy.experience.period }}<input v-model="experience.period" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label><label class="block text-sm font-bold text-stone-700">{{ editorCopy.experience.currentLabel }}<input v-model="experience.currentLabel" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label></div><label class="mt-3 block text-sm font-bold text-stone-700">{{ editorCopy.experience.description }}<textarea v-model="experience.description" class="mt-2 min-h-24 w-full resize-y rounded-md border border-stone-300 px-3 py-2 text-sm leading-5 outline-none focus:border-emerald-800" /></label></div></article></div>
          </template>
          <template v-else-if="selectedBlock.data.role === 'experience-cv'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.experience.eyebrow }}<input v-model="selectedBlock.data.eyebrow" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.experience.sectionTitle }}<input v-model="selectedBlock.data.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.experience.meta }}<input v-model="selectedBlock.data.meta" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.experience.actionLabel }}<input v-model="selectedBlock.data.actionLabel" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.experience.linkedinUrl }}<input v-model="selectedBlock.data.linkedinUrl" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" placeholder="https://linkedin.com/in/..." type="url" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'conversation'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.conversation.eyebrow }}<input v-model="selectedBlock.data.eyebrow" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.conversation.heading }}<input v-model="selectedBlock.data.heading" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.conversation.description }}<textarea v-model="selectedBlock.data.description" class="mt-2 min-h-28 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.conversation.actionLabel }}<input v-model="selectedBlock.data.actionLabel" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <p class="mt-4 text-sm font-semibold text-stone-500">{{ editorCopy.conversation.emailLocked }}: {{ authStore.session?.email }}</p>
          </template>
          <template v-else-if="selectedBlock.data.role === 'footer-identity'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.footer.brand }}<input v-model="selectedBlock.data.brand" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.footer.name }}<input v-model="selectedBlock.data.name" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.footer.summary }}<textarea v-model="selectedBlock.data.summary" class="mt-2 min-h-24 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.footer.location }}<input v-model="selectedBlock.data.location" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <template v-if="portfolio?.templateId === 'babysitter-housekeeping'"><label class="mt-4 block text-sm font-bold text-stone-700">Copyright text<input v-model="selectedBlock.data.copyright" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-4 block text-sm font-bold text-stone-700">Legal link label 1<input v-model="selectedBlock.data.legalLinkOne" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-3 block text-sm font-bold text-stone-700">Legal link URL 1<input v-model="selectedBlock.data.legalUrlOne" type="url" placeholder="https://..." class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-4 block text-sm font-bold text-stone-700">Legal link label 2<input v-model="selectedBlock.data.legalLinkTwo" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-3 block text-sm font-bold text-stone-700">Legal link URL 2<input v-model="selectedBlock.data.legalUrlTwo" type="url" placeholder="https://..." class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label></template>
          </template>
          <template v-else-if="selectedBlock.data.role === 'footer-channels'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.footer.channelsTitle }}<input v-model="selectedBlock.data.heading" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <div class="mt-5 border-t border-stone-200 pt-4">
              <div class="flex items-center justify-between gap-3"><p class="text-sm font-black text-stone-800">{{ editorCopy.footer.channelList }}</p><button class="grid h-9 w-9 place-items-center rounded-md bg-emerald-900 text-white hover:bg-emerald-800" type="button" :title="editorCopy.footer.addChannel" :aria-label="editorCopy.footer.addChannel" @click="addFooterChannel"><Plus :size="18" /></button></div>
              <article v-for="(channel, channelIndex) in selectedBlock.data.channels" :key="channelIndex" class="mt-3 overflow-hidden rounded-md border border-stone-200">
                <div class="flex min-w-0 items-center gap-2 bg-stone-50 p-2"><button class="min-w-0 flex-1 truncate text-left text-sm font-black text-stone-800" type="button" :aria-expanded="expandedFooterChannelIndex === channelIndex" @click="expandedFooterChannelIndex = expandedFooterChannelIndex === channelIndex ? null : channelIndex">{{ channel.label || editorCopy.footer.untitledChannel }}</button><button class="grid h-8 w-8 shrink-0 place-items-center rounded text-red-700 hover:bg-red-50" type="button" :title="editorCopy.footer.removeChannel" :aria-label="editorCopy.footer.removeChannel" @click="removeFooterChannel(channelIndex)"><Trash2 :size="16" /></button><button class="grid h-8 w-8 shrink-0 place-items-center rounded text-stone-600 hover:bg-stone-200" type="button" :title="expandedFooterChannelIndex === channelIndex ? editorCopy.ui.hideSection : editorCopy.ui.showSection" @click="expandedFooterChannelIndex = expandedFooterChannelIndex === channelIndex ? null : channelIndex"><ChevronDown :size="17" class="transition" :class="expandedFooterChannelIndex === channelIndex ? 'rotate-180' : ''" /></button></div>
                <div v-if="expandedFooterChannelIndex === channelIndex" class="border-t border-stone-200 p-3"><label class="block text-sm font-bold text-stone-700">{{ editorCopy.footer.channelLabel }}<input v-model="channel.label" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-3 block text-sm font-bold text-stone-700">{{ editorCopy.footer.channelUrl }}<input v-model="channel.url" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" placeholder="https://..." type="url" /></label></div>
              </article>
            </div>
          </template>
          <template v-else-if="selectedBlock.data.role === 'footer-contact'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.footer.contactTitle }}<input v-model="selectedBlock.data.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.footer.contactDescription }}<textarea v-model="selectedBlock.data.description" class="mt-2 min-h-24 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" /></label>
            <template v-if="portfolio?.templateId === 'babysitter-housekeeping'"><label class="mt-4 block text-sm font-bold text-stone-700">Phone label<input v-model="selectedBlock.data.phoneLabel" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-4 block text-sm font-bold text-stone-700">Phone<input v-model="selectedBlock.data.phone" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" type="tel" /></label><label class="mt-4 block text-sm font-bold text-stone-700">WhatsApp label<input v-model="selectedBlock.data.whatsappLabel" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-4 block text-sm font-bold text-stone-700">WhatsApp<input v-model="selectedBlock.data.whatsapp" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" type="tel" /></label><label class="mt-4 block text-sm font-bold text-stone-700">Email label<input v-model="selectedBlock.data.emailLabel" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label></template>
            <p class="mt-4 text-sm font-semibold text-stone-500">{{ editorCopy.footer.emailLocked }}: {{ authStore.session?.email }}</p>
          </template>
          <template v-else-if="selectedBlock.data.role === 'care-overview'">
            <p class="mt-5 border-b border-stone-200 pb-2 text-xs font-black uppercase text-emerald-800">{{ careEditorLabels.overview }}</p>
            <label v-for="field in ['registry', 'availabilityLabel', 'legalFirst', 'legalSecond', 'rate', 'domainDescription']" :key="field" class="mt-4 block text-sm font-bold text-stone-700">{{ careEditorLabels[field] }}<textarea v-if="field === 'domainDescription'" v-model="selectedBlock.data[field]" class="mt-2 min-h-20 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-5 outline-none focus:border-emerald-800" /><input v-else v-model="selectedBlock.data[field]" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'care-testimonial'">
            <label class="mt-6 block text-sm font-bold text-stone-700">{{ careEditorLabels.location }}<input v-model="selectedBlock.data.location" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ careEditorLabels.quote }}<textarea v-model="selectedBlock.data.quote" class="mt-2 min-h-32 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ careEditorLabels.rating }}<input v-model.number="selectedBlock.data.rating" type="number" min="1" max="5" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
          </template>
          <template v-else-if="selectedBlock.data.role === 'care-certifications'">
            <label v-for="field in ['eyebrow', 'title', 'description', 'vaultText', 'accreditationsTitle', 'privacyFirst', 'privacySecond']" :key="field" class="mt-4 block text-sm font-bold text-stone-700">{{ careEditorLabels[field] }}<textarea v-if="['description', 'vaultText'].includes(field)" v-model="selectedBlock.data[field]" class="mt-2 min-h-20 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-5 outline-none focus:border-emerald-800" /><input v-else v-model="selectedBlock.data[field]" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <div class="mt-5 border-t border-stone-200 pt-4"><div class="flex items-center justify-between gap-3"><p class="text-sm font-black text-stone-800">{{ careEditorLabels.certifications }}</p><button class="grid h-9 w-9 place-items-center rounded-md bg-emerald-900 text-white" type="button" :title="careEditorLabels.addCertificate" :aria-label="careEditorLabels.addCertificate" @click="selectedBlock.data.certificates.push({ icon: 'workspace_premium', title: '', description: '' })"><Plus :size="17" /></button></div>
              <article v-for="(certificate, index) in selectedBlock.data.certificates" :key="index" class="mt-3 rounded-md border border-stone-200 p-3"><div class="flex items-center justify-between"><p class="text-sm font-black text-stone-800">{{ certificate.title || `${careEditorLabels.certificate} ${index + 1}` }}</p><button class="grid h-8 w-8 place-items-center rounded text-red-700 hover:bg-red-50" type="button" :title="careEditorLabels.remove" :aria-label="careEditorLabels.remove" @click="selectedBlock.data.certificates.splice(index, 1)"><Trash2 :size="15" /></button></div><label class="mt-3 block text-sm font-bold text-stone-700">{{ careEditorLabels.icon }}<input v-model="certificate.icon" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-3 block text-sm font-bold text-stone-700">{{ careEditorLabels.title }}<input v-model="certificate.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-800" /></label><label class="mt-3 block text-sm font-bold text-stone-700">{{ careEditorLabels.description }}<textarea v-model="certificate.description" class="mt-2 min-h-20 w-full resize-y rounded-md border border-stone-300 px-3 py-2 text-sm leading-5 outline-none focus:border-emerald-800" /></label></article>
            </div>
            <div class="mt-5 border-t border-stone-200 pt-4"><div class="flex items-center justify-between gap-3"><p class="text-sm font-black text-stone-800">{{ careEditorLabels.accreditation }}</p><button class="grid h-9 w-9 place-items-center rounded-md bg-emerald-900 text-white" type="button" :title="careEditorLabels.addAccreditation" :aria-label="careEditorLabels.addAccreditation" @click="selectedBlock.data.accreditations.push('')"><Plus :size="17" /></button></div><div v-for="(item, index) in selectedBlock.data.accreditations" :key="index" class="mt-3 flex gap-2"><input v-model="selectedBlock.data.accreditations[index]" class="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /><button class="grid h-10 w-10 shrink-0 place-items-center rounded text-red-700 hover:bg-red-50" type="button" :title="careEditorLabels.remove" :aria-label="careEditorLabels.remove" @click="selectedBlock.data.accreditations.splice(index, 1)"><Trash2 :size="15" /></button></div></div>
          </template>
          <template v-else-if="selectedBlock.data.role === 'care-inquiry'">
            <label v-for="field in ['eyebrow', 'title', 'description', 'nameLabel', 'namePlaceholder', 'emailLabel', 'emailPlaceholder', 'regionLabel', 'scopeLabel', 'submitLabel', 'confirmationTitle', 'confirmationDescription', 'securityLabel', 'directLine']" :key="field" class="mt-4 block text-sm font-bold text-stone-700">{{ careEditorLabels[field] }}<textarea v-if="['description', 'confirmationDescription'].includes(field)" v-model="selectedBlock.data[field]" class="mt-2 min-h-20 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-5 outline-none focus:border-emerald-800" /><input v-else v-model="selectedBlock.data[field]" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <div v-for="listName in ['regions', 'scopes']" :key="listName" class="mt-5 border-t border-stone-200 pt-4"><div class="flex items-center justify-between gap-3"><p class="text-sm font-black text-stone-800">{{ careEditorLabels[listName] }}</p><button class="grid h-9 w-9 place-items-center rounded-md bg-emerald-900 text-white" type="button" :title="careEditorLabels.addOption" :aria-label="careEditorLabels.addOption" @click="selectedBlock.data[listName].push({ value: `option-${selectedBlock.data[listName].length + 1}`, label: '' })"><Plus :size="17" /></button></div><div v-for="(option, index) in selectedBlock.data[listName]" :key="index" class="mt-3 flex gap-2"><input v-model="option.label" class="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" :aria-label="`${careEditorLabels.option} ${index + 1}`" /><button class="grid h-10 w-10 shrink-0 place-items-center rounded text-red-700 hover:bg-red-50" type="button" :title="careEditorLabels.remove" :aria-label="careEditorLabels.remove" @click="selectedBlock.data[listName].splice(index, 1)"><Trash2 :size="15" /></button></div></div>
          </template>
          <template v-else-if="selectedBlock.data.role === 'terminal'">
            <label class="mt-6 flex items-center gap-3 text-sm font-bold text-stone-700"><input v-model="selectedBlock.enabled" class="h-4 w-4 accent-emerald-800" type="checkbox" @change="scheduleSave" /> {{ editorCopy.ui.showTerminal }}</label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.branch }}<input v-model="selectedBlock.data.branch" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.precision }}<input v-model="selectedBlock.data.precision" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
            <label class="mt-4 block text-sm font-bold text-stone-700">FPS<input v-model="selectedBlock.data.fps" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" /></label>
          </template>
          <label v-if="!selectedBlock.data.role" class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.ui.title }}<input v-model="selectedBlock.data.title" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-800" :placeholder="editorCopy.ui.titlePlaceholder" /></label>
          <label v-if="!selectedBlock.data.role" class="mt-4 block text-sm font-bold text-stone-700">{{ editorCopy.ui.description }}<textarea v-model="selectedBlock.data.summary" class="mt-2 min-h-40 w-full resize-y rounded-md border border-stone-300 px-3 py-2.5 text-sm leading-6 outline-none focus:border-emerald-800" :placeholder="editorCopy.ui.descriptionPlaceholder" /></label>
          <div class="mt-5 grid grid-cols-2 gap-2"><button class="inline-flex items-center justify-center gap-1 rounded-md border border-stone-300 py-2 text-sm font-bold hover:border-emerald-800" type="button" :title="editorCopy.ui.moveUp" @click="moveBlock(-1)"><ChevronUp :size="17" /> {{ editorCopy.ui.moveUp }}</button><button class="inline-flex items-center justify-center gap-1 rounded-md border border-stone-300 py-2 text-sm font-bold hover:border-emerald-800" type="button" :title="editorCopy.ui.moveDown" @click="moveBlock(1)"><ChevronDown :size="17" /> {{ editorCopy.ui.moveDown }}</button></div>
          <button v-if="canRemoveSelectedBlock" class="mt-3 inline-flex w-full items-center justify-center gap-2 py-2 text-sm font-bold text-red-700 hover:bg-red-50" type="button" @click="removeBlock"><Trash2 :size="16" /> {{ editorCopy.ui.deleteHero }}</button>
          <input ref="assetInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" @change="uploadAsset" />
          </div>
        </aside>
      </div>
    </section>

    <div v-if="isSettingsOpen" class="fixed inset-0 z-50 grid place-items-center bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="portfolio-settings-title" @click.self="isSettingsOpen = false">
      <section class="w-full max-w-lg bg-white p-6 shadow-2xl sm:p-8">
        <div class="flex items-start justify-between gap-4">
          <div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ editorCopy.dialogs.configuration }}</p><h2 id="portfolio-settings-title" class="mt-1 text-2xl font-black">{{ editorCopy.ui.settings }}</h2></div>
          <button class="grid h-9 w-9 place-items-center text-stone-500 hover:bg-stone-100" type="button" :aria-label="editorCopy.dialogs.close" @click="isSettingsOpen = false"><X :size="20" /></button>
        </div>
        <label class="mt-6 block text-sm font-bold text-stone-700">{{ editorCopy.dialogs.visibility }}<select v-model="portfolio.visibility" class="mt-2 w-full border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-800"><option value="private">{{ editorCopy.dialogs.private }}</option><option value="public">{{ editorCopy.dialogs.public }}</option></select></label>
        <label class="mt-5 block text-sm font-bold text-stone-700">{{ editorCopy.dialogs.portfolioLanguage }}<select v-model="portfolio.content.theme.language" class="mt-2 w-full border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-800"><option value="es">{{ editorCopy.dialogs.spanish }}</option><option value="en">{{ editorCopy.dialogs.english }}</option><option value="pt-BR">{{ editorCopy.dialogs.portuguese }}</option></select></label>
        <label class="mt-5 flex items-center gap-3 text-sm font-bold text-stone-700"><input :checked="isSectionVisible(sections.find((section) => section.id === 'projects'))" class="h-4 w-4 accent-emerald-800" type="checkbox" @change="setSectionVisibility(sections.find((section) => section.id === 'projects'), $event.target.checked)" /> {{ editorCopy.dialogs.showProjects }}</label>
        <div class="mt-5"><div class="flex items-center justify-between"><span class="text-sm font-bold text-stone-700">{{ editorCopy.dialogs.coverImage }}</span><button class="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-800 hover:text-emerald-700" type="button" @click="coverInput?.click()"><Upload :size="16" /> {{ editorCopy.dialogs.upload }}</button></div><input ref="coverInput" class="sr-only" type="file" accept="image/*" @change="uploadCover" /><div class="mt-2 flex min-h-24 items-center justify-center border border-dashed border-stone-300 bg-stone-50 text-sm font-semibold text-stone-500"><img v-if="portfolio.coverImageUrl" :src="portfolio.coverImageUrl" :alt="editorCopy.dialogs.currentCover" class="h-28 w-full object-cover" /><span v-else class="inline-flex items-center gap-2"><ImagePlus :size="18" /> {{ editorCopy.dialogs.noCover }}</span></div></div>
        <button class="mt-6 inline-flex w-full items-center justify-center gap-2 bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-800" type="button" @click="savePortfolio(); isSettingsOpen = false"><Check :size="17" /> {{ editorCopy.dialogs.saveSettings }}</button>
      </section>
    </div>

    <div v-if="isRevisionPanelOpen" class="fixed inset-0 z-50 grid place-items-center bg-stone-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="revisions-title" @click.self="isRevisionPanelOpen = false"><section class="w-full max-w-xl bg-white p-6 shadow-2xl sm:p-8"><div class="flex items-start justify-between gap-4"><div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ editorCopy.dialogs.history }}</p><h2 id="revisions-title" class="mt-1 text-2xl font-black">{{ editorCopy.dialogs.savedVersions }}</h2></div><button class="grid h-9 w-9 place-items-center text-stone-500 hover:bg-stone-100" type="button" :aria-label="editorCopy.dialogs.close" @click="isRevisionPanelOpen = false"><X :size="20" /></button></div><div v-if="isLoadingRevisions" class="flex items-center gap-2 py-10 text-sm font-semibold text-stone-500"><LoaderCircle :size="18" class="animate-spin" /> {{ editorCopy.dialogs.loadingVersions }}</div><p v-else-if="!revisions.length" class="py-10 text-sm text-stone-600">{{ editorCopy.dialogs.noVersions }}</p><div v-else class="mt-5 divide-y divide-stone-200"><div v-for="revision in revisions" :key="revision.id" class="flex items-center justify-between gap-4 py-4"><div><p class="font-bold text-stone-900">{{ revision.name || `${editorCopy.dialogs.version} ${revision.id}` }}</p><p class="mt-1 text-sm text-stone-500">{{ formatRevisionDate(revision.created_at) }}</p></div><button class="inline-flex shrink-0 items-center gap-2 border border-stone-300 px-3 py-2 text-sm font-extrabold text-stone-700 hover:border-emerald-800 hover:text-emerald-800" type="button" @click="restoreRevision(revision)"><RotateCcw :size="16" /> {{ editorCopy.dialogs.restore }}</button></div></div></section></div>

    <div v-if="isMetricsOpen" class="fixed inset-0 z-50 overflow-y-auto bg-stone-950/45 p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="portfolio-metrics-title" @click.self="isMetricsOpen = false"><section class="mx-auto my-4 w-full max-w-3xl bg-white p-5 shadow-2xl sm:my-10 sm:p-7"><div class="flex items-start justify-between gap-4 border-b border-stone-200 pb-4"><div><p class="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800"><BarChart3 :size="15" /> Métricas</p><h2 id="portfolio-metrics-title" class="mt-1 text-2xl font-black">Rendimiento de {{ portfolio.name }}</h2></div><button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 hover:bg-stone-100" type="button" aria-label="Cerrar métricas" title="Cerrar métricas" @click="isMetricsOpen = false"><X :size="20" /></button></div><form class="mt-4 flex flex-wrap items-end gap-2" @submit.prevent="fetchPortfolioReport"><label class="text-xs font-bold text-stone-600">Desde<input v-model="portfolioReportFrom" class="mt-1 block h-9 rounded-md border border-stone-300 px-2 text-sm outline-none focus:border-emerald-700" type="date" /></label><label class="text-xs font-bold text-stone-600">Hasta<input v-model="portfolioReportTo" class="mt-1 block h-9 rounded-md border border-stone-300 px-2 text-sm outline-none focus:border-emerald-700" type="date" /></label><button class="h-9 rounded-md bg-emerald-900 px-3 text-xs font-extrabold text-white hover:bg-emerald-800 disabled:opacity-60" type="submit" :disabled="isLoadingPortfolioReport">Aplicar</button></form><p v-if="portfolioReportError" class="mt-5 border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{{ portfolioReportError }}</p><div v-else-if="isLoadingPortfolioReport" class="grid min-h-48 place-items-center text-sm font-semibold text-stone-500">Cargando visualizaciones...</div><template v-else-if="portfolioReport"><div class="mt-5 grid gap-3 sm:grid-cols-2"><div class="border border-emerald-200 bg-emerald-50 p-4"><p class="text-xs font-bold text-emerald-800">Visualizaciones totales</p><p class="mt-1 text-3xl font-black text-emerald-950">{{ portfolioReport.summary?.total_views || 0 }}</p></div><div class="border border-stone-200 bg-stone-50 p-4"><p class="text-xs font-bold text-stone-600">Visitantes únicos</p><p class="mt-1 text-3xl font-black text-stone-950">{{ portfolioReport.summary?.unique_visitors || 0 }}</p></div></div><div class="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]"><div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-stone-500">Vistas por día</p><div v-if="portfolioReport.daily?.length" class="mt-3 flex h-36 items-end gap-2 border-b border-stone-200"><div v-for="day in portfolioReport.daily" :key="day.date" class="flex min-w-7 flex-1 flex-col justify-end"><span class="rounded-t-sm bg-emerald-700" :style="{ height: `${Math.max((day.views / portfolioReportMaxViews) * 100, 4)}%` }" :aria-label="`${day.views} vistas el ${day.date}`"></span><span class="mt-2 truncate text-center text-[10px] font-bold text-stone-500">{{ day.date.slice(5) }}</span></div></div><p v-else class="mt-3 text-sm font-semibold text-stone-500">No hay visualizaciones para este período.</p></div><div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-stone-500">Principales fuentes</p><div v-if="portfolioReport.referrers?.length" class="mt-3 space-y-2"><div v-for="referrer in portfolioReport.referrers.slice(0, 5)" :key="referrer.referrer_host || 'direct'" class="flex items-center justify-between gap-3 border-b border-stone-100 pb-2 text-sm"><span class="truncate font-semibold text-stone-700">{{ referrer.referrer_host || 'Directo' }}</span><span class="shrink-0 font-extrabold text-emerald-800">{{ referrer.views }}</span></div></div><p v-else class="mt-3 text-sm font-semibold text-stone-500">No hay fuentes registradas.</p></div></div></template><PortfolioGeoMap :report="geoReport" :is-loading="isLoadingGeoReport" :error="geoReportError" :selected-code="selectedGeoCountryCode" @select="selectGeoCountry" @refresh="refreshGeoReport" /></section></div>

    <div v-if="isPreviewOpen && !livePreviewHtml" class="fixed inset-0 z-[60] bg-white" role="dialog" aria-modal="true" aria-labelledby="portfolio-preview-title"><section class="flex h-[100dvh] w-screen flex-col bg-white"><header class="flex shrink-0 items-center justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6"><div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ editorCopy.dialogs.preview }}</p><h2 id="portfolio-preview-title" class="mt-1 text-xl font-black text-stone-950">{{ portfolio.name }}</h2></div><button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900" type="button" :aria-label="editorCopy.dialogs.closePreview" :title="editorCopy.dialogs.closePreview" @click="isPreviewOpen = false"><X :size="20" /></button></header><iframe :src="templatePreviewUrl" :title="`${editorCopy.dialogs.preview}: ${portfolio.name}`" class="block min-h-0 w-full flex-1 border-0 bg-white" /></section></div>
    <div v-if="isPreviewOpen && livePreviewHtml" class="fixed inset-0 z-[70] bg-white" role="dialog" aria-modal="true" aria-labelledby="live-portfolio-preview-title">
      <section class="flex h-[100dvh] w-screen flex-col bg-white">
        <header class="flex items-center justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
          <div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ editorCopy.dialogs.livePreview }}</p><h2 id="live-portfolio-preview-title" class="mt-1 text-xl font-black text-stone-950">{{ portfolio.name }}</h2></div>
          <button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900" type="button" :aria-label="editorCopy.dialogs.closePreview" :title="editorCopy.dialogs.closePreview" @click="isPreviewOpen = false"><X :size="20" /></button>
        </header>
        <iframe ref="fullscreenPreviewFrame" :srcdoc="livePreviewHtml" :title="`${editorCopy.dialogs.preview}: ${portfolio.name}`" class="block min-h-0 w-full flex-1 border-0 bg-white" @load="updateLiveHero" />
      </section>
    </div>
    <Transition name="toast"><div v-if="heroUnavailableToast" class="fixed right-4 top-4 z-[80] flex max-w-sm items-center gap-3 border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-950 shadow-xl shadow-emerald-950/10 sm:right-6 sm:top-6" role="status"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-800 text-white"><Check :size="17" /></span><span>{{ heroUnavailableToast }}</span></div></Transition>
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