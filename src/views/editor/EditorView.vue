<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { BriefcaseBusiness, CheckCircle2, ChevronDown, CircleHelp, Download, Eye, FileUp, GraduationCap, Mail, Pencil, Plus, Sparkles, Trash2, X } from '@lucide/vue'
import FieldGroup from '../../components/forms/FieldGroup.vue'
import EmailRecipientsInput from '../../components/forms/EmailRecipientsInput.vue'
import CvPreview from '../../components/cv/CvPreview.vue'
import WorkspaceNav from '../../components/navigation/WorkspaceNav.vue'
import { useCvStore } from '../../stores/cvStore'
import { useAuthStore } from '../../stores/authStore'
import { useLocaleStore } from '../../stores/localeStore'
import { dateLocales } from '../../config/locales'

const cvStore = useCvStore()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { cv, cvDocuments, selectedCountryId, destinationCountries, isLoadingDestinationCountries, destinationCountriesError, qualificationLevels, isLoadingQualificationLevels, qualificationLevelsError, immigrationStatuses, isLoadingImmigrationStatuses, immigrationStatusesError, isSaving, saveError, lastSavedAt, activeCvDocument, activeCountryConfig, legalWarning, shouldShowPhoto } = storeToRefs(cvStore)
const { selectedLanguageId, translations: copy } = storeToRefs(localeStore)
const profilePhotoUrl = computed(() => authStore.session?.photoUrl || '')
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 1949 }, (_, index) => String(currentYear - index))
const isEducationDialogOpen = ref(false)
const editingEducationIndex = ref(null)
const educationForm = reactive(createEmptyEducation())
const educationError = ref('')
const isExperienceDialogOpen = ref(false)
const editingExperienceIndex = ref(null)
const experienceForm = reactive(createEmptyExperience())
const experienceError = ref('')
const newSkill = ref('')
const newLanguage = ref('')
const newInterest = ref('')
const deletion = ref(null)
const isExportingPdf = ref(false)
const exportError = ref('')
const isPdfLanguageDialogOpen = ref(false)
const pdfLanguage = ref('es')
const isEmailDialogOpen = ref(false)
const isSendingEmail = ref(false)
const emailError = ref('')
const emailSuccess = ref('')
const emailForm = reactive({ recipientEmails: [], subject: '', body: '', language: 'es' })
const recommendationError = ref('')
const isUploadingRecommendation = ref(false)
const isCvDetailsDialogOpen = ref(false)
const isLoadingIndustries = ref(false)
const industries = ref([])
const cvDetailsError = ref('')
const cvDetailsForm = reactive({ name: '', industryId: '' })
const isSaveNoticeVisible = ref(false)
const editorMode = ref('edit')
const previewViewport = ref(null)
const previewPaper = ref(null)
const editorModeSwitcher = ref(null)
const previewScale = ref(1)
const previewHeight = ref(0)
const modeScrollPositions = { edit: 0, preview: null }
const isAiReviewDialogOpen = ref(false)
const isRequestingAiReview = ref(false)
const aiReviewError = ref('')
const aiReview = ref(null)
const isReadinessScoreHelpOpen = ref(false)
let previousBodyOverflow = ''
let previewResizeObserver
let previewUpdateTimer
let saveNoticeTimer

const aiCopy = computed(() => ({
  es: {
    action: 'Revisar con IA', loading: 'Revisando CV...', title: 'Revisión ATS con IA', description: 'Analizamos claridad, estructura y adecuación para el mercado seleccionado. Revisa cada cambio antes de aplicarlo.', score: 'Puntaje de preparación', scoreHelpAction: 'Cómo interpretar el puntaje de preparación', scoreHelpTitle: 'Sobre el puntaje de preparación', scoreHelpIntro: 'Es una referencia de qué tan claro y compatible es tu CV con sistemas ATS para el mercado seleccionado.', scoreHelpNotGoal: 'No es una probabilidad de contratación ni una meta que deba llegar a 100/100.', scoreHelpImprove: 'Mejóralo únicamente con información real: resultados medibles, habilidades relevantes y descripciones claras.', scoreHelpVariation: 'El resultado puede cambiar según el puesto y país de destino. Usa las mejoras prioritarias como guía antes de volver a revisarlo.', strengths: 'Lo que ya funciona', issues: 'Mejoras prioritarias', noIssues: 'No encontramos mejoras prioritarias para este CV.', summarySuggestion: 'Resumen profesional sugerido', noSummarySuggestion: 'El resumen actual no requiere cambios prioritarios.', detectedLanguage: 'Idioma detectado', applySummary: 'Aplicar resumen', close: 'Cerrar', error: 'No fue posible revisar el CV. Inténtalo nuevamente.',
  },
  en: {
    action: 'Review with AI', loading: 'Reviewing CV...', title: 'AI ATS review', description: 'We analyze clarity, structure, and fit for the selected market. Review every change before applying it.', score: 'Readiness score', scoreHelpAction: 'How to interpret the readiness score', scoreHelpTitle: 'About the readiness score', scoreHelpIntro: 'It is a reference for how clear and compatible your CV is with ATS systems for the selected market.', scoreHelpNotGoal: 'It is not a hiring probability or a target that must reach 100/100.', scoreHelpImprove: 'Improve it only with real information: measurable results, relevant skills, and clear descriptions.', scoreHelpVariation: 'The result can vary by role and destination country. Use the priority improvements as a guide before reviewing again.', strengths: 'What is already working', issues: 'Priority improvements', noIssues: 'No priority improvements were found for this CV.', summarySuggestion: 'Suggested professional summary', noSummarySuggestion: 'The current summary does not need priority changes.', detectedLanguage: 'Detected language', applySummary: 'Apply summary', close: 'Close', error: 'We could not review the CV. Please try again.',
  },
  'pt-BR': {
    action: 'Revisar com IA', loading: 'Revisando CV...', title: 'Revisão ATS com IA', description: 'Analisamos clareza, estrutura e adequação ao mercado selecionado. Revise cada alteração antes de aplicá-la.', score: 'Pontuação de preparação', scoreHelpAction: 'Como interpretar a pontuação de preparação', scoreHelpTitle: 'Sobre a pontuação de preparação', scoreHelpIntro: 'É uma referência de quão claro e compatível é o seu CV com sistemas ATS para o mercado selecionado.', scoreHelpNotGoal: 'Não é uma probabilidade de contratação nem uma meta que deva chegar a 100/100.', scoreHelpImprove: 'Melhore-a apenas com informações reais: resultados mensuráveis, habilidades relevantes e descrições claras.', scoreHelpVariation: 'O resultado pode variar conforme a vaga e o país de destino. Use as melhorias prioritárias como guia antes de revisar novamente.', strengths: 'O que já funciona', issues: 'Melhorias prioritárias', noIssues: 'Não encontramos melhorias prioritárias para este CV.', summarySuggestion: 'Resumo profissional sugerido', noSummarySuggestion: 'O resumo atual não precisa de alterações prioritárias.', detectedLanguage: 'Idioma detectado', applySummary: 'Aplicar resumo', close: 'Fechar', error: 'Não foi possível revisar o CV. Tente novamente.',
  },
}[localeStore.locale] || {}))

const aiReviewIssues = computed(() => aiReview.value?.issues || aiReview.value?.recommendations || [])
const aiReviewStrengths = computed(() => aiReview.value?.strengths || [])
const suggestedProfessionalSummary = computed(() => (
  aiReview.value?.suggestedChanges?.professionalSummary
  || aiReview.value?.suggested_changes?.professional_summary
  || aiReview.value?.professional_summary
  || ''
))

function updatePreviewScale() {
  if (!previewViewport.value || !previewPaper.value) return
  previewScale.value = Math.min(1, previewViewport.value.clientWidth / 794)
  previewHeight.value = previewPaper.value.scrollHeight * previewScale.value
}

async function setEditorMode(mode) {
  if (mode === editorMode.value) return
  modeScrollPositions[editorMode.value] = window.scrollY
  editorMode.value = mode
  await nextTick()
  const initialModePosition = Math.max(0, (editorModeSwitcher.value?.offsetTop ?? 64) - 64)
  window.scrollTo({ top: modeScrollPositions[mode] ?? initialModePosition, behavior: 'auto' })
  if (mode === 'preview') {
    updatePreviewScale()
    requestAnimationFrame(() => requestAnimationFrame(updatePreviewScale))
    window.clearTimeout(previewUpdateTimer)
    previewUpdateTimer = window.setTimeout(updatePreviewScale, 150)
  }
}
const marketSkills = {
  es: [
  'Comunicación efectiva', 'Trabajo en equipo', 'Liderazgo', 'Resolución de problemas', 'Pensamiento crítico', 'Gestión del tiempo', 'Adaptabilidad', 'Negociación', 'Atención al detalle', 'Servicio al cliente',
  'Microsoft Excel', 'Microsoft Word', 'Microsoft PowerPoint', 'Google Workspace', 'Gestión de proyectos', 'Scrum', 'Agile', 'Jira', 'Asana', 'Trello', 'Notion',
  'Ventas consultivas', 'Prospección comercial', 'Gestión de cuentas', 'CRM', 'Salesforce', 'HubSpot', 'E-commerce', 'Marketing digital', 'SEO', 'SEM', 'Google Analytics', 'Redes sociales', 'Email marketing', 'Copywriting',
  'Contabilidad', 'Facturación', 'Cuentas por pagar', 'Cuentas por cobrar', 'Conciliación bancaria', 'Presupuestos', 'Control de gestión', 'Análisis financiero', 'Auditoría', 'SAP', 'Power BI', 'Data Analysis',
  'Reclutamiento y selección', 'Entrevistas por competencias', 'Onboarding', 'Capacitación', 'Desarrollo organizacional', 'Gestión de nómina', 'Legislación laboral', 'People Analytics',
  'Atención de pacientes', 'Historia clínica', 'Toma de signos vitales', 'Primeros auxilios', 'Administración de medicamentos', 'Bioseguridad', 'Laboratorio clínico', 'Gestión hospitalaria',
  'Planificación de clases', 'Evaluación educativa', 'Diseño instruccional', 'Gestión de aula', 'Educación inclusiva', 'Capacitación corporativa', 'Investigación académica',
  'Gestión de inventario', 'Logística', 'Cadena de suministro', 'Compras', 'Planificación de demanda', 'Control de calidad', 'Lean Manufacturing', 'Six Sigma', 'Seguridad industrial', 'Mantenimiento preventivo',
  'AutoCAD', 'Lectura de planos', 'Supervisión de obra', 'Presupuestos de obra', 'Prevención de riesgos', 'Gestión de contratistas', 'Topografía', 'Instalaciones eléctricas',
  'Recepción hotelera', 'Gestión de reservas', 'Turismo', 'Manipulación de alimentos', 'Cocina profesional', 'Barismo', 'Servicio de mesa', 'Gestión de eventos', 'Caja y punto de venta',
  'Diseño gráfico', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere Pro', 'Figma', 'UX/UI', 'Fotografía', 'Edición de video', 'Redacción', 'Traducción',
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Go', 'Ruby', 'SQL', 'Vue.js', 'React', 'Angular', 'Next.js', 'Nuxt', 'Node.js', 'Laravel', '.NET', 'Spring Boot',
  'HTML5', 'CSS3', 'Tailwind CSS', 'Sass', 'REST APIs', 'GraphQL', 'Microservices', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git',
  ],
  en: [
    'Effective communication', 'Teamwork', 'Leadership', 'Problem solving', 'Critical thinking', 'Time management', 'Adaptability', 'Negotiation', 'Attention to detail', 'Customer service',
    'Microsoft Excel', 'Microsoft Word', 'Microsoft PowerPoint', 'Google Workspace', 'Project management', 'Scrum', 'Agile', 'Jira', 'Asana', 'Trello', 'Notion',
    'Consultative sales', 'Sales prospecting', 'Account management', 'CRM', 'Salesforce', 'HubSpot', 'E-commerce', 'Digital marketing', 'SEO', 'SEM', 'Google Analytics', 'Social media', 'Email marketing', 'Copywriting',
    'Accounting', 'Invoicing', 'Accounts payable', 'Accounts receivable', 'Bank reconciliation', 'Budgeting', 'Management control', 'Financial analysis', 'Auditing', 'SAP', 'Power BI', 'Data analysis',
    'Recruitment and selection', 'Competency-based interviewing', 'Onboarding', 'Training', 'Organizational development', 'Payroll management', 'Employment law', 'People analytics',
    'Patient care', 'Medical records', 'Vital signs monitoring', 'First aid', 'Medication administration', 'Biosafety', 'Clinical laboratory', 'Hospital management',
    'Lesson planning', 'Educational assessment', 'Instructional design', 'Classroom management', 'Inclusive education', 'Corporate training', 'Academic research',
    'Inventory management', 'Logistics', 'Supply chain', 'Procurement', 'Demand planning', 'Quality control', 'Lean Manufacturing', 'Six Sigma', 'Industrial safety', 'Preventive maintenance',
    'AutoCAD', 'Blueprint reading', 'Construction supervision', 'Construction budgeting', 'Risk prevention', 'Contractor management', 'Surveying', 'Electrical installations',
    'Hotel reception', 'Reservation management', 'Tourism', 'Food handling', 'Professional cooking', 'Barista skills', 'Table service', 'Event management', 'Cash register and POS',
    'Graphic design', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere Pro', 'Figma', 'UX/UI', 'Photography', 'Video editing', 'Writing', 'Translation',
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Go', 'Ruby', 'SQL', 'Vue.js', 'React', 'Angular', 'Next.js', 'Nuxt', 'Node.js', 'Laravel', '.NET', 'Spring Boot',
    'HTML5', 'CSS3', 'Tailwind CSS', 'Sass', 'REST APIs', 'GraphQL', 'Microservices', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Git',
  ],
}
const filteredSkillSuggestions = computed(() => {
  const query = newSkill.value.trim().toLowerCase()
  if (!query) return []

  const selectedSkills = new Set(cv.value.skills.map((skill) => skill.toLowerCase()))
  return marketSkills[localeStore.locale].filter((skill) => (
    skill.toLowerCase().includes(query) && !selectedSkills.has(skill.toLowerCase())
  )).slice(0, 8)
})

const countryTips = computed(() => activeCountryConfig.value?.advice?.[localeStore.locale] || [])
const countryTipsTitle = computed(() => ({
  es: 'Consejos para',
  en: 'Tips for',
  'pt-BR': 'Dicas para',
}[localeStore.locale] || 'Tips for'))
const migrationVisibilityCopy = computed(() => ({
  es: {
    label: 'Mostrar estatus migratorio en el CV',
    hint: 'Puedes conservar esta información para el formulario sin mostrarla en la versión final del CV.',
  },
  en: {
    label: 'Show immigration status in the CV',
    hint: 'You can keep this information in the form without showing it in the final CV.',
  },
  'pt-BR': {
    label: 'Mostrar status migratório no CV',
    hint: 'Você pode manter estas informações no formulário sem exibi-las na versão final do CV.',
  },
}[localeStore.locale] || {
  label: 'Show immigration status in the CV',
  hint: 'You can keep this information in the form without showing it in the final CV.',
}))

async function updateDestination(event) {
  await cvStore.setDestinationCountry(event.target.value)
}

async function requestAiReview() {
  aiReviewError.value = ''
  aiReview.value = null
  isRequestingAiReview.value = true
  isAiReviewDialogOpen.value = true
  try {
    aiReview.value = await cvStore.reviewCvWithAi({ locale: localeStore.locale })
  } catch (error) {
    aiReviewError.value = error.message || aiCopy.value.error
  } finally {
    isRequestingAiReview.value = false
  }
}

function applySuggestedProfessionalSummary() {
  if (!suggestedProfessionalSummary.value) return
  cvStore.updateProfileField('professionalSummary', suggestedProfessionalSummary.value)
  isAiReviewDialogOpen.value = false
}

async function loadIndustries() {
  if (industries.value.length || isLoadingIndustries.value || selectedLanguageId.value == null) return

  const { public: { apiBaseUrl } } = useRuntimeConfig()
  isLoadingIndustries.value = true
  try {
    const languageId = encodeURIComponent(selectedLanguageId.value)
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/v1/industries?language_id=${languageId}`, {
      headers: { Accept: 'application/json' },
    })
    if (!response?.success) throw new Error(response?.message || 'No fue posible obtener las industrias.')
    industries.value = response.data?.industries || []
  } catch (error) {
    cvDetailsError.value = error.data?.message || error.message || 'No fue posible obtener las industrias.'
  } finally {
    isLoadingIndustries.value = false
  }
}

async function openCvDetailsDialog() {
  const document = activeCvDocument.value
  if (!document) return

  cvDetailsError.value = ''
  cvDetailsForm.name = document.name
  cvDetailsForm.industryId = document.industryId
  isCvDetailsDialogOpen.value = true
  await loadIndustries()
}

async function saveCvDetails() {
  const industry = industries.value.find((item) => String(item.id) === String(cvDetailsForm.industryId))
  if (!cvDetailsForm.name.trim() || !industry) {
    cvDetailsError.value = 'Ingresa un nombre y selecciona un rubro.'
    return
  }

  cvDetailsError.value = ''
  try {
    await cvStore.updateCvMetadata({ name: cvDetailsForm.name, industry })
    isCvDetailsDialogOpen.value = false
  } catch (error) {
    cvDetailsError.value = error.message || 'No fue posible actualizar el CV.'
  }
}

function createEmptyEducation() {
  return {
    credential: '',
    localLevel: qualificationLevels.value[0]?.id ?? '',
    institution: '',
    startYear: String(currentYear),
    endYear: String(currentYear),
  }
}

function getEducationYears(period = '') {
  const years = period.match(/\d{4}/g) ?? []
  return {
    startYear: years[0] ?? String(currentYear),
    endYear: /present|actualidad/i.test(period) ? 'Actualidad' : years[1] ?? String(currentYear),
  }
}

function openEducationDialog(index = null) {
  educationError.value = ''
  editingEducationIndex.value = index
  const education = cv.value.educations[index]
  Object.assign(educationForm, index === null ? createEmptyEducation() : {
    ...education,
    startYear: education.startYear ?? getEducationYears(education.period).startYear,
    endYear: education.endYear ?? getEducationYears(education.period).endYear,
  })
  isEducationDialogOpen.value = true
}

function saveEducation() {
  if (!educationForm.credential.trim() || !educationForm.institution.trim() || !educationForm.startYear.trim() || !educationForm.endYear.trim()) {
    educationError.value = 'Completa todos los campos del estudio.'
    return
  }

  if (editingEducationIndex.value === null) cvStore.addEducation(educationForm)
  else cvStore.updateEducation(editingEducationIndex.value, educationForm)

  isEducationDialogOpen.value = false
}

function createEmptyExperience() {
  const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  return { role: '', company: '', startDate: currentMonth, endDate: currentMonth, summary: '' }
}

function getExperienceDates(experience) {
  if (experience.startDate && experience.endDate) return experience

  const monthNumbers = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', sept: '09', oct: '10', nov: '11', dec: '12',
  }
  const values = experience.period.match(/([a-z]+)\s+(\d{4})/gi) ?? []
  const dates = values.map((value) => {
    const [, month, year] = value.match(/([a-z]+)\s+(\d{4})/i) ?? []
    return month && year ? `${year}-${monthNumbers[month.toLowerCase()] ?? '01'}` : null
  })
  const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  return { startDate: dates[0] ?? currentMonth, endDate: dates[1] ?? currentMonth }
}

function formatExperiencePeriod(startDate, endDate, language = localeStore.locale) {
  if (!startDate || !endDate) return ''
  const formatter = new Intl.DateTimeFormat(dateLocales[language] || dateLocales.es, { month: 'short', year: 'numeric' })
  const formatDate = (date) => formatter.format(new Date(`${date}T12:00:00`)).replace('.', '')
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}

function openExperienceDialog(index = null) {
  experienceError.value = ''
  editingExperienceIndex.value = index
  if (index === null) Object.assign(experienceForm, createEmptyExperience())
  else Object.assign(experienceForm, cv.value.experience[index], getExperienceDates(cv.value.experience[index]))
  isExperienceDialogOpen.value = true
}

function saveExperience() {
  if (!experienceForm.role.trim() || !experienceForm.company.trim() || !experienceForm.startDate || !experienceForm.endDate || !experienceForm.summary.trim()) {
    experienceError.value = 'Completa todos los campos de la experiencia.'
    return
  }

  const experience = {
    role: experienceForm.role,
    company: experienceForm.company,
    startDate: experienceForm.startDate,
    endDate: experienceForm.endDate,
    period: formatExperiencePeriod(experienceForm.startDate, experienceForm.endDate),
    summary: experienceForm.summary,
  }

  if (editingExperienceIndex.value === null) cvStore.addExperience(experience)
  else cvStore.updateExperience(editingExperienceIndex.value, experience)

  isExperienceDialogOpen.value = false
}

function addSkill() {
  if (cvStore.addSkill(newSkill.value)) newSkill.value = ''
}

function selectSkill(skill) {
  if (cvStore.addSkill(skill)) newSkill.value = ''
}

function addListItem(list, value) {
  if (cvStore.addListItem(list, value)) {
    if (list === 'languages') newLanguage.value = ''
    else newInterest.value = ''
  }
}

function requestDeletion(type, index, label) {
  deletion.value = { type, index, label }
}

async function confirmDeletion() {
  if (!deletion.value) return

  const actions = {
    education: cvStore.deleteEducation,
    experience: cvStore.deleteExperience,
    skill: cvStore.deleteSkill,
    languages: (index) => cvStore.deleteListItem('languages', index),
    interests: (index) => cvStore.deleteListItem('interests', index),
    recommendation: cvStore.deleteEmploymentRecommendation,
  }
  try {
    await actions[deletion.value.type]?.(deletion.value.index)
    deletion.value = null
  } catch (error) {
    recommendationError.value = error.message || copy.value.editor.recommendationDeleteFailed
  }
}

async function uploadRecommendation(event) {
  const [file] = event.target.files || []
  event.target.value = ''
  recommendationError.value = ''
  if (!file) return
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    recommendationError.value = copy.value.editor.recommendationPdfOnly
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    recommendationError.value = copy.value.editor.recommendationMaxSize
    return
  }

  try {
    isUploadingRecommendation.value = true
    await cvStore.uploadEmploymentRecommendation(file)
  } catch (error) {
    recommendationError.value = error.message || copy.value.editor.recommendationFailed
  } finally {
    isUploadingRecommendation.value = false
  }
}

function deleteRecommendation(recommendation) {
  if (!recommendation.id) {
    recommendationError.value = copy.value.editor.recommendationDeleteFailed
    return
  }
  requestDeletion('recommendation', recommendation.id, recommendation.name)
}

function openRecommendation(recommendation) {
  if (recommendation.url) window.open(recommendation.url, '_blank', 'noopener')
}

function getPdfFileName() {
  const name = cv.value.profile.fullName.trim() || 'mi-cv'
  const safeName = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${safeName || 'mi-cv'}.pdf`
}

function openPdfLanguageDialog() {
  pdfLanguage.value = localeStore.locale
  isPdfLanguageDialogOpen.value = true
}

function openEmailDialog() {
  emailError.value = ''
  emailSuccess.value = ''
  emailForm.recipientEmails = [authStore.session?.email || cv.value.profile.email].filter(Boolean)
  emailForm.subject = copy.value.editor.emailSubjectDefault.replace('{name}', cv.value.profile.fullName || 'Candidato')
  emailForm.body = copy.value.editor.emailBody
  emailForm.language = localeStore.locale
  isEmailDialogOpen.value = true
}

async function downloadPdf(language = pdfLanguage.value, emailPayload = null) {
  if (isExportingPdf.value || isSendingEmail.value) return

  isPdfLanguageDialogOpen.value = false
  if (emailPayload) isSendingEmail.value = true
  else isExportingPdf.value = true
  exportError.value = ''
  try {
    const pdfCopy = language === 'en'
      ? { profile: 'Professional profile', experience: 'Experience', education: 'Education', localLevel: 'Local equivalent level', skills: 'Skills', recommendations: 'Employment recommendations', additional: 'Additional information', languages: 'Languages', interests: 'Interests' }
      : { profile: 'Perfil profesional', experience: 'Experiencia', education: 'Educacion', localLevel: 'Nivel local equivalente', skills: 'Skills', recommendations: 'Recomendaciones laborales', additional: 'Informacion adicional', languages: 'Idiomas', interests: 'Intereses' }
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
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
      const { size = 10, style = 'normal', color = [28, 25, 23], indent = 0, align = 'left', spacing = 5 } = options
      pdf.setFont('helvetica', style)
      pdf.setFontSize(size)
      pdf.setTextColor(...color)
      const lines = pdf.splitTextToSize(String(text), contentWidth - indent)
      addPageIfNeeded(lines.length * spacing)
      pdf.text(lines, align === 'center' ? pageWidth / 2 : margin + indent, cursorY, { align })
      cursorY += lines.length * spacing
    }
    const addSection = (title) => {
      cursorY += 5
      addPageIfNeeded(13)
      pdf.setDrawColor(214, 211, 209)
      pdf.line(margin, cursorY, pageWidth - margin, cursorY)
      cursorY += 7
      addText(title.toUpperCase(), { size: 10, style: 'bold', color: [87, 83, 78], spacing: 5 })
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
    pdf.text(cv.value.profile.fullName || 'Curriculum Vitae', pageWidth / 2, cursorY, { align: 'center' })
    cursorY += 9
    addText(cv.value.profile.role, { size: 14, style: 'bold', color: [68, 64, 60], align: 'center', spacing: 6 })
    addText([cv.value.profile.city, cv.value.profile.country, cv.value.profile.email, cv.value.profile.phone].filter(Boolean).join(' | '), { size: 9, color: [87, 83, 78], align: 'center', spacing: 4.5 })
    addText(cv.value.profile.linkedIn, { size: 9, style: 'bold', color: [4, 120, 87], align: 'center', spacing: 4.5 })
    if (cv.value.migration.includeMigration) {
      const status = immigrationStatuses.value.find((item) => String(item.id) === String(cv.value.migration.visaStatus))?.name || cv.value.migration.visaStatus
      addText([status, cv.value.migration.workAvailability].filter(Boolean).join(' | '), { size: 9, style: 'bold', color: [68, 64, 60], align: 'center', spacing: 4.5 })
    }
    cursorY += 4
    pdf.setDrawColor(6, 95, 70)
    pdf.setLineWidth(0.7)
    pdf.line(margin, cursorY, pageWidth - margin, cursorY)
    pdf.setLineWidth(0.2)

    if (cv.value.profile.professionalSummary) {
      addSection(pdfCopy.profile)
      addText(cv.value.profile.professionalSummary, { spacing: 5 })
    }
    if (cv.value.experience.length) {
      addSection(pdfCopy.experience)
      cv.value.experience.forEach((item) => {
        addText([item.role, item.company].filter(Boolean).join(' | '), { size: 11, style: 'bold', spacing: 5 })
        addText(formatExperiencePeriod(item.startDate, item.endDate, language) || item.period, { size: 9, style: 'bold', color: [87, 83, 78], spacing: 4.5 })
        addText(item.summary, { spacing: 5 })
        cursorY += 3
      })
    }
    if (cv.value.educations.length) {
      addSection(pdfCopy.education)
      cv.value.educations.forEach((education) => {
        addText(education.credential, { size: 11, style: 'bold', spacing: 5 })
        const localLevel = qualificationLevels.value.find((item) => String(item.id) === String(education.localLevel))?.name || education.localLevel
        addText([education.institution, `${education.startYear} - ${education.endYear}`].filter(Boolean).join(' | '), { size: 9, color: [87, 83, 78], spacing: 4.5 })
        addText(localLevel ? `${pdfCopy.localLevel}: ${localLevel}` : '', { size: 9, color: [87, 83, 78], spacing: 4.5 })
        cursorY += 3
      })
    }
    if (cv.value.skills.length) {
      addSection(pdfCopy.skills)
      addText(cv.value.skills.join(' | '), { spacing: 5 })
    }
    if (cv.value.employmentRecommendations?.length) {
      addSection(pdfCopy.recommendations)
      cv.value.employmentRecommendations.forEach((recommendation) => addLink(recommendation.name, recommendation.url))
    }
    if (cv.value.languages.length || cv.value.interests.length) {
      addSection(pdfCopy.additional)
      addText(cv.value.languages.length ? `${pdfCopy.languages}: ${cv.value.languages.join(' | ')}` : '', { spacing: 5 })
      addText(cv.value.interests.length ? `${pdfCopy.interests}: ${cv.value.interests.join(' | ')}` : '', { spacing: 5 })
    }
    if (emailPayload) {
      const pdfFile = new File([pdf.output('blob')], getPdfFileName(), { type: 'application/pdf' })
      await cvStore.sendCvByEmail({ ...emailPayload, pdf: pdfFile })
      emailSuccess.value = copy.value.editor.emailSent
      isEmailDialogOpen.value = false
    } else pdf.save(getPdfFileName())
  } catch (error) {
    if (emailPayload) emailError.value = error.message || copy.value.editor.emailFailed
    else exportError.value = 'No fue posible generar el PDF. Intentalo nuevamente.'
  } finally {
    isExportingPdf.value = false
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

function closeModalOnEscape(event) {
  if (event.key !== 'Escape') return
  isEducationDialogOpen.value = false
  isExperienceDialogOpen.value = false
  deletion.value = null
  isPdfLanguageDialogOpen.value = false
  isEmailDialogOpen.value = false
  isCvDetailsDialogOpen.value = false
  isAiReviewDialogOpen.value = false
  isReadinessScoreHelpOpen.value = false
}

onMounted(async () => {
  document.addEventListener('keydown', closeModalOnEscape)
  window.addEventListener('resize', updatePreviewScale)
  if (!cvDocuments.value.length) await cvStore.loadCvs()
  await cvStore.loadDestinationCountries()
  previewResizeObserver = new ResizeObserver(updatePreviewScale)
  previewResizeObserver.observe(document.documentElement)
  if (previewViewport.value) previewResizeObserver.observe(previewViewport.value)
  if (previewPaper.value) previewResizeObserver.observe(previewPaper.value)
  nextTick(() => {
    updatePreviewScale()
    requestAnimationFrame(() => requestAnimationFrame(updatePreviewScale))
  })
})

watch(lastSavedAt, (savedAt) => {
  if (!savedAt) return
  isSaveNoticeVisible.value = true
  window.clearTimeout(saveNoticeTimer)
  saveNoticeTimer = window.setTimeout(() => {
    isSaveNoticeVisible.value = false
  }, 1800)
})

watch(isAiReviewDialogOpen, (isOpen) => {
  if (isOpen) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return
  }
  document.body.style.overflow = previousBodyOverflow
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
  document.removeEventListener('keydown', closeModalOnEscape)
  window.removeEventListener('resize', updatePreviewScale)
  previewResizeObserver?.disconnect()
  window.clearTimeout(previewUpdateTimer)
  window.clearTimeout(saveNoticeTimer)
})
</script>

<template>
  <main class="min-h-screen bg-[#f7f3eb] text-stone-950">
    <WorkspaceNav />
    <div class="px-4 py-6 sm:px-6 lg:px-8">
    <section class="mx-auto max-w-7xl">
      <nav class="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="min-w-0">
          <RouterLink to="/profile" class="text-sm font-bold text-emerald-800 hover:text-emerald-950">adaptacv</RouterLink>
          <h1 class="mt-2 text-4xl font-black tracking-normal sm:text-5xl">{{ copy.editor.title }}</h1>
          <div v-if="activeCvDocument" class="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-stone-600">
            <span>{{ activeCvDocument.name }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ activeCvDocument.sector || 'Rubro sin definir' }}</span>
            <template v-if="activeCvDocument.aiReviewScore !== null && activeCvDocument.aiReviewScore !== undefined">
              <span class="inline-flex items-center gap-1 rounded-md bg-violet-100 px-2 py-1 text-xs font-black text-violet-900"><Sparkles :size="14" aria-hidden="true" />{{ activeCvDocument.aiReviewScore }}/100</span>
              <button class="grid h-7 w-7 place-items-center rounded-md text-violet-900 transition hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-800" type="button" :aria-label="aiCopy.scoreHelpAction" :title="aiCopy.scoreHelpAction" @click="isReadinessScoreHelpOpen = true"><CircleHelp :size="16" aria-hidden="true" /></button>
            </template>
            <button class="grid h-8 w-8 place-items-center rounded-md text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" aria-label="Editar nombre y rubro del CV" title="Editar nombre y rubro" @click="openCvDetailsDialog"><Pencil :size="16" /></button>
          </div>
        </div>
        <div class="min-w-0"><div class="mb-2 min-h-5 text-sm font-semibold lg:text-right"><p v-if="isSaving" class="text-stone-500">{{ copy.editor.saving }}</p><p v-else-if="saveError" class="text-red-700" role="alert">{{ saveError }}</p><p v-else-if="exportError || emailSuccess" :class="exportError ? 'text-red-700' : 'text-emerald-800'" role="alert">{{ exportError || emailSuccess }}</p></div><div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end"><button class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-violet-300 px-3 py-2 text-sm font-extrabold text-violet-900 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-70 sm:px-4" type="button" :disabled="isRequestingAiReview || !activeCvDocument" @click="requestAiReview"><Sparkles :size="17" aria-hidden="true" />{{ isRequestingAiReview ? aiCopy.loading : aiCopy.action }}</button><button class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-emerald-800 px-3 py-2 text-sm font-extrabold text-emerald-900 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70 sm:px-4" type="button" :disabled="isSendingEmail" @click="openEmailDialog"><Mail :size="17" aria-hidden="true" />{{ isSendingEmail ? copy.editor.sendingEmail : copy.editor.sendEmail }}</button><button class="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-900 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900 sm:px-4" type="button" :disabled="isExportingPdf" @click="openPdfLanguageDialog"><Download :size="17" aria-hidden="true" />{{ isExportingPdf ? copy.editor.generatingPdf : copy.editor.downloadPdf }}</button><RouterLink to="/portfolios" class="col-span-2 inline-flex min-h-11 items-center justify-center rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-800 shadow-sm hover:border-emerald-800">{{ copy.editor.portfolios }}</RouterLink></div></div>
      </nav>

      <div ref="editorModeSwitcher" class="sticky top-16 z-30 -mx-4 mb-5 border-y border-stone-200 bg-[#f7f3eb]/95 px-4 py-3 backdrop-blur xl:hidden">
        <div class="grid grid-cols-2 rounded-md bg-stone-200 p-1" role="tablist" :aria-label="copy.editor.mobileViewLabel">
          <button class="inline-flex min-h-11 items-center justify-center gap-2 rounded px-3 text-sm font-extrabold transition" :class="editorMode === 'edit' ? 'bg-white text-emerald-950 shadow-sm' : 'text-stone-600'" type="button" role="tab" :aria-selected="editorMode === 'edit'" @click="setEditorMode('edit')"><Pencil :size="17" />{{ copy.editor.editMode }}</button>
          <button class="inline-flex min-h-11 items-center justify-center gap-2 rounded px-3 text-sm font-extrabold transition" :class="editorMode === 'preview' ? 'bg-white text-emerald-950 shadow-sm' : 'text-stone-600'" type="button" role="tab" :aria-selected="editorMode === 'preview'" @click="setEditorMode('preview')"><Eye :size="18" />{{ copy.editor.previewMode }}</button>
        </div>
      </div>
      <div class="grid gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
        <section class="min-w-0 rounded-lg border border-stone-300 bg-white p-5 shadow-sm" :class="editorMode === 'preview' ? 'hidden xl:block' : ''">
          <div class="border-b border-stone-200 pb-5">
            <FieldGroup :label="copy.editor.destinationCountry">
              <select :value="selectedCountryId" :disabled="isLoadingDestinationCountries" class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15 disabled:cursor-not-allowed disabled:opacity-60" @change="updateDestination">
                <option v-if="isLoadingDestinationCountries" value="">{{ copy.editor.loadingCountries }}</option>
                <option v-for="country in destinationCountries" :key="country.id" :value="country.id">{{ country.name }}</option>
              </select>
            </FieldGroup>
            <div v-if="destinationCountriesError" class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-800">{{ destinationCountriesError }}</div>
            <div v-if="legalWarning" class="mt-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-950">{{ legalWarning }}</div>
            <div v-if="countryTips.length" class="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/80 p-4">
              <p class="text-sm font-black text-emerald-900">{{ countryTipsTitle }} {{ activeCountryConfig.name }}</p>
              <ul class="mt-3 space-y-2 text-sm leading-6 text-emerald-950">
                <li v-for="tip in countryTips" :key="tip" class="flex gap-2"><span class="mt-1 text-base leading-none text-emerald-700">•</span><span>{{ tip }}</span></li>
              </ul>
            </div>
          </div>
          <form novalidate class="mt-5">
            <details class="group border-b border-stone-200 py-5 first:pt-0">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                <div>
                <h2 class="text-lg font-black">{{ copy.editor.professionalProfile }}</h2>
                <p class="text-sm text-stone-500">{{ copy.editor.professionalProfileText }}</p>
                </div>
                <ChevronDown :size="20" class="shrink-0 text-emerald-800 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div class="mt-5 space-y-4">

              <div class="rounded-lg border border-stone-200 bg-stone-50/70 p-4">
                <label class="flex items-start justify-between gap-3">
                  <div>
                    <span class="block text-sm font-bold text-stone-800">{{ copy.editor.includePhoto }}</span>
                    <span class="mt-1 block text-xs text-stone-500">{{ activeCountryConfig.atsRules.allowPhoto ? copy.editor.photoOptionalHint : copy.editor.photoOptionalWarning }}</span>
                  </div>
                  <input
                    :checked="cv.profile.includePhoto"
                    type="checkbox"
                    class="mt-1 h-4 w-4 accent-emerald-800"
                    @change="cvStore.updateProfileField('includePhoto', $event.target.checked)"
                  />
                </label>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <FieldGroup :label="copy.editor.fullName">
                  <input
                    :value="cv.profile.fullName"
                    class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"
                    @input="cvStore.updateProfileField('fullName', $event.target.value)"
                  />
                </FieldGroup>
                <FieldGroup :label="copy.editor.targetRole">
                  <input
                    :value="cv.profile.role"
                    class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"
                    @input="cvStore.updateProfileField('role', $event.target.value)"
                  />
                </FieldGroup>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <FieldGroup :label="copy.editor.email">
                  <input
                    :value="cv.profile.email"
                    type="email"
                    readonly
                    aria-readonly="true"
                    class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"
                  />
                </FieldGroup>
                <FieldGroup :label="copy.editor.phone">
                  <input
                    :value="cv.profile.phone"
                    class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"
                    @input="cvStore.updateProfileField('phone', $event.target.value)"
                  />
                </FieldGroup>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <FieldGroup :label="copy.editor.city">
                  <input
                    :value="cv.profile.city"
                    class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"
                    @input="cvStore.updateProfileField('city', $event.target.value)"
                  />
                </FieldGroup>
                <FieldGroup :label="copy.editor.country">
                  <input :value="cv.profile.country" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" @input="cvStore.updateProfileField('country', $event.target.value)" />
                </FieldGroup>                
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <FieldGroup label="LinkedIn">
                  <input :value="cv.profile.linkedIn" type="url" inputmode="url" placeholder="https://www.linkedin.com/in/..." class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" @input="cvStore.updateProfileField('linkedIn', $event.target.value)" />
                </FieldGroup>
                <FieldGroup :label="copy.editor.availability">
                  <input :value="cv.profile.availability" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" @input="cvStore.updateProfileField('availability', $event.target.value)" />
                </FieldGroup>
              </div>

              <FieldGroup :label="copy.editor.professionalSummary">
                <textarea
                  :value="cv.profile.professionalSummary"
                  rows="4"
                  class="mt-2 w-full resize-none rounded-md border border-stone-300 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"
                  @input="cvStore.updateProfileField('professionalSummary', $event.target.value)"
                />
              </FieldGroup>
              </div>
            </details>

            <details class="group border-b border-stone-200 py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                <div>
                <h2 class="text-lg font-black">{{ copy.editor.migration }}</h2>
                <p class="text-sm text-stone-500">{{ copy.editor.migrationOptions.replace('{country}', activeCountryConfig.name) }}</p>
                </div>
                <ChevronDown :size="20" class="shrink-0 text-emerald-800 transition group-open:rotate-180" aria-hidden="true" />
              </summary>

              <div class="mt-5 space-y-4">
              <div class="rounded-lg border border-stone-200 bg-stone-50/70 p-4">
                <label class="flex items-start justify-between gap-3">
                  <div>
                    <span class="block text-sm font-bold text-stone-800">{{ migrationVisibilityCopy.label }}</span>
                    <span class="mt-1 block text-xs text-stone-500">{{ migrationVisibilityCopy.hint }}</span>
                  </div>
                  <input
                    :checked="cv.migration.includeMigration"
                    type="checkbox"
                    class="mt-1 h-4 w-4 accent-emerald-800"
                    @change="cvStore.updateMigrationField('includeMigration', $event.target.checked)"
                  />
                </label>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <FieldGroup :label="copy.editor.currentStatus">
                  <select
                    :value="cv.migration.visaStatus"
                    :disabled="isLoadingImmigrationStatuses"
                    class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15 disabled:cursor-not-allowed disabled:opacity-60"
                    @change="cvStore.updateMigrationField('visaStatus', $event.target.value)"
                  >
                    <option v-if="isLoadingImmigrationStatuses" value="">{{ copy.editor.loadingStatuses }}</option>
                    <option v-for="status in immigrationStatuses" :key="status.id" :value="status.id">
                      {{ status.code }} - {{ status.name }}{{ status.description ? `: ${status.description}` : '' }}
                    </option>
                  </select>
                </FieldGroup>
                <FieldGroup :label="copy.editor.workAvailability">
                  <input
                    :value="cv.migration.workAvailability"
                    class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"
                    @input="cvStore.updateMigrationField('workAvailability', $event.target.value)"
                  />
                </FieldGroup>
              </div>
              <div v-if="immigrationStatusesError" class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-800">{{ immigrationStatusesError }}</div>
              </div>
            </details>

            <details class="group border-b border-stone-200 py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                <div>
                <h2 class="text-lg font-black">{{ copy.editor.education }}</h2>
                <p class="text-sm text-stone-500">{{ copy.editor.educationText }}</p>
                </div>
                <ChevronDown :size="20" class="shrink-0 text-emerald-800 transition group-open:rotate-180" aria-hidden="true" />
              </summary>

              <div class="mt-5 space-y-4">
                <button class="flex min-h-28 w-full flex-col items-center justify-center border border-dashed border-stone-400 p-4 text-center transition hover:border-emerald-700 hover:bg-emerald-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" @click="openEducationDialog()"><span class="grid h-9 w-9 place-items-center rounded-md bg-white text-emerald-800 shadow-sm"><Plus :size="19" aria-hidden="true" /></span><span class="mt-2 text-sm font-extrabold text-stone-800">{{ copy.editor.addEducation }}</span></button>
                <article v-for="(education, index) in cv.educations" :key="`${education.credential}-${education.institution}-${index}`" class="border border-stone-200 bg-stone-50/70 p-4">
                  <div class="flex items-start gap-3">
                    <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-100 text-emerald-800"><GraduationCap :size="20" aria-hidden="true" /></span>
                    <div class="min-w-0 flex-1"><h3 class="break-words font-extrabold text-stone-950">{{ education.credential }}</h3><p class="mt-1 text-sm font-semibold text-stone-600">{{ education.institution }}</p><p class="mt-1 text-sm text-stone-500">{{ education.startYear }} - {{ education.endYear }}</p><p class="mt-2 text-xs font-bold text-emerald-800">{{ qualificationLevels.find((level) => level.id === education.localLevel)?.name }}</p></div>
                    <div class="flex shrink-0 gap-1"><button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-white hover:text-emerald-800" type="button" aria-label="Editar estudio" title="Editar estudio" @click="openEducationDialog(index)"><Pencil :size="16" /></button><button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-red-50 hover:text-red-700" type="button" aria-label="Eliminar estudio" title="Eliminar estudio" @click="requestDeletion('education', index, education.credential)"><Trash2 :size="16" /></button></div>
                  </div>
                </article>
              </div>
            </details>

            <details class="group border-b border-stone-200 py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                <h2 class="text-lg font-black">{{ copy.editor.experience }}</h2>
                <ChevronDown :size="20" class="shrink-0 text-emerald-800 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div class="mt-5 space-y-4">
              <button class="flex min-h-28 w-full flex-col items-center justify-center border border-dashed border-stone-400 p-4 text-center transition hover:border-emerald-700 hover:bg-emerald-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" @click="openExperienceDialog()"><span class="grid h-9 w-9 place-items-center rounded-md bg-white text-emerald-800 shadow-sm"><Plus :size="19" aria-hidden="true" /></span><span class="mt-2 text-sm font-extrabold text-stone-800">{{ copy.editor.addExperience }}</span></button>
              <article v-for="(item, index) in cv.experience" :key="`${item.company}-${item.role}-${index}`" class="border border-stone-200 bg-stone-50/70 p-4">
                <div class="flex items-start gap-3">
                  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-amber-100 text-amber-900"><BriefcaseBusiness :size="20" aria-hidden="true" /></span>
                  <div class="min-w-0 flex-1"><h3 class="break-words font-extrabold text-stone-950">{{ item.role }}</h3><p class="mt-1 text-sm font-semibold text-stone-600">{{ item.company }}</p><p class="mt-1 text-sm text-stone-500">{{ formatExperiencePeriod(item.startDate, item.endDate) || item.period }}</p><p class="mt-3 whitespace-pre-line text-sm leading-6 text-stone-600">{{ item.summary }}</p></div>
                  <div class="flex shrink-0 gap-1"><button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-white hover:text-emerald-800" type="button" aria-label="Editar experiencia" title="Editar experiencia" @click="openExperienceDialog(index)"><Pencil :size="16" /></button><button class="grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-red-50 hover:text-red-700" type="button" aria-label="Eliminar experiencia" title="Eliminar experiencia" @click="requestDeletion('experience', index, item.role)"><Trash2 :size="16" /></button></div>
                </div>
              </article>

              </div>
            </details>

            <details class="group border-b border-stone-200 py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                <div><h2 class="text-lg font-black">Skills</h2><p class="text-sm text-stone-500">{{ copy.editor.skillsText }}</p></div>
                <ChevronDown :size="20" class="shrink-0 text-emerald-800 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div class="mt-5">
                <div class="rounded-md border border-stone-300 bg-white p-2 transition focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-900/15">
                  <div class="flex flex-wrap items-center gap-2">
                    <span v-for="(skill, index) in cv.skills" :key="skill" class="inline-flex max-w-full items-center gap-1 rounded-md bg-emerald-50 py-1 pl-2 pr-1 text-sm font-bold text-emerald-900">
                      <span class="truncate">{{ skill }}</span>
                      <button class="grid h-6 w-6 shrink-0 place-items-center rounded text-emerald-800 transition hover:bg-emerald-100 hover:text-emerald-950" type="button" :aria-label="`Eliminar ${skill}`" :title="`Eliminar ${skill}`" @click="requestDeletion('skill', index, skill)"><X :size="14" /></button>
                    </span>
                    <div class="relative min-w-36 flex-1">
                      <input v-model="newSkill" class="w-full border-0 px-2 py-1.5 text-sm outline-none placeholder:text-stone-400" :placeholder="copy.editor.skillPlaceholder" :aria-label="copy.editor.skillPlaceholder" autocomplete="off" @keydown.enter.prevent="addSkill" />
                      <div v-if="filteredSkillSuggestions.length" class="absolute left-0 top-full z-10 mt-2 w-full min-w-56 overflow-hidden rounded-md border border-stone-200 bg-white py-1 shadow-lg">
                        <button v-for="skill in filteredSkillSuggestions" :key="skill" class="flex w-full items-center px-3 py-2 text-left text-sm font-semibold text-stone-700 transition hover:bg-emerald-50 hover:text-emerald-900" type="button" @click="selectSkill(skill)">{{ skill }}</button>
                      </div>
                    </div>
                    <button class="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-900 text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900" type="button" aria-label="Agregar skill" title="Agregar skill" @click="addSkill"><Plus :size="18" /></button>
                </div>
                </div>
              </div>
            </details>

            <details class="group border-b border-stone-200 py-5">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                <div><h2 class="text-lg font-black">{{ copy.editor.recommendations }}</h2><p class="text-sm text-stone-500">{{ copy.editor.recommendationsText }}</p></div>
                <ChevronDown :size="20" class="shrink-0 text-emerald-800 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div class="mt-5 space-y-3">
                <label class="flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-stone-400 p-4 text-center transition hover:border-emerald-700 hover:bg-emerald-50/50" :class="isUploadingRecommendation ? 'cursor-wait opacity-60' : ''"><FileUp :size="22" class="text-emerald-800" aria-hidden="true" /><span class="mt-2 text-sm font-extrabold text-stone-800">{{ isUploadingRecommendation ? copy.editor.uploadingRecommendation : copy.editor.addRecommendation }}</span><span class="mt-1 text-xs font-semibold text-stone-500">{{ copy.editor.recommendationRequirements }}</span><input type="file" accept="application/pdf,.pdf" class="sr-only" :disabled="isUploadingRecommendation" @change="uploadRecommendation" /></label>
                <p v-if="recommendationError" class="text-sm font-semibold text-red-700" role="alert">{{ recommendationError }}</p>
                <div v-for="(recommendation, index) in cv.employmentRecommendations" :key="`${recommendation.id || recommendation.name}-${index}`" class="flex items-center gap-3 border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-bold text-stone-800"><button class="flex min-w-0 flex-1 items-center gap-3 text-left hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60" type="button" :disabled="!recommendation.url" :title="copy.editor.openRecommendation" @click="openRecommendation(recommendation)"><FileUp :size="18" class="shrink-0 text-emerald-800" aria-hidden="true" /><span class="truncate">{{ recommendation.name }}</span></button><button class="grid h-9 w-9 shrink-0 place-items-center rounded-md text-stone-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60" type="button" :disabled="isSaving" :aria-label="copy.editor.deleteRecommendation" :title="copy.editor.deleteRecommendation" @click="deleteRecommendation(recommendation)"><Trash2 :size="16" /></button></div>
              </div>
            </details>

            <details class="group py-5 pb-0">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800">
                <div><h2 class="text-lg font-black">{{ copy.editor.languagesAndInterests }}</h2></div>
                <ChevronDown :size="20" class="shrink-0 text-emerald-800 transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div class="mt-5 space-y-6">
                <section>
                  <div class="flex items-center justify-between gap-3"><h3 class="text-sm font-black text-stone-900">{{ copy.editor.languages }}</h3></div>
                  <div class="mt-3 space-y-2">
                    <div v-for="(language, index) in cv.languages" :key="`${language}-${index}`" class="flex gap-2">
                      <input :value="language" class="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" @input="cvStore.updateListItem('languages', index, $event.target.value)" />
                      <button class="grid h-11 w-11 shrink-0 place-items-center rounded-md text-stone-500 transition hover:bg-red-50 hover:text-red-700" type="button" :aria-label="`Eliminar ${language}`" title="Eliminar idioma" @click="requestDeletion('languages', index, language)"><Trash2 :size="16" /></button>
                    </div>
                    <div class="flex gap-2">
                      <input v-model="newLanguage" class="min-w-0 flex-1 rounded-md border border-dashed border-stone-400 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.languagePlaceholder" :aria-label="copy.editor.languages" @keydown.enter.prevent="addListItem('languages', newLanguage)" />
                      <button class="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-emerald-900 text-white transition hover:bg-emerald-800" type="button" aria-label="Agregar idioma" title="Agregar idioma" @click="addListItem('languages', newLanguage)"><Plus :size="18" /></button>
                    </div>
                  </div>
                </section>
                <section class="border-t border-stone-200 pt-6">
                  <h3 class="text-sm font-black text-stone-900">{{ copy.editor.interests }}</h3>
                  <div class="mt-3 space-y-2">
                    <div v-for="(interest, index) in cv.interests" :key="`${interest}-${index}`" class="flex gap-2">
                      <input :value="interest" class="min-w-0 flex-1 rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" @input="cvStore.updateListItem('interests', index, $event.target.value)" />
                      <button class="grid h-11 w-11 shrink-0 place-items-center rounded-md text-stone-500 transition hover:bg-red-50 hover:text-red-700" type="button" :aria-label="`Eliminar ${interest}`" title="Eliminar interés" @click="requestDeletion('interests', index, interest)"><Trash2 :size="16" /></button>
                    </div>
                    <div class="flex gap-2">
                      <input v-model="newInterest" class="min-w-0 flex-1 rounded-md border border-dashed border-stone-400 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.interestPlaceholder" :aria-label="copy.editor.interests" @keydown.enter.prevent="addListItem('interests', newInterest)" />
                      <button class="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-emerald-900 text-white transition hover:bg-emerald-800" type="button" aria-label="Agregar interés" title="Agregar interés" @click="addListItem('interests', newInterest)"><Plus :size="18" /></button>
                    </div>
                  </div>
                </section>
              </div>
            </details>

          </form>
        </section>

        <aside class="min-w-0 xl:sticky xl:top-6 xl:self-start" :class="editorMode === 'edit' ? 'hidden xl:block' : ''">
          <div class="mb-3 flex items-center justify-between gap-3 xl:hidden"><div><p class="text-sm font-black text-stone-900">{{ copy.editor.previewMode }}</p><p class="text-xs font-semibold text-stone-500">{{ copy.editor.previewHint }}</p></div><span class="shrink-0 rounded bg-stone-200 px-2 py-1 text-xs font-black text-stone-600">{{ Math.round(previewScale * 100) }}%</span></div>
          <div ref="previewViewport" class="w-full overflow-clip" :style="{ height: `${previewHeight}px` }">
            <div ref="previewPaper" class="w-[794px] origin-top-left" :style="{ transform: `scale(${previewScale})` }">
              <CvPreview :cv="cv" :country-config="activeCountryConfig" :show-photo="shouldShowPhoto" :profile-photo-url="profilePhotoUrl" :qualification-levels="qualificationLevels" :immigration-statuses="immigrationStatuses" paper-mode />
            </div>
          </div>
        </aside>
      </div>
    </section>
    </div>

    <Transition name="save-notice">
      <aside v-if="isSaveNoticeVisible" class="fixed bottom-5 right-5 z-[90] w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-2xl shadow-emerald-950/20" role="status" aria-live="polite">
        <div class="h-1 bg-emerald-600"></div>
        <div class="flex items-center gap-3 p-4">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800"><CheckCircle2 :size="24" aria-hidden="true" /></span>
          <div class="min-w-0"><p class="font-black text-stone-950">Cambios guardados</p><p class="mt-0.5 truncate text-sm font-medium text-stone-600">{{ activeCvDocument?.name || 'Tu CV' }} se actualizó correctamente.</p></div>
        </div>
      </aside>
    </Transition>

    <div v-if="isAiReviewDialogOpen" class="fixed inset-0 z-[70] flex items-start justify-center overflow-hidden bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="ai-review-dialog-title" @click.self="isAiReviewDialogOpen = false">
      <section class="my-auto max-h-full w-full max-w-5xl overflow-y-auto overscroll-contain rounded-lg bg-white p-6 shadow-2xl sm:p-8">
        <div class="flex items-start justify-between gap-4"><div class="flex items-center gap-3"><span class="grid h-11 w-11 place-items-center rounded-md bg-violet-100 text-violet-800"><Sparkles :size="21" aria-hidden="true" /></span><div><h2 id="ai-review-dialog-title" class="text-xl font-black text-stone-950">{{ aiCopy.title }}</h2><p class="mt-1 text-sm leading-6 text-stone-600">{{ aiCopy.description }}</p></div></div><button class="grid h-9 w-9 shrink-0 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900" type="button" :aria-label="aiCopy.close" :title="aiCopy.close" @click="isAiReviewDialogOpen = false"><X :size="20" /></button></div>
        <div v-if="isRequestingAiReview" class="flex items-center gap-3 py-12 text-sm font-bold text-violet-900"><Sparkles :size="20" class="animate-pulse" />{{ aiCopy.loading }}</div>
        <p v-else-if="aiReviewError" class="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-800" role="alert">{{ aiReviewError }}</p>
        <div v-else-if="aiReview" class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(21rem,0.75fr)]">
          <div class="space-y-6">
            <div v-if="aiReview.score !== undefined" class="flex flex-wrap items-end justify-between gap-3 border-b border-stone-200 pb-5"><div class="flex items-end gap-3"><strong class="text-4xl font-black text-violet-900">{{ aiReview.score }}</strong><span class="pb-1 text-sm font-bold text-stone-600">/ 100 {{ aiCopy.score }}</span></div><span v-if="aiReview.detectedLanguage" class="rounded-md bg-stone-100 px-2 py-1 text-xs font-bold text-stone-700">{{ aiCopy.detectedLanguage }}: {{ aiReview.detectedLanguage }}</span></div>
            <section v-if="aiReviewStrengths.length"><h3 class="text-sm font-black uppercase tracking-[0.12em] text-stone-500">{{ aiCopy.strengths }}</h3><ul class="mt-3 space-y-2"><li v-for="strength in aiReviewStrengths" :key="strength" class="flex gap-2 text-sm leading-6 text-stone-700"><CheckCircle2 :size="17" class="mt-1 shrink-0 text-emerald-700" />{{ strength }}</li></ul></section>
            <section><h3 class="text-sm font-black uppercase tracking-[0.12em] text-stone-500">{{ aiCopy.issues }}</h3><div v-if="aiReviewIssues.length" class="mt-3 space-y-3"><article v-for="(issue, index) in aiReviewIssues" :key="`${issue.field || issue.title || 'issue'}-${index}`" class="border border-stone-200 bg-stone-50 p-4"><p class="font-extrabold text-stone-900">{{ issue.title || issue.message || issue }}</p><p v-if="issue.suggestion" class="mt-2 text-sm leading-6 text-stone-600">{{ issue.suggestion }}</p></article></div><p v-else class="mt-3 text-sm leading-6 text-stone-600">{{ aiCopy.noIssues }}</p></section>
          </div>
          <aside class="h-fit border border-violet-200 bg-violet-50 p-5"><h3 class="text-sm font-black text-violet-950">{{ aiCopy.summarySuggestion }}</h3><p v-if="suggestedProfessionalSummary" class="mt-3 whitespace-pre-line text-sm leading-6 text-violet-950">{{ suggestedProfessionalSummary }}</p><p v-else class="mt-3 text-sm leading-6 text-violet-950">{{ aiCopy.noSummarySuggestion }}</p><button v-if="suggestedProfessionalSummary" class="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-violet-800 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-violet-700" type="button" @click="applySuggestedProfessionalSummary"><CheckCircle2 :size="17" />{{ aiCopy.applySummary }}</button></aside>
        </div>
      </section>
    </div>

    <div v-if="isReadinessScoreHelpOpen" class="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="readiness-score-help-title" @click.self="isReadinessScoreHelpOpen = false">
      <section class="relative my-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl sm:p-8">
        <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-800" type="button" :aria-label="aiCopy.close" :title="aiCopy.close" @click="isReadinessScoreHelpOpen = false"><X :size="20" /></button>
        <span class="grid h-11 w-11 place-items-center rounded-md bg-violet-100 text-violet-800"><CircleHelp :size="21" aria-hidden="true" /></span>
        <h2 id="readiness-score-help-title" class="mt-5 pr-8 text-2xl font-black tracking-normal text-stone-950">{{ aiCopy.scoreHelpTitle }}</h2>
        <div class="mt-5 space-y-4 text-sm leading-6 text-stone-700">
          <p>{{ aiCopy.scoreHelpIntro }}</p>
          <p class="rounded-md border border-violet-200 bg-violet-50 px-4 py-3 font-bold text-violet-950">{{ aiCopy.scoreHelpNotGoal }}</p>
          <p>{{ aiCopy.scoreHelpImprove }}</p>
          <p>{{ aiCopy.scoreHelpVariation }}</p>
        </div>
        <div class="mt-6 flex justify-end"><button class="rounded-md bg-violet-800 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-800" type="button" @click="isReadinessScoreHelpOpen = false">{{ aiCopy.close }}</button></div>
      </section>
    </div>

    <div v-if="isCvDetailsDialogOpen" class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="cv-details-dialog-title" @click.self="isCvDetailsDialogOpen = false">
      <form novalidate class="relative my-auto w-full max-w-md bg-white p-6 shadow-2xl sm:p-8" @submit.prevent="saveCvDetails">
        <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" aria-label="Cerrar" title="Cerrar" @click="isCvDetailsDialogOpen = false"><X :size="20" /></button>
        <span class="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-emerald-800"><Pencil :size="21" aria-hidden="true" /></span>
        <h2 id="cv-details-dialog-title" class="mt-5 text-2xl font-black tracking-normal">Editar CV</h2>
        <div class="mt-6 space-y-4">
          <FieldGroup label="Nombre del CV"><input v-model="cvDetailsForm.name" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></FieldGroup>
          <FieldGroup label="Rubro"><select v-model="cvDetailsForm.industryId" :disabled="isLoadingIndustries" class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15 disabled:cursor-not-allowed disabled:opacity-60"><option value="" disabled>{{ isLoadingIndustries ? 'Cargando rubros...' : 'Selecciona un rubro' }}</option><option v-for="industry in industries" :key="industry.id" :value="industry.id">{{ industry.code }} - {{ industry.name }}</option></select></FieldGroup>
        </div>
        <p v-if="cvDetailsError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ cvDetailsError }}</p>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700 transition hover:bg-stone-50" type="button" :disabled="isSaving" @click="isCvDetailsDialogOpen = false">{{ copy.editor.cancel }}</button><button class="rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="isSaving || isLoadingIndustries">{{ isSaving ? copy.editor.saving : 'Guardar cambios' }}</button></div>
      </form>
    </div>

    <div v-if="isEducationDialogOpen" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="education-dialog-title" @click.self="isEducationDialogOpen = false">
      <form novalidate class="relative my-auto w-full max-w-xl bg-white p-6 shadow-2xl sm:p-8" @submit.prevent="saveEducation">
        <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" aria-label="Cerrar" title="Cerrar" @click="isEducationDialogOpen = false"><X :size="20" /></button>
        <span class="grid h-11 w-11 place-items-center rounded-md bg-emerald-50 text-emerald-800"><GraduationCap :size="21" aria-hidden="true" /></span>
        <h2 id="education-dialog-title" class="mt-5 text-2xl font-black tracking-normal">{{ editingEducationIndex === null ? 'Agregar estudio' : 'Editar estudio' }}</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <FieldGroup :label="copy.editor.originalCredential"><input v-model="educationForm.credential" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.credentialPlaceholder" /></FieldGroup>
          <FieldGroup :label="copy.editor.localLevel"><select v-model="educationForm.localLevel" :disabled="isLoadingQualificationLevels" class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15 disabled:cursor-not-allowed disabled:opacity-60"><option v-if="isLoadingQualificationLevels" value="">{{ copy.editor.loadingLevels }}</option><option v-for="level in qualificationLevels" :key="level.id" :value="level.id">{{ level.code }} - {{ level.name }}{{ level.description ? `: ${level.description}` : '' }}</option></select></FieldGroup>
          <FieldGroup :label="copy.editor.from"><input v-model="educationForm.startYear" list="education-start-year-options" inputmode="numeric" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.yearPlaceholder" /></FieldGroup>
          <FieldGroup :label="copy.editor.until"><input v-model="educationForm.endYear" list="education-end-year-options" inputmode="numeric" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.endYearPlaceholder" /></FieldGroup>
          <FieldGroup :label="copy.editor.institution" class="sm:col-span-2"><input v-model="educationForm.institution" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.institutionPlaceholder" /></FieldGroup>
        </div>
        <p v-if="qualificationLevelsError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ qualificationLevelsError }}</p>
        <p v-if="educationError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ educationError }}</p>
        <datalist id="education-start-year-options"><option v-for="year in yearOptions" :key="year" :value="year" /></datalist>
        <datalist id="education-end-year-options"><option value="Actualidad" /><option v-for="year in yearOptions" :key="year" :value="year" /></datalist>
        <button class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900" type="submit">{{ editingEducationIndex === null ? 'Agregar estudio' : 'Guardar cambios' }}</button>
      </form>
    </div>

    <div v-if="isExperienceDialogOpen" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="experience-dialog-title" @click.self="isExperienceDialogOpen = false">
      <form novalidate class="relative my-auto w-full max-w-xl bg-white p-6 shadow-2xl sm:p-8" @submit.prevent="saveExperience">
        <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" aria-label="Cerrar" title="Cerrar" @click="isExperienceDialogOpen = false"><X :size="20" /></button>
        <span class="grid h-11 w-11 place-items-center rounded-md bg-amber-100 text-amber-900"><BriefcaseBusiness :size="21" aria-hidden="true" /></span>
        <h2 id="experience-dialog-title" class="mt-5 text-2xl font-black tracking-normal">{{ editingExperienceIndex === null ? 'Agregar experiencia' : 'Editar experiencia' }}</h2>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <FieldGroup :label="copy.editor.role"><input v-model="experienceForm.role" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.rolePlaceholder" /></FieldGroup>
          <FieldGroup :label="copy.editor.company"><input v-model="experienceForm.company" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.companyPlaceholder" /></FieldGroup>
          <FieldGroup :label="copy.editor.from"><input v-model="experienceForm.startDate" type="month" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></FieldGroup>
          <FieldGroup :label="copy.editor.until"><input v-model="experienceForm.endDate" type="month" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></FieldGroup>
          <FieldGroup :label="copy.editor.impactSummary" class="sm:col-span-2"><textarea v-model="experienceForm.summary" rows="4" class="mt-2 w-full resize-none rounded-md border border-stone-300 px-3 py-3 text-sm leading-6 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="copy.editor.impactPlaceholder" /></FieldGroup>
        </div>
        <p v-if="experienceError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ experienceError }}</p>
        <button class="mt-6 inline-flex w-full items-center justify-center rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900" type="submit">{{ editingExperienceIndex === null ? 'Agregar experiencia' : 'Guardar cambios' }}</button>
      </form>
    </div>

    <div v-if="deletion" class="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title" @click.self="deletion = null">
      <section class="my-auto w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-2xl sm:p-7">
        <div class="grid h-11 w-11 place-items-center rounded-md bg-red-50 text-red-700"><Trash2 :size="21" aria-hidden="true" /></div>
        <h2 id="delete-dialog-title" class="mt-5 text-xl font-black text-stone-950">{{ copy.editor.deleteConfirmationTitle }}</h2>
        <p class="mt-2 text-sm leading-6 text-stone-600">{{ copy.editor.deleteConfirmationText }} <strong class="font-extrabold text-stone-800">{{ deletion.label }}</strong>. {{ copy.editor.deleteConfirmationWarning }}</p>
        <p v-if="deletion.type === 'recommendation' && recommendationError" class="mt-3 text-sm font-semibold text-red-700" role="alert">{{ recommendationError }}</p>
        <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700 transition hover:bg-stone-50" type="button" @click="deletion = null">{{ copy.editor.cancel }}</button>
          <button class="rounded-md bg-red-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" type="button" :disabled="isSaving" @click="confirmDeletion">{{ copy.editor.delete }}</button>
        </div>
      </section>
    </div>

    <div v-if="isPdfLanguageDialogOpen" class="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" :aria-label="copy.editor.downloadLanguageTitle" @click.self="isPdfLanguageDialogOpen = false">
      <section class="my-auto w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl">
        <h2 class="text-xl font-black text-stone-950">{{ copy.editor.downloadLanguageTitle }}</h2>
        <p class="mt-2 text-sm text-stone-600">{{ copy.editor.downloadLanguageText }}</p>
        <select v-model="pdfLanguage" class="mt-5 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-bold text-stone-900"><option value="es">Español</option><option value="en">English</option></select>
        <div class="mt-6 flex justify-end gap-3"><button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700" type="button" @click="isPdfLanguageDialogOpen = false">{{ copy.editor.cancel }}</button><button class="rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-extrabold text-white" type="button" @click="downloadPdf()">{{ copy.editor.confirmDownload }}</button></div>
      </section>
    </div>

    <div v-if="isEmailDialogOpen" class="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="email-dialog-title" @click.self="isEmailDialogOpen = false">
      <form novalidate class="my-auto w-full max-w-lg rounded-lg bg-white p-6 shadow-2xl" @submit.prevent="sendCvByEmail">
        <div class="flex items-center gap-3"><span class="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800"><Mail :size="20" /></span><h2 id="email-dialog-title" class="text-xl font-black text-stone-950">{{ copy.editor.emailTitle }}</h2></div>
        <label class="mt-5 block text-sm font-bold text-stone-700">{{ copy.editor.recipientEmail }}<EmailRecipientsInput v-model="emailForm.recipientEmails" :owner-email="authStore.session?.email" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ copy.editor.emailSubject }}<input v-model.trim="emailForm.subject" maxlength="255" required class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ copy.editor.emailMessage }}<textarea v-model.trim="emailForm.body" rows="5" maxlength="10000" required class="mt-2 w-full resize-y rounded-md border border-stone-300 px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label>
        <label class="mt-4 block text-sm font-bold text-stone-700">{{ copy.editor.emailLanguage }}<select v-model="emailForm.language" class="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-3 text-sm font-bold text-stone-900"><option value="es">Español</option><option value="en">English</option></select></label>
        <p v-if="emailError" class="mt-4 text-sm font-semibold text-red-700" role="alert">{{ emailError }}</p>
        <div class="mt-6 flex justify-end gap-3"><button class="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-extrabold text-stone-700" type="button" :disabled="isSendingEmail" @click="isEmailDialogOpen = false">{{ copy.editor.cancel }}</button><button class="inline-flex items-center gap-2 rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="isSendingEmail"><Mail :size="17" />{{ isSendingEmail ? copy.editor.sendingEmail : copy.editor.sendEmailConfirm }}</button></div>
      </form>
    </div>

  </main>
</template>

<style scoped>
.save-notice-enter-active,
.save-notice-leave-active {
  transition: opacity 260ms ease, transform 260ms ease;
}

.save-notice-enter-from,
.save-notice-leave-to {
  opacity: 0;
  transform: translateY(1rem) scale(0.96);
}
</style>