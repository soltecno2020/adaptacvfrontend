import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { countryConfigs, defaultCountryId } from '../config/countries'
import { useAuthStore } from './authStore'

function createEmptyCv() {
  return {
  profile: {
    fullName: '',
    role: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    linkedIn: '',
    availability: '',
    professionalSummary: '',
    photoUrl: '',
    includePhoto: false,
  },
  migration: {
    visaStatus: '',
    workAvailability: '',
    includeMigration: true,
  },
  educations: [],
  experience: [],
  skills: [],
  languages: [],
  interests: [],
  employmentRecommendations: [],
  }
}

function getApiUrl(path) {
  const { public: { apiBaseUrl } } = useRuntimeConfig()
  return `${apiBaseUrl.replace(/\/$/, '')}${path}`
}

async function getAuthorizationHeader() {
  const authStore = useAuthStore()
  if (authStore.isInitializing) {
    await new Promise((resolve) => {
      const stop = watch(() => authStore.isInitializing, (isInitializing) => {
        if (!isInitializing) {
          stop()
          resolve()
        }
      })
    })
  }

  const token = authStore.session?.token
  if (!token) throw new Error('Debes iniciar sesion para administrar tus CVs.')
  return { Authorization: `Bearer ${token}` }
}

async function request(path, options = {}) {
  const { headers = {}, ...requestOptions } = options

  try {
    const authorization = await getAuthorizationHeader()
    const response = await $fetch(getApiUrl(path), {
      ...requestOptions,
      headers: { Accept: 'application/json', ...(requestOptions.body && { 'Content-Type': 'application/json' }), ...authorization, ...headers },
    })
    if (response?.success === true) return response.data
    throw new Error(response?.message || 'No fue posible completar la solicitud.')
  } catch (error) {
    throw new Error(error.data?.message || error.message || 'No fue posible completar la solicitud.')
  }
}

async function requestForm(path, formData, options = {}) {
  try {
    const authorization = await getAuthorizationHeader()
    const response = await $fetch(getApiUrl(path), {
      method: options.method || 'POST',
      body: formData,
      signal: options.signal,
      headers: { Accept: 'application/json', ...authorization },
    })
    if (response?.success === true) return response.data
    throw new Error(response?.message || 'No fue posible completar la solicitud.')
  } catch (error) {
    const errors = error.data?.errors
    const message = errors ? Object.values(errors).flat()[0] : error.data?.message || error.message
    throw new Error(message || 'No fue posible completar la solicitud.')
  }
}

function toMonth(value) {
  return value ? String(value).slice(0, 7) : ''
}

function toDate(value) {
  return value ? `${value}-01` : null
}

function getValidUrl(value) {
  const url = String(value || '').trim()
  if (!url) return ''

  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : ''
  } catch {
    return ''
  }
}

function toBoolean(value, fallback = true) {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string') return !['0', 'false', 'off', 'no'].includes(value.trim().toLowerCase())
  return Boolean(value)
}

function fromApiCv(data, accountEmail = '') {
  const visaStatus = data.immigration_status_id === null || data.immigration_status_id === undefined ? '' : String(data.immigration_status_id)

  return {
    profile: {
      fullName: data.full_name || '', role: data.role || '', email: accountEmail || data.email || '', phone: data.phone || '', city: data.city || '', country: data.country || '', linkedIn: data.linkedin_url || '', availability: data.availability || '', professionalSummary: data.professional_summary || '', photoUrl: data.photo_url || '', includePhoto: Boolean(data.photo_url),
    },
    migration: {
      visaStatus,
      workAvailability: data.work_availability || '',
      includeMigration: toBoolean(data.show_immigration_status),
    },
    educations: (data.educations || []).map((education) => ({ credential: education.original_credential || '', localLevel: education.local_equivalent_level || '', institution: education.institution || '', startYear: String(education.started_at || '').slice(0, 4), endYear: String(education.ended_at || '').slice(0, 4) })),
    experience: (data.experiences || []).map((experience) => ({ role: experience.position || '', company: experience.company || '', startDate: toMonth(experience.started_at), endDate: toMonth(experience.ended_at), period: '', summary: experience.impact_summary || '' })),
    skills: (data.skills || []).map((item) => item.name || item).filter(Boolean),
    languages: (data.languages || []).map((item) => item.name || item).filter(Boolean),
    interests: (data.interests || []).map((item) => item.name || item).filter(Boolean),
    employmentRecommendations: (data.employment_recommendations || []).map((item) => ({ id: item.id, name: item.file_name || item.name || item.original_name || 'recommendation.pdf', url: item.url || item.file_url || item.path || '' })),
  }
}

function getCvCollection(data) {
  if (Array.isArray(data)) return data
  return data?.cvs || []
}

function getDestinationCountryId(data) {
  return data.destination_country_id ?? data.destination_country?.id ?? data.destinationCountry?.id ?? null
}

export const useCvStore = defineStore('cv', () => {
  const authStore = useAuthStore()
  const selectedCountryId = ref(defaultCountryId)
  const destinationCountries = ref([])
  const isLoadingDestinationCountries = ref(false)
  const destinationCountriesError = ref('')
  const qualificationLevels = ref([])
  const isLoadingQualificationLevels = ref(false)
  const qualificationLevelsError = ref('')
  const immigrationStatuses = ref([])
  const isLoadingImmigrationStatuses = ref(false)
  const immigrationStatusesError = ref('')
  const cvDocuments = ref([])
  const selectedCvId = ref(null)
  const cv = ref(createEmptyCv())
  const isLoadingCvs = ref(false)
  const cvsError = ref('')
  const isSaving = ref(false)
  const saveError = ref('')
  const lastSavedAt = ref(null)
  let isHydrating = false
  let saveTimer
  let saveAbortController
  let skipNextAutoSave = false

  function getDateRank(entry, field) {
    const date = entry[field]
    if (date) return Number.parseInt(date.replace('-', ''), 10) || 0

    const period = entry.period ?? ''
    if (/present|actualidad/i.test(period)) return Number.MAX_SAFE_INTEGER

    const years = period.match(/\d{4}/g) ?? []
    return Number.parseInt(field === 'endDate' ? years[1] : years[0], 10) || 0
  }

  function sortByDate(entries) {
    entries.sort((first, second) => (
      getDateRank(second, second.endYear ? 'endYear' : 'endDate') - getDateRank(first, first.endYear ? 'endYear' : 'endDate')
      || getDateRank(second, second.startYear ? 'startYear' : 'startDate') - getDateRank(first, first.startYear ? 'startYear' : 'startDate')
    ))
  }

  const activeCvDocument = computed(() => {
    return cvDocuments.value.find((document) => document.id === selectedCvId.value)
  })

  const activeCountryConfig = computed(() => {
    const destination = destinationCountries.value.find((country) => String(country.id) === String(selectedCountryId.value))
    const destinationKey = destination?.name
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const configuredCountry = countryConfigs[selectedCountryId.value] || countryConfigs[destinationKey]
    if (configuredCountry) return configuredCountry

    return {
      id: selectedCountryId.value || defaultCountryId,
      name: destination?.name || countryConfigs[defaultCountryId].name,
      marketLabel: 'International market',
      currency: '',
      atsRules: { allowPhoto: true, hiddenFields: [], warning: '' },
      advice: {},
      educationLevels: [],
      visaOptions: [],
    }
  })

  const legalWarning = computed(() => activeCountryConfig.value.atsRules.warning)
  const shouldShowPhoto = computed(() => (
    activeCountryConfig.value.atsRules.allowPhoto
    && cv.value.profile.includePhoto
    && Boolean(authStore.session?.photoUrl)
  ))

  function toApiPayload(document) {
    const qualificationName = (value) => qualificationLevels.value.find((level) => String(level.id) === String(value) || level.name === value)?.name || value || null
    const data = document.data
    const visaStatusId = data.migration.visaStatus
    return {
      name: document.name,
      industry_id: document.industryId,
      destination_country_id: selectedCountryId.value || null,
      immigration_status_id: visaStatusId === null || visaStatusId === undefined || visaStatusId === '' ? null : Number(visaStatusId),
      full_name: data.profile.fullName,
      role: data.profile.role,
      email: authStore.session?.email || data.profile.email,
      phone: data.profile.phone,
      city: data.profile.city,
      country: data.profile.country,
      linkedin_url: getValidUrl(data.profile.linkedIn),
      availability: data.profile.availability,
      professional_summary: data.profile.professionalSummary,
      photo_url: authStore.session?.photoUrl || null,
      show_immigration_status: data.migration.includeMigration,
      work_availability: data.migration.workAvailability,
      educations: data.educations.map((education) => ({ original_credential: education.credential, local_equivalent_level: qualificationName(education.localLevel), started_at: education.startYear ? `${education.startYear}-01-01` : null, ended_at: education.endYear ? `${education.endYear}-01-01` : null, institution: education.institution })),
      experiences: data.experience.map((experience) => ({ position: experience.role, company: experience.company, started_at: toDate(experience.startDate), ended_at: toDate(experience.endDate), impact_summary: experience.summary })),
      skills: data.skills.map((name) => ({ name })),
      languages: data.languages.map((name) => ({ name })),
      interests: data.interests.map((name) => ({ name })),
    }
  }

  function appendFormData(formData, value, field) {
    if (value === null || value === undefined) return
    if (typeof value === 'boolean') {
      formData.append(field, value ? '1' : '0')
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => appendFormData(formData, item, `${field}[${index}]`))
      return
    }
    if (typeof value === 'object' && !(value instanceof File)) {
      Object.entries(value).forEach(([key, item]) => appendFormData(formData, item, `${field}[${key}]`))
      return
    }
    formData.append(field, value)
  }

  function toFormData(document, recommendation = null, recommendationIdsToDelete = []) {
    const formData = new FormData()
    formData.append('_method', 'PUT')
    Object.entries(toApiPayload(document)).forEach(([field, value]) => appendFormData(formData, value, field))
    if (recommendation) formData.append('employment_recommendations[]', recommendation, recommendation.name)
    recommendationIdsToDelete.forEach((id) => formData.append('deleted_employment_recommendation_ids[]', id))
    return formData
  }

  function scheduleSave() {
    if (skipNextAutoSave) {
      skipNextAutoSave = false
      return
    }
    if (isHydrating || !selectedCvId.value) return
    window.clearTimeout(saveTimer)
    const cvId = selectedCvId.value
    saveTimer = window.setTimeout(() => saveCurrentCv(cvId), 700)
  }

  async function saveCurrentCv(cvId = selectedCvId.value, recommendation = null, recommendationIdsToDelete = []) {
    const document = cvDocuments.value.find((item) => item.id === cvId)
    if (!document) return

    saveAbortController?.abort()
    const controller = new AbortController()
    saveAbortController = controller
    isSaving.value = true
    saveError.value = ''

    try {
      const updated = await requestForm(`/v1/auth/cvs/${document.id}`, toFormData(document, recommendation, recommendationIdsToDelete), {
        method: 'POST',
        signal: controller.signal,
      })
      const updatedDocument = updated?.cv || updated
      document.name = updatedDocument?.name || document.name
      if (updatedDocument?.employment_recommendations) {
        skipNextAutoSave = true
        document.data.employmentRecommendations = fromApiCv(updatedDocument).employmentRecommendations
      }
      document.updatedAt = new Date().toISOString()
      lastSavedAt.value = Date.now()
    } catch (error) {
      if (error.name !== 'AbortError') saveError.value = error.message
    } finally {
      if (saveAbortController === controller) isSaving.value = false
    }
  }

  async function sendCvByEmail({ recipientEmails = [], subject, body, pdf }) {
    const formData = new FormData()
    const recipients = [...new Set([...recipientEmails, authStore.session?.email].map((email) => String(email || '').trim().toLowerCase()).filter(Boolean))]
    recipients.forEach((email) => formData.append('recipient_emails[]', email))
    formData.append('subject', subject)
    formData.append('body', body)
    formData.append('pdf', pdf, pdf.name || 'cv.pdf')
    return requestForm('/v1/auth/cvs/email', formData)
  }

  async function importCvFromFile(file, locale) {
    const formData = new FormData()
    formData.append('file', file, file.name)
    formData.append('locale', locale)
    const data = await requestForm('/v1/auth/cvs/import', formData)
    return data?.cv || data
  }

  async function applyImportedCv(cvId, importedCv) {
    const document = cvDocuments.value.find((item) => item.id === cvId)
    if (!document) throw new Error('No fue posible encontrar el CV creado.')

    const profile = importedCv?.profile || {}
    const data = {
      profile: {
        fullName: profile.fullName || '',
        role: profile.role || '',
        email: authStore.session?.email || profile.email || '',
        phone: profile.phone || '',
        city: profile.city || '',
        country: profile.country || '',
        linkedIn: profile.linkedIn || '',
        availability: profile.availability || '',
        professionalSummary: profile.professionalSummary || '',
        photoUrl: '',
        includePhoto: false,
      },
      migration: { visaStatus: '', workAvailability: '', includeMigration: true },
      educations: (importedCv?.educations || []).map((education) => ({
        credential: education.credential || '',
        localLevel: education.localLevel || '',
        institution: education.institution || '',
        startYear: education.startYear || '',
        endYear: education.endYear || '',
      })).filter((education) => education.credential || education.institution),
      experience: (importedCv?.experience || []).map((experience) => ({
        role: experience.role || '',
        company: experience.company || '',
        startDate: experience.startDate || '',
        endDate: experience.endDate || '',
        period: '',
        summary: experience.summary || '',
      })).filter((experience) => experience.role || experience.company),
      skills: (importedCv?.skills || []).filter(Boolean),
      languages: (importedCv?.languages || []).filter(Boolean),
      interests: (importedCv?.interests || []).filter(Boolean),
      employmentRecommendations: [],
    }

    document.data = data
    if (selectedCvId.value === cvId) cv.value = data
    await saveCurrentCv(cvId)
  }

  async function reviewCvWithAi({ locale } = {}) {
    const document = activeCvDocument.value
    if (!document) throw new Error('No hay un CV seleccionado.')

    const data = await request(`/v1/auth/cvs/${document.id}/ai/review`, {
      method: 'POST',
      body: {
        locale,
        destination_country_id: selectedCountryId.value || null,
        cv: toApiPayload(document),
      },
    })

    const report = data?.report || data
    document.aiReviewScore = data?.cv?.ai_review_score ?? report?.score ?? null
    document.aiReviewedAt = data?.cv?.ai_reviewed_at ?? null
    return report
  }

  async function uploadEmploymentRecommendation(file) {
    return saveCurrentCv(selectedCvId.value, file)
  }

  async function deleteEmploymentRecommendation(id) {
    return saveCurrentCv(selectedCvId.value, null, [id])
  }

  async function loadCvs() {
    if (isLoadingCvs.value) return

    isLoadingCvs.value = true
    cvsError.value = ''
    try {
      const data = await request('/v1/auth/cvs')
      isHydrating = true
      cvDocuments.value = getCvCollection(data).map((item) => ({ id: item.id, name: item.name, industryId: item.industry_id, sector: item.industry?.name || item.industry_name || '', destinationCountryId: getDestinationCountryId(item), aiReviewScore: item.ai_review_score, aiReviewedAt: item.ai_reviewed_at, updatedAt: item.updated_at, data: fromApiCv(item, authStore.session?.email) }))
      if (cvDocuments.value.length) {
        selectCv(cvDocuments.value[0].id)
        selectedCountryId.value = cvDocuments.value[0].destinationCountryId || selectedCountryId.value
        await Promise.all([loadQualificationLevels(), loadImmigrationStatuses()])
      }
      else {
        selectedCvId.value = null
        cv.value = createEmptyCv()
      }
    } catch (error) {
      cvsError.value = error.message
    } finally {
      isHydrating = false
      isLoadingCvs.value = false
    }
  }

  async function setDestinationCountry(countryId, shouldSave = true) {
    selectedCountryId.value = countryId
    const document = activeCvDocument.value
    if (document) document.destinationCountryId = countryId

    await Promise.all([
      loadQualificationLevels(countryId),
      loadImmigrationStatuses(countryId),
    ])

    const [firstEducationLevel] = qualificationLevels.value
    cv.value.educations.forEach((education) => {
      const matchingLevel = qualificationLevels.value.find((level) => (
        String(level.id) === String(education.localLevel) || level.name === education.localLevel
      ))
      if (matchingLevel) education.localLevel = matchingLevel.id
      else if (firstEducationLevel) education.localLevel = firstEducationLevel.id
    })

    const [firstImmigrationStatus] = immigrationStatuses.value
    const currentVisaStatus = cv.value.migration.visaStatus === null || cv.value.migration.visaStatus === undefined ? '' : String(cv.value.migration.visaStatus)
    const hasValidImmigrationStatus = immigrationStatuses.value.some((status) => (
      String(status.id) === currentVisaStatus
    ))
    if (!currentVisaStatus || !hasValidImmigrationStatus) {
      cv.value.migration.visaStatus = firstImmigrationStatus?.id ?? ''
    }

    if (shouldSave) scheduleSave()
  }

  async function loadQualificationLevels(countryId = selectedCountryId.value) {
    if (!countryId) return

    const { public: { apiBaseUrl } } = useRuntimeConfig()
    isLoadingQualificationLevels.value = true
    qualificationLevelsError.value = ''
    qualificationLevels.value = []

    try {
      const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/v1/destination-countries/${countryId}/qualification-levels`, {
        headers: { Accept: 'application/json' },
      })
      if (!response?.success) throw new Error(response?.message || 'No fue posible obtener los niveles equivalentes.')
      qualificationLevels.value = response.data?.qualification_levels || []
    } catch (error) {
      qualificationLevelsError.value = error.data?.message || error.message || 'No fue posible obtener los niveles equivalentes.'
    } finally {
      isLoadingQualificationLevels.value = false
    }
  }

  async function loadImmigrationStatuses(countryId = selectedCountryId.value) {
    if (!countryId) return

    const { public: { apiBaseUrl } } = useRuntimeConfig()
    isLoadingImmigrationStatuses.value = true
    immigrationStatusesError.value = ''
    immigrationStatuses.value = []

    try {
      const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/v1/destination-countries/${countryId}/immigration-statuses`, {
        headers: { Accept: 'application/json' },
      })
      if (!response?.success) throw new Error(response?.message || 'No fue posible obtener los estatus migratorios.')
      immigrationStatuses.value = response.data?.immigration_statuses || []
    } catch (error) {
      immigrationStatusesError.value = error.data?.message || error.message || 'No fue posible obtener los estatus migratorios.'
    } finally {
      isLoadingImmigrationStatuses.value = false
    }
  }

  async function loadDestinationCountries() {
    if (isLoadingDestinationCountries.value) return

    const { public: { apiBaseUrl } } = useRuntimeConfig()
    isLoadingDestinationCountries.value = true
    destinationCountriesError.value = ''
    const loadingStartedAt = Date.now()

    try {
      const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/v1/destination-countries`, {
        headers: { Accept: 'application/json' },
      })
      if (!response?.success) throw new Error(response?.message || 'No fue posible obtener los paises de destino.')
      destinationCountries.value = response.data?.countries || []

      if (!destinationCountries.value.some((country) => String(country.id) === String(selectedCountryId.value))) {
        selectedCountryId.value = destinationCountries.value[0]?.id ?? null
      }
      await setDestinationCountry(selectedCountryId.value, false)
    } catch (error) {
      destinationCountriesError.value = error.data?.message || error.message || 'No fue posible obtener los paises de destino.'
    } finally {
      const remainingDelay = 500 - (Date.now() - loadingStartedAt)
      if (remainingDelay > 0) await new Promise((resolve) => window.setTimeout(resolve, remainingDelay))
      isLoadingDestinationCountries.value = false
    }
  }

  function updateProfileField(field, value) {
    if (field === 'email') return
    cv.value.profile[field] = value
    scheduleSave()
  }

  function updateMigrationField(field, value) {
    cv.value.migration[field] = value
    scheduleSave()
  }

  function addEducation(education) {
    cv.value.educations.push({ ...education })
    sortByDate(cv.value.educations)
  }

  function updateEducation(index, education) {
    if (!cv.value.educations[index]) return
    cv.value.educations[index] = { ...education }
    sortByDate(cv.value.educations)
  }

  function deleteEducation(index) {
    if (!cv.value.educations[index]) return
    cv.value.educations.splice(index, 1)
  }

  function addExperience(experience) {
    cv.value.experience.push({ ...experience })
    sortByDate(cv.value.experience)
  }

  function updateExperience(index, experience) {
    if (!cv.value.experience[index]) return
    cv.value.experience[index] = { ...experience }
    sortByDate(cv.value.experience)
  }

  function deleteExperience(index) {
    if (!cv.value.experience[index]) return
    cv.value.experience.splice(index, 1)
  }

  function updateSkill(index, value) {
    if (cv.value.skills[index] === undefined) return
    cv.value.skills[index] = value
  }

  function addSkill(value) {
    const skill = value.trim()
    if (!skill || cv.value.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return false

    cv.value.skills.push(skill)
    return true
  }

  function deleteSkill(index) {
    if (cv.value.skills[index] === undefined) return
    cv.value.skills.splice(index, 1)
  }

  function updateListItem(list, index, value) {
    if (!Array.isArray(cv.value[list]) || cv.value[list][index] === undefined) return
    cv.value[list][index] = value
  }

  function addListItem(list, value) {
    const item = value.trim()
    if (!Array.isArray(cv.value[list]) || !item) return false

    cv.value[list].push(item)
    return true
  }

  function deleteListItem(list, index) {
    if (!Array.isArray(cv.value[list]) || cv.value[list][index] === undefined) return
    cv.value[list].splice(index, 1)
  }

  async function createCv(name, industry) {
    const data = await request('/v1/auth/cvs', {
      method: 'POST',
      body: { name: name.trim(), industry_id: industry.id },
    })
    const item = data?.cv || data
    const document = { id: item.id, name: item.name, industryId: item.industry_id, sector: industry.name, destinationCountryId: item.destination_country_id, aiReviewScore: item.ai_review_score, aiReviewedAt: item.ai_reviewed_at, updatedAt: item.updated_at, data: fromApiCv(item, authStore.session?.email) }
    cvDocuments.value.unshift(document)
    selectCv(document.id)
    return document
  }

  async function duplicateCv(document, name) {
    const data = await request(`/v1/auth/cvs/${document.id}/duplicate`, {
      method: 'POST',
      body: { name },
    })
    const item = data?.cv || data
    const duplicate = {
      id: item.id,
      name: item.name,
      industryId: item.industry_id,
      sector: item.industry?.name || item.industry_name || document.sector,
      destinationCountryId: item.destination_country_id,
      aiReviewScore: item.ai_review_score,
      aiReviewedAt: item.ai_reviewed_at,
      updatedAt: item.updated_at,
      data: fromApiCv(item, authStore.session?.email),
    }
    cvDocuments.value.unshift(duplicate)
    return duplicate
  }

  async function updateCvMetadata({ name, industry }) {
    const document = activeCvDocument.value
    if (!document) throw new Error('No hay un CV seleccionado.')

    document.name = name.trim()
    document.industryId = industry.id
    document.sector = industry.name
    await saveCurrentCv(document.id)
  }

  function selectCv(id) {
    const document = cvDocuments.value.find((item) => item.id === id)
    if (!document) return

    selectedCvId.value = document.id
    selectedCountryId.value = document.destinationCountryId || selectedCountryId.value
    cv.value = document.data
    document.updatedAt = new Date().toISOString()
  }

  async function deleteCv(id) {
    const documentIndex = cvDocuments.value.findIndex((document) => document.id === id)
    if (documentIndex === -1) return

    await request(`/v1/auth/cvs/${id}`, { method: 'DELETE' })
    cvDocuments.value.splice(documentIndex, 1)
    if (selectedCvId.value === id) {
      selectedCvId.value = null
      cv.value = createEmptyCv()
    }
  }

  watch(cv, scheduleSave, { deep: true, flush: 'sync' })

  return {
    selectedCountryId,
    destinationCountries,
    isLoadingDestinationCountries,
    destinationCountriesError,
    qualificationLevels,
    isLoadingQualificationLevels,
    qualificationLevelsError,
    immigrationStatuses,
    isLoadingImmigrationStatuses,
    immigrationStatusesError,
    cv,
    cvDocuments,
    isLoadingCvs,
    cvsError,
    isSaving,
    saveError,
    lastSavedAt,
    selectedCvId,
    activeCvDocument,
    activeCountryConfig,
    legalWarning,
    shouldShowPhoto,
    setDestinationCountry,
    loadDestinationCountries,
    loadQualificationLevels,
    loadImmigrationStatuses,
    loadCvs,
    saveCurrentCv,
    uploadEmploymentRecommendation,
    deleteEmploymentRecommendation,
    sendCvByEmail,
    importCvFromFile,
    applyImportedCv,
    reviewCvWithAi,
    updateProfileField,
    updateMigrationField,
    addEducation,
    updateEducation,
    deleteEducation,
    updateExperience,
    addExperience,
    deleteExperience,
    updateSkill,
    addSkill,
    deleteSkill,
    updateListItem,
    addListItem,
    deleteListItem,
    createCv,
    duplicateCv,
    updateCvMetadata,
    selectCv,
    deleteCv,
  }
})