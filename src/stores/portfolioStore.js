import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

const geoReportCache = new Map()
const geoReportCacheTtl = 30 * 60 * 1000

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

  if (!authStore.session?.token) throw new Error('Debes iniciar sesion para administrar tus portafolios.')
  return { Authorization: `Bearer ${authStore.session.token}` }
}

async function request(path, options = {}) {
  const { headers = {}, ...requestOptions } = options

  try {
    const authorization = await getAuthorizationHeader()
    const response = await $fetch(getApiUrl(path), {
      ...requestOptions,
      headers: {
        Accept: 'application/json',
        ...(requestOptions.body && !(requestOptions.body instanceof FormData) && { 'Content-Type': 'application/json' }),
        ...authorization,
        ...headers,
      },
    })
    if (response?.success === true) return response.data
    throw new Error(response?.message || 'No fue posible completar la solicitud.')
  } catch (error) {
    const errors = error.data?.errors
    throw new Error(errors ? Object.values(errors).flat()[0] : error.data?.message || error.message || 'No fue posible completar la solicitud.')
  }
}

function getCollection(data) {
  if (Array.isArray(data)) return data
  return data?.portfolios || []
}

function fromApiPortfolio(data) {
  return {
    ...data,
    templateId: data.template_id || data.templateId || 'minimalist',
    coverImageUrl: data.cover_image_url || data.coverImageUrl || null,
    publishedAt: data.published_at || data.publishedAt || null,
    content: data.content || { theme: {}, blocks: [] },
  }
}

export const usePortfolioStore = defineStore('portfolio', () => {
  const portfolios = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref('')
  const hasLoaded = ref(false)
  const portfolioCount = computed(() => portfolios.value.length)

  async function loadPortfolios() {
    isLoading.value = true
    error.value = ''
    try {
      portfolios.value = getCollection(await request('/v1/portfolios')).map(fromApiPortfolio)
      hasLoaded.value = true
    } catch (requestError) {
      error.value = requestError.message
    } finally {
      isLoading.value = false
    }
  }

  async function createPortfolio(payload) {
    isSaving.value = true
    error.value = ''
    try {
      const created = await request('/v1/portfolios', { method: 'POST', body: payload })
      const portfolio = fromApiPortfolio(created?.portfolio || created)
      portfolios.value.unshift(portfolio)
      return portfolio
    } catch (requestError) {
      error.value = requestError.message
      throw requestError
    } finally {
      isSaving.value = false
    }
  }

  async function updatePortfolio(portfolioId, payload) {
    isSaving.value = true
    error.value = ''
    try {
      const updated = await request(`/v1/portfolios/${portfolioId}`, { method: 'PATCH', body: payload })
      const portfolio = fromApiPortfolio(updated?.portfolio || updated)
      const index = portfolios.value.findIndex((item) => String(item.id) === String(portfolioId))
      if (index >= 0) portfolios.value.splice(index, 1, portfolio)
      return portfolio
    } catch (requestError) {
      error.value = requestError.message
      throw requestError
    } finally {
      isSaving.value = false
    }
  }

  async function deletePortfolio(portfolioId) {
    isSaving.value = true
    error.value = ''
    try {
      await request(`/v1/portfolios/${portfolioId}`, { method: 'DELETE' })
      portfolios.value = portfolios.value.filter((item) => String(item.id) !== String(portfolioId))
    } catch (requestError) {
      error.value = requestError.message
      throw requestError
    } finally {
      isSaving.value = false
    }
  }

  async function loadPortfolio(portfolioId) {
    isLoading.value = true
    error.value = ''
    try {
      const data = await request(`/v1/portfolios/${portfolioId}`)
      const portfolio = fromApiPortfolio(data?.portfolio || data)
      const index = portfolios.value.findIndex((item) => String(item.id) === String(portfolioId))
      if (index >= 0) portfolios.value.splice(index, 1, portfolio)
      else portfolios.value.push(portfolio)
      return portfolio
    } catch (requestError) {
      error.value = requestError.message
      throw requestError
    } finally {
      isLoading.value = false
    }
  }

  async function getViewReport(portfolioId, range = {}) {
    const parameters = new URLSearchParams()
    if (range.from) parameters.set('from', range.from)
    if (range.to) parameters.set('to', range.to)
    const suffix = parameters.size ? `?${parameters}` : ''
    const data = await request(`/v1/portfolios/${portfolioId}/view-report${suffix}`)
    return data?.report || data
  }

  async function getGeoReport(portfolioId, { force = false } = {}) {
    const cached = geoReportCache.get(String(portfolioId))
    if (!force && cached && Date.now() - cached.cachedAt < geoReportCacheTtl) return cached.report

    const data = await request(`/v1/portfolios/${portfolioId}/view-report`)
    const report = data?.report || data?.geo_report || data
    geoReportCache.set(String(portfolioId), { report, cachedAt: Date.now() })
    return report
  }

  function publishPortfolio(portfolioId) {
    return updateAction(portfolioId, 'publish')
  }

  function unpublishPortfolio(portfolioId) {
    return updateAction(portfolioId, 'unpublish')
  }

  async function updateAction(portfolioId, action) {
    isSaving.value = true
    error.value = ''
    try {
      const updated = await request(`/v1/portfolios/${portfolioId}/${action}`, { method: 'POST' })
      const portfolio = fromApiPortfolio(updated?.portfolio || updated)
      const index = portfolios.value.findIndex((item) => String(item.id) === String(portfolioId))
      if (index >= 0) portfolios.value.splice(index, 1, portfolio)
      return portfolio
    } catch (requestError) {
      error.value = requestError.message
      throw requestError
    } finally {
      isSaving.value = false
    }
  }

  function getRevisions(portfolioId) {
    return request(`/v1/portfolios/${portfolioId}/revisions`)
  }

  function restoreRevision(portfolioId, revisionId) {
    return updateAction(`${portfolioId}/revisions/${revisionId}`, 'restore')
  }

  async function uploadCover(portfolioId, file) {
    const formData = new FormData()
    formData.append('cover', file, file.name)
    isSaving.value = true
    error.value = ''
    try {
      const updated = await request(`/v1/portfolios/${portfolioId}/cover`, { method: 'POST', body: formData })
      const portfolio = fromApiPortfolio(updated?.portfolio || updated)
      const index = portfolios.value.findIndex((item) => String(item.id) === String(portfolioId))
      if (index >= 0) portfolios.value.splice(index, 1, portfolio)
      return portfolio
    } catch (requestError) {
      error.value = requestError.message
      throw requestError
    } finally {
      isSaving.value = false
    }
  }

  async function uploadAsset(portfolioId, file) {
    const formData = new FormData()
    formData.append('asset', file, file.name)
    return request(`/v1/portfolios/${portfolioId}/assets`, { method: 'POST', body: formData })
  }

  return { portfolios, isLoading, isSaving, error, hasLoaded, portfolioCount, loadPortfolios, loadPortfolio, createPortfolio, updatePortfolio, deletePortfolio, getViewReport, getGeoReport, publishPortfolio, unpublishPortfolio, getRevisions, restoreRevision, uploadCover, uploadAsset }
})