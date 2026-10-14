<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { BarChart3, BriefcaseBusiness, ChevronLeft, ChevronRight, Coffee, Eye, ExternalLink, FileText, FolderKanban, LayoutDashboard, Monitor, Search, ShieldCheck, Smartphone, Users, X } from '@lucide/vue'
import WorkspaceNav from '../../components/navigation/WorkspaceNav.vue'
import CvPreview from '../../components/cv/CvPreview.vue'
import PortfolioGeoMap from '../../components/portfolios/PortfolioGeoMap.vue'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const activeTab = ref('dashboard')
const searchQuery = ref('')
const users = ref([])
const usersMeta = ref({ currentPage: 1, lastPage: 1, perPage: 20, total: 0 })
const isLoadingUsers = ref(false)
const usersError = ref('')
const hasLoadedUsers = ref(false)
const adminCvs = ref([])
const cvsMeta = ref({ currentPage: 1, lastPage: 1, perPage: 20, total: 0 })
const isLoadingCvs = ref(false)
const cvsError = ref('')
const hasLoadedCvs = ref(false)
const adminPortfolios = ref([])
const portfoliosMeta = ref({ currentPage: 1, lastPage: 1, perPage: 20, total: 0 })
const isLoadingPortfolios = ref(false)
const portfoliosError = ref('')
const hasLoadedPortfolios = ref(false)
const donations = ref([])
const donationsMeta = ref({ currentPage: 1, lastPage: 1, perPage: 20, total: 0 })
const donationsSummary = ref({ completed_count: 0, completed_total: '0.00', currency: 'USD' })
const isLoadingDonations = ref(false)
const donationsError = ref('')
const hasLoadedDonations = ref(false)
const dashboard = ref(null)
const dashboardError = ref('')
const isLoadingDashboard = ref(false)
const selectedUser = ref(null)
const selectedContentType = ref('cvs')
const selectedItem = ref(null)
const portfolioViewport = ref('desktop')
const portfolioReport = ref(null)
const portfolioReportError = ref('')
const isLoadingPortfolioReport = ref(false)
const portfolioReportFrom = ref('')
const portfolioReportTo = ref('')
const portfolioPreviewViewport = ref(null)
const portfolioPreviewScale = ref(1)
const portfolioPreviewFrameHeight = ref(680)
let portfolioPreviewResizeObserver

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Usuarios', icon: Users },
  { id: 'cvs', label: 'CVs', icon: FileText },
  { id: 'portfolios', label: 'Portafolios', icon: FolderKanban },
  { id: 'donations', label: 'Donaciones', icon: Coffee },
]

const dashboardMaxDailyViews = computed(() => Math.max(...(dashboard.value?.daily || []).map((day) => day.views), 1))
const dashboardMonthlyActivity = computed(() => (dashboard.value?.monthly || []).map((month) => ({
  ...month,
  label: new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(new Date(`${month.month}-01T00:00:00`)).replace('.', ''),
})))
const dashboardMapReport = computed(() => dashboard.value ? {
  countries: dashboard.value.countries || [],
  updated_at: dashboard.value.updated_at,
  refresh_after_seconds: dashboard.value.refresh_after_seconds,
} : null)

const currentItems = computed(() => ({
  users: users.value,
  cvs: adminCvs.value,
  portfolios: adminPortfolios.value,
  donations: donations.value,
})[activeTab.value] || [])

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('es')
  if (!query) return currentItems.value

  return currentItems.value.filter((item) => (
    Object.values(item).some((value) => String(value).toLocaleLowerCase('es').includes(query))
  ))
})

function getApiUrl(path) {
  return `${useRuntimeConfig().public.apiBaseUrl.replace(/\/$/, '')}${path}`
}

function getInitials(name, email) {
  const words = (name || email || '?').trim().split(/\s+/).filter(Boolean)
  return words.slice(0, 2).map((word) => word.charAt(0)).join('').toUpperCase()
}

function formatDate(date) {
  if (!date) return 'Sin registro'
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date)).replace('.', '')
}

function normalizeUser(user) {
  return {
    id: user.id,
    name: user.name || 'Sin nombre',
    email: user.email || 'Sin correo',
    initials: getInitials(user.name, user.email),
    country: user.cvs?.[0]?.country || 'Sin información',
    role: user.role || 'user',
    cvs: user.cvs_count || 0,
    portfolios: user.portfolios_count || 0,
    cvItems: user.cvs || [],
    portfolioItems: user.portfolios || [],
    joinedAt: formatDate(user.created_at),
    status: user.email_verified_at ? 'Verificado' : 'Pendiente',
  }
}

function normalizeAdminCv(cv) {
  return {
    ...cv,
    title: cv.name || 'CV sin nombre',
    owner: cv.user?.name || cv.full_name || 'Sin propietario',
    country: cv.destination_country?.name || cv.country || 'Sin información',
    updatedAt: formatDate(cv.updated_at),
    status: cv.professional_summary || cv.experiences?.length || cv.skills?.length ? 'Completo' : 'Borrador',
  }
}

function normalizeAdminPortfolio(portfolio) {
  return {
    ...portfolio,
    title: portfolio.name || 'Portafolio sin nombre',
    template: portfolio.template_id || 'Sin plantilla',
    owner: portfolio.user?.name || 'Sin propietario',
    updatedAt: formatDate(portfolio.updated_at),
    published: portfolio.status === 'published',
  }
}

const selectedItems = computed(() => selectedContentType.value === 'cvs'
  ? selectedUser.value?.cvItems || []
  : selectedUser.value?.portfolioItems || [])

const selectedContentLabel = computed(() => selectedContentType.value === 'cvs' ? 'CVs' : 'Portafolios')

const selectedCvPreview = computed(() => {
  if (selectedContentType.value !== 'cvs' || !selectedItem.value) return null
  const cv = selectedItem.value
  return {
    profile: {
      fullName: cv.full_name || cv.name || '',
      role: cv.role || '',
      email: cv.email || selectedUser.value?.email || '',
      phone: cv.phone || '',
      city: cv.city || '',
      country: cv.country || '',
      linkedIn: cv.linkedin_url || '',
      availability: cv.availability || '',
      professionalSummary: cv.professional_summary || '',
    },
    migration: {
      visaStatus: cv.immigration_status_id || '',
      workAvailability: cv.work_availability || '',
      includeMigration: Boolean(cv.show_immigration_status),
    },
    educations: (cv.educations || []).map((item) => ({ credential: item.original_credential || item.credential || '', institution: item.institution || '', startYear: String(item.started_at || item.start_year || '').slice(0, 4), endYear: String(item.ended_at || item.end_year || '').slice(0, 4), localLevel: item.local_equivalent_level || '' })),
    experience: (cv.experiences || []).map((item) => ({ role: item.position || item.role || '', company: item.company || '', startDate: String(item.started_at || item.start_date || '').slice(0, 7), endDate: String(item.ended_at || item.end_date || '').slice(0, 7), period: item.period || '', summary: item.impact_summary || item.summary || '' })),
    skills: (cv.skills || []).map((item) => item.name || item).filter(Boolean),
    languages: (cv.languages || []).map((item) => item.name || item).filter(Boolean),
    interests: (cv.interests || []).map((item) => item.name || item).filter(Boolean),
    employmentRecommendations: [],
  }
})

const adminCvPreviewConfig = { marketLabel: 'Vista administrativa' }

const portfolioReportMaxViews = computed(() => Math.max(...(portfolioReport.value?.daily || []).map((item) => item.views), 1))

const portfolioPreviewFrameWidth = computed(() => portfolioViewport.value === 'desktop' ? 1440 : 390)

const portfolioPreviewStageStyle = computed(() => ({
  width: `${portfolioPreviewFrameWidth.value * portfolioPreviewScale.value}px`,
  height: `${portfolioPreviewFrameHeight.value * portfolioPreviewScale.value}px`,
}))

const portfolioPreviewFrameStyle = computed(() => ({
  width: `${portfolioPreviewFrameWidth.value}px`,
  height: `${portfolioPreviewFrameHeight.value}px`,
  transform: `scale(${portfolioPreviewScale.value})`,
  transformOrigin: 'top left',
}))

function updatePortfolioPreviewScale() {
  const viewport = portfolioPreviewViewport.value
  if (!viewport || !import.meta.client) return

  const frameWidth = portfolioPreviewFrameWidth.value
  portfolioPreviewScale.value = Math.min(viewport.clientWidth / frameWidth, 1)
  portfolioPreviewFrameHeight.value = Math.max(viewport.clientHeight / portfolioPreviewScale.value, 680)
}

function openUserContent(user, type) {
  selectedUser.value = user
  selectedContentType.value = type
  selectedItem.value = type === 'cvs' ? user.cvItems?.[0] || null : user.portfolioItems?.[0] || null
  portfolioViewport.value = 'desktop'
  if (type === 'portfolios' && selectedItem.value) fetchPortfolioReport()
}

function selectContentItem(item) {
  selectedItem.value = item
  if (selectedContentType.value === 'portfolios') fetchPortfolioReport()
}

function closeUserContent() {
  selectedUser.value = null
  selectedItem.value = null
  portfolioReport.value = null
  portfolioReportError.value = ''
  portfolioReportFrom.value = ''
  portfolioReportTo.value = ''
}

watch(portfolioViewport, () => requestAnimationFrame(updatePortfolioPreviewScale))

watch(() => selectedItem.value?.slug, async (slug) => {
  if (!slug) return
  await nextTick()
  if (portfolioPreviewViewport.value) portfolioPreviewResizeObserver?.observe(portfolioPreviewViewport.value)
  updatePortfolioPreviewScale()
})

onMounted(() => {
  if (!import.meta.client) return
  portfolioPreviewResizeObserver = new ResizeObserver(updatePortfolioPreviewScale)
  if (portfolioPreviewViewport.value) portfolioPreviewResizeObserver.observe(portfolioPreviewViewport.value)
  window.addEventListener('resize', updatePortfolioPreviewScale)
  fetchDashboard()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updatePortfolioPreviewScale)
  portfolioPreviewResizeObserver?.disconnect()
})

async function fetchUsers(page = 1) {
  const token = authStore.session?.token
  if (!token) {
    usersError.value = 'Tu sesión no es válida. Vuelve a iniciar sesión.'
    return
  }

  isLoadingUsers.value = true
  usersError.value = ''
  try {
    const response = await $fetch(getApiUrl(`/v1/admin/users?per_page=20&page=${page}`), {
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + token },
    })
    if (!response?.success) throw new Error(response?.message || 'No fue posible cargar los usuarios.')

    const data = response.data || {}
    users.value = (data.users || []).map(normalizeUser)
    usersMeta.value = {
      currentPage: data.meta?.current_page || 1,
      lastPage: data.meta?.last_page || 1,
      perPage: data.meta?.per_page || 20,
      total: data.meta?.total || 0,
    }
    hasLoadedUsers.value = true
  } catch (error) {
    usersError.value = error.data?.message || error.message || 'No fue posible cargar los usuarios.'
  } finally {
    isLoadingUsers.value = false
  }
}

async function fetchDashboard() {
  if (isLoadingDashboard.value) return

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
  if (!token) {
    dashboardError.value = 'Tu sesión no es válida. Vuelve a iniciar sesión.'
    return
  }

  isLoadingDashboard.value = true
  dashboardError.value = ''
  try {
    const response = await $fetch(getApiUrl('/v1/admin/dashboard'), {
      headers: { Accept: 'application/json', Authorization: ['Bearer', token].join(' ') },
    })
    if (!response?.success) throw new Error(response?.message || 'No fue posible cargar el dashboard.')
    dashboard.value = response.data?.dashboard || null
  } catch (error) {
    dashboardError.value = error.data?.message || error.message || 'No fue posible cargar el dashboard.'
  } finally {
    isLoadingDashboard.value = false
  }
}

async function refreshDashboard(scrollTop = window.scrollY) {
  await fetchDashboard()
  await nextTick()
  window.scrollTo(0, scrollTop)
}

async function fetchCvs(page = 1) {
  const token = authStore.session?.token
  if (!token) {
    cvsError.value = 'Tu sesión no es válida. Vuelve a iniciar sesión.'
    return
  }

  isLoadingCvs.value = true
  cvsError.value = ''
  try {
    const response = await $fetch(getApiUrl(`/v1/admin/cvs?per_page=20&page=${page}`), {
      headers: { Accept: 'application/json', Authorization: ['Bearer', token].join(' ') },
    })
    if (!response?.success) throw new Error(response?.message || 'No fue posible cargar los CVs.')

    const data = response.data || {}
    adminCvs.value = (data.cvs || []).map(normalizeAdminCv)
    cvsMeta.value = {
      currentPage: data.meta?.current_page || 1,
      lastPage: data.meta?.last_page || 1,
      perPage: data.meta?.per_page || 20,
      total: data.meta?.total || 0,
    }
    hasLoadedCvs.value = true
  } catch (error) {
    cvsError.value = error.data?.message || error.message || 'No fue posible cargar los CVs.'
  } finally {
    isLoadingCvs.value = false
  }
}

async function fetchPortfolios(page = 1) {
  const token = authStore.session?.token
  if (!token) {
    portfoliosError.value = 'Tu sesión no es válida. Vuelve a iniciar sesión.'
    return
  }

  isLoadingPortfolios.value = true
  portfoliosError.value = ''
  try {
    const response = await $fetch(getApiUrl(`/v1/admin/portfolios?per_page=20&page=${page}`), {
      headers: { Accept: 'application/json', Authorization: ['Bearer', token].join(' ') },
    })
    if (!response?.success) throw new Error(response?.message || 'No fue posible cargar los portafolios.')

    const data = response.data || {}
    adminPortfolios.value = (data.portfolios || []).map(normalizeAdminPortfolio)
    portfoliosMeta.value = {
      currentPage: data.meta?.current_page || 1,
      lastPage: data.meta?.last_page || 1,
      perPage: data.meta?.per_page || 20,
      total: data.meta?.total || 0,
    }
    hasLoadedPortfolios.value = true
  } catch (error) {
    portfoliosError.value = error.data?.message || error.message || 'No fue posible cargar los portafolios.'
  } finally {
    isLoadingPortfolios.value = false
  }
}

async function fetchDonations(page = 1) {
  const token = authStore.session?.token
  if (!token) {
    donationsError.value = 'Tu sesión no es válida. Vuelve a iniciar sesión.'
    return
  }

  isLoadingDonations.value = true
  donationsError.value = ''
  try {
    const response = await $fetch(getApiUrl(`/v1/admin/donations?per_page=20&page=${page}`), {
      headers: { Accept: 'application/json', Authorization: ['Bearer', token].join(' ') },
    })
    if (!response?.success) throw new Error(response?.message || 'No fue posible cargar las donaciones.')

    const data = response.data || {}
    donations.value = data.donations || []
    donationsSummary.value = data.summary || donationsSummary.value
    donationsMeta.value = {
      currentPage: data.meta?.current_page || 1,
      lastPage: data.meta?.last_page || 1,
      perPage: data.meta?.per_page || 20,
      total: data.meta?.total || 0,
    }
    hasLoadedDonations.value = true
  } catch (error) {
    donationsError.value = error.data?.message || error.message || 'No fue posible cargar las donaciones.'
  } finally {
    isLoadingDonations.value = false
  }
}

async function fetchPortfolioReport() {
  const portfolioId = selectedItem.value?.id
  const token = authStore.session?.token
  if (!portfolioId || !token) return

  isLoadingPortfolioReport.value = true
  portfolioReportError.value = ''
  try {
    const parameters = new URLSearchParams()
    if (portfolioReportFrom.value) parameters.set('from', portfolioReportFrom.value)
    if (portfolioReportTo.value) parameters.set('to', portfolioReportTo.value)
    const suffix = parameters.size ? `?${parameters}` : ''
    const response = await $fetch(getApiUrl(`/v1/portfolios/${portfolioId}/view-report${suffix}`), {
      headers: { Accept: 'application/json', Authorization: ['Bearer', token].join(' ') },
    })
    if (!response?.success) throw new Error(response?.message || 'No fue posible cargar las visualizaciones.')
    portfolioReport.value = response.data?.report || null
  } catch (error) {
    portfolioReportError.value = error.data?.message || error.message || 'No fue posible cargar las visualizaciones.'
  } finally {
    isLoadingPortfolioReport.value = false
  }
}

function selectTab(tab) {
  activeTab.value = tab
  searchQuery.value = ''
  if (tab === 'users' && !hasLoadedUsers.value) fetchUsers()
  if (tab === 'cvs' && !hasLoadedCvs.value) fetchCvs()
  if (tab === 'portfolios' && !hasLoadedPortfolios.value) fetchPortfolios()
  if (tab === 'donations' && !hasLoadedDonations.value) fetchDonations()
}

function openAdminCv(cv) {
  selectedUser.value = { name: cv.user?.name || cv.full_name || 'Usuario', email: cv.user?.email || cv.email || '', cvItems: [cv], portfolioItems: [] }
  selectedContentType.value = 'cvs'
  selectedItem.value = cv
}

function openAdminPortfolio(portfolio) {
  selectedUser.value = { name: portfolio.user?.name || portfolio.owner || 'Usuario', email: portfolio.user?.email || '', cvItems: [], portfolioItems: [portfolio] }
  selectedContentType.value = 'portfolios'
  selectedItem.value = portfolio
  portfolioViewport.value = 'desktop'
  portfolioReportFrom.value = ''
  portfolioReportTo.value = ''
  fetchPortfolioReport()
}
</script>

<template>
  <div class="admin-page min-h-screen bg-stone-50 text-stone-950">
    <WorkspaceNav />
    <main class="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <nav class="sticky top-16 z-30 -mx-4 border-y border-stone-200 bg-stone-50/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" aria-label="Secciones de administración">
        <div class="flex min-w-0 gap-1 overflow-x-auto">
          <button v-for="tab in tabs" :key="tab.id" class="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" :class="activeTab === tab.id ? 'bg-emerald-900 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-200 hover:text-stone-950'" type="button" :aria-current="activeTab === tab.id ? 'page' : undefined" @click="selectTab(tab.id)"><component :is="tab.icon" :size="17" />{{ tab.label }}</button>
        </div>
      </nav>

      <div class="flex flex-col gap-4 border-b border-stone-200 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800"><ShieldCheck :size="16" /> Administración</p>
          <h1 class="mt-1 text-2xl font-black tracking-normal text-stone-950 sm:text-3xl">{{ activeTab === 'dashboard' ? 'Vista general' : tabs.find((tab) => tab.id === activeTab)?.label }}</h1>
          <p class="mt-1 max-w-xl text-sm leading-6 text-stone-600">{{ activeTab === 'dashboard' ? 'Supervisa usuarios y el contenido que crean dentro de adaptaCV.' : `Gestiona los ${tabs.find((tab) => tab.id === activeTab)?.label.toLocaleLowerCase('es')} de la plataforma.` }}</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-900"><ShieldCheck :size="15" /> Superadministrador</span>
      </div>

      <p v-if="activeTab === 'dashboard' && dashboardError" class="mt-5 border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{{ dashboardError }}</p>
      <div v-else-if="activeTab === 'dashboard' && isLoadingDashboard && !dashboard" class="mt-5 grid min-h-80 place-items-center border border-stone-200 bg-white text-sm font-semibold text-stone-500">Cargando dashboard...</div>
      <template v-else-if="activeTab === 'dashboard' && dashboard">
      <section class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de plataforma">
        <article class="border border-stone-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-4"><div><p class="text-sm font-bold text-stone-600">Usuarios registrados</p><p class="mt-1 text-3xl font-black text-stone-950">{{ dashboard.summary.users }}</p><p class="mt-1 text-xs font-bold text-emerald-700">{{ dashboard.summary.users_this_month }} este mes</p></div><span class="grid h-10 w-10 place-items-center rounded-md bg-emerald-50 text-emerald-800"><Users :size="20" /></span></div>
        </article>
        <article class="border border-stone-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-4"><div><p class="text-sm font-bold text-stone-600">CVs creados</p><p class="mt-1 text-3xl font-black text-stone-950">{{ dashboard.summary.cvs }}</p><p class="mt-1 text-xs font-bold text-stone-500">Contenido creado</p></div><span class="grid h-10 w-10 place-items-center rounded-md bg-coral-50 text-coral-600"><FileText :size="20" /></span></div>
        </article>
        <article class="border border-stone-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-4"><div><p class="text-sm font-bold text-stone-600">Portafolios publicados</p><p class="mt-1 text-3xl font-black text-stone-950">{{ dashboard.summary.published_portfolios }}</p><p class="mt-1 text-xs font-bold text-stone-500">{{ dashboard.content.draft_portfolios }} borradores</p></div><span class="grid h-10 w-10 place-items-center rounded-md bg-stone-100 text-stone-700"><FolderKanban :size="20" /></span></div>
        </article>
        <article class="border border-stone-200 bg-white p-4 shadow-sm"><div class="flex items-start justify-between gap-4"><div><p class="text-sm font-bold text-stone-600">Vistas últimos {{ dashboard.period.days }} días</p><p class="mt-1 text-3xl font-black text-stone-950">{{ dashboard.summary.views }}</p><p class="mt-1 text-xs font-bold text-stone-500">{{ dashboard.summary.unique_visitors }} visitantes únicos</p></div><span class="grid h-10 w-10 place-items-center rounded-md bg-sky-50 text-sky-700"><Eye :size="20" /></span></div></article>
      </section>

      <section class="mt-3 border border-stone-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Mapa de visitas global">
        <div><h2 class="font-black text-stone-950">Audiencia global</h2><p class="mt-1 text-sm text-stone-600">Visitas registradas por país durante los últimos {{ dashboard.period.days }} días.</p></div>
        <PortfolioGeoMap :report="dashboardMapReport" :is-loading="isLoadingDashboard" :selected-code="''" @refresh="refreshDashboard" />
      </section>

      <section class="mt-3 grid gap-3 lg:grid-cols-[1.45fr_1fr]" aria-label="Analítica de plataforma">
        <article class="min-w-0 border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div><h2 class="font-black text-stone-950">Crecimiento mensual</h2><p class="mt-1 text-sm text-stone-600">Usuarios y CVs creados en los últimos seis meses.</p></div>
            <div class="flex items-center gap-3 text-xs font-bold text-stone-600"><span class="inline-flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-sm bg-emerald-700"></i>Usuarios</span><span class="inline-flex items-center gap-1.5"><i class="h-2.5 w-2.5 rounded-sm bg-coral-500"></i>CVs</span></div>
          </div>
          <div class="mt-5 grid h-40 grid-cols-6 gap-3 border-b border-stone-200 px-1 sm:gap-5">
            <div v-for="month in dashboardMonthlyActivity" :key="month.month" class="flex min-w-0 items-end justify-center gap-1.5"><span class="w-full max-w-5 rounded-t-sm bg-emerald-700 transition" :style="{ height: `${Math.max(month.users * 8, 3)}%` }" :aria-label="`${month.users} nuevos usuarios en ${month.label}`"></span><span class="w-full max-w-5 rounded-t-sm bg-coral-500 transition" :style="{ height: `${Math.max(month.cvs * 8, 3)}%` }" :aria-label="`${month.cvs} CVs creados en ${month.label}`"></span></div>
          </div>
          <div class="mt-2 grid grid-cols-6 gap-3 px-1 text-center text-xs font-bold text-stone-500 sm:gap-5"><span v-for="month in dashboardMonthlyActivity" :key="month.month">{{ month.label }}</span></div>
        </article>

        <article class="border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 class="font-black text-stone-950">Actividad reciente</h2><p class="mt-1 text-sm text-stone-600">Vistas diarias de portafolios públicos.</p><div class="mt-5 flex h-32 items-end gap-1 border-b border-stone-200"><span v-for="day in dashboard.daily" :key="day.date" class="min-w-1 flex-1 rounded-t-sm bg-sky-600" :style="{ height: `${Math.max((day.views / dashboardMaxDailyViews) * 100, 2)}%` }" :title="`${day.date}: ${day.views} vistas`"></span></div><div class="mt-3 flex items-center justify-between text-xs font-bold text-stone-500"><span>{{ dashboard.period.from }}</span><span>{{ dashboard.period.to }}</span></div>
        </article>
      </section>
      </template>

      <section v-else class="mt-5 overflow-hidden border border-stone-200 bg-white shadow-sm">
        <div class="flex flex-col gap-4 border-b border-stone-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <p class="text-sm font-extrabold text-stone-800">{{ tabs.find((tab) => tab.id === activeTab)?.label }}</p>
          <label class="relative block w-full lg:w-72"><span class="sr-only">Buscar</span><Search class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" :size="17" /><input v-model="searchQuery" class="w-full rounded-md border border-stone-300 bg-stone-50 py-2.5 pl-10 pr-3 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15" :placeholder="`Buscar ${tabs.find((tab) => tab.id === activeTab)?.label.toLocaleLowerCase('es')}`" /></label>
        </div>

        <p v-if="activeTab === 'users' && usersError" class="m-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{{ usersError }}</p>
        <div v-else-if="activeTab === 'users' && isLoadingUsers" class="grid min-h-72 place-items-center px-5 text-sm font-semibold text-stone-500">Cargando usuarios...</div>
        <p v-else-if="activeTab === 'cvs' && cvsError" class="m-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{{ cvsError }}</p>
        <div v-else-if="activeTab === 'cvs' && isLoadingCvs" class="grid min-h-72 place-items-center px-5 text-sm font-semibold text-stone-500">Cargando CVs...</div>
        <p v-else-if="activeTab === 'portfolios' && portfoliosError" class="m-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{{ portfoliosError }}</p>
        <div v-else-if="activeTab === 'portfolios' && isLoadingPortfolios" class="grid min-h-72 place-items-center px-5 text-sm font-semibold text-stone-500">Cargando portafolios...</div>
        <p v-else-if="activeTab === 'donations' && donationsError" class="m-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{{ donationsError }}</p>
        <div v-else-if="activeTab === 'donations' && isLoadingDonations" class="grid min-h-72 place-items-center px-5 text-sm font-semibold text-stone-500">Cargando donaciones...</div>

        <div v-else class="overflow-x-auto">
          <table v-if="activeTab === 'users'" class="min-w-full text-left">
            <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.1em] text-stone-500"><tr><th class="px-5 py-3.5 font-extrabold">Usuario</th><th class="px-5 py-3.5 font-extrabold">País</th><th class="px-5 py-3.5 text-center font-extrabold">CVs</th><th class="px-5 py-3.5 text-center font-extrabold">Portafolios</th><th class="px-5 py-3.5 font-extrabold">Registro</th><th class="px-5 py-3.5 font-extrabold">Estado</th></tr></thead>
            <tbody class="divide-y divide-stone-200"><tr v-for="user in filteredItems" :key="user.id" class="transition hover:bg-stone-50/70"><td class="px-5 py-4"><div class="flex items-center gap-3"><span class="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-900">{{ user.initials }}</span><span><span class="block text-sm font-extrabold text-stone-900">{{ user.name }}</span><span class="mt-0.5 block text-xs font-medium text-stone-500">{{ user.email }}</span></span></div></td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ user.country }}</td><td class="px-5 py-4 text-center"><button class="group inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-extrabold text-emerald-800 shadow-sm transition hover:-translate-y-px hover:border-emerald-600 hover:bg-emerald-100 hover:text-emerald-950 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 active:translate-y-0" type="button" :aria-label="`Ver ${user.cvs} CVs de ${user.name}`" :title="`Previsualizar CVs de ${user.name}`" @click="openUserContent(user, 'cvs')"><span>{{ user.cvs }}</span><Eye :size="14" class="opacity-60 transition group-hover:opacity-100" /></button></td><td class="px-5 py-4 text-center"><button class="group inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-extrabold text-emerald-800 shadow-sm transition hover:-translate-y-px hover:border-emerald-600 hover:bg-emerald-100 hover:text-emerald-950 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 active:translate-y-0" type="button" :aria-label="`Ver ${user.portfolios} portafolios de ${user.name}`" :title="`Previsualizar portafolios de ${user.name}`" @click="openUserContent(user, 'portfolios')"><span>{{ user.portfolios }}</span><Eye :size="14" class="opacity-60 transition group-hover:opacity-100" /></button></td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ user.joinedAt }}</td><td class="px-5 py-4"><span class="inline-flex rounded-md px-2 py-1 text-xs font-extrabold" :class="user.status === 'Verificado' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'">{{ user.status }}</span></td></tr></tbody>
          </table>

          <table v-else-if="activeTab === 'cvs'" class="min-w-full text-left">
            <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.1em] text-stone-500"><tr><th class="px-5 py-3.5 font-extrabold">CV</th><th class="px-5 py-3.5 font-extrabold">Propietario</th><th class="px-5 py-3.5 font-extrabold">País</th><th class="px-5 py-3.5 font-extrabold">Actualización</th><th class="px-5 py-3.5 font-extrabold">Estado</th></tr></thead>
            <tbody class="divide-y divide-stone-200"><tr v-for="cv in filteredItems" :key="cv.id" class="cursor-pointer transition hover:bg-emerald-50/50" tabindex="0" @click="openAdminCv(cv)" @keydown.enter="openAdminCv(cv)" @keydown.space.prevent="openAdminCv(cv)"><td class="px-5 py-4"><span class="inline-flex items-center gap-2 text-sm font-extrabold text-stone-900"><FileText :size="17" class="text-coral-600" />{{ cv.title }}<Eye :size="15" class="text-emerald-700" /></span></td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ cv.owner }}</td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ cv.country }}</td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ cv.updatedAt }}</td><td class="px-5 py-4"><span class="inline-flex rounded-md px-2 py-1 text-xs font-extrabold" :class="cv.status === 'Completo' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'">{{ cv.status }}</span></td></tr></tbody>
          </table>

          <table v-else-if="activeTab === 'portfolios'" class="min-w-full text-left">
            <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.1em] text-stone-500"><tr><th class="px-5 py-3.5 font-extrabold">Portafolio</th><th class="px-5 py-3.5 font-extrabold">Propietario</th><th class="px-5 py-3.5 font-extrabold">Plantilla</th><th class="px-5 py-3.5 font-extrabold">Actualización</th><th class="px-5 py-3.5 font-extrabold">Visibilidad</th></tr></thead>
            <tbody class="divide-y divide-stone-200"><tr v-for="portfolio in filteredItems" :key="portfolio.id" class="cursor-pointer transition hover:bg-emerald-50/50" tabindex="0" @click="openAdminPortfolio(portfolio)" @keydown.enter="openAdminPortfolio(portfolio)" @keydown.space.prevent="openAdminPortfolio(portfolio)"><td class="px-5 py-4"><span class="inline-flex items-center gap-2 text-sm font-extrabold text-stone-900"><FolderKanban :size="17" class="text-emerald-700" />{{ portfolio.title }}<Eye :size="15" class="text-emerald-700" /></span></td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ portfolio.owner }}</td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ portfolio.template }}</td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ portfolio.updatedAt }}</td><td class="px-5 py-4"><span class="inline-flex rounded-md px-2 py-1 text-xs font-extrabold" :class="portfolio.visibility === 'public' ? 'bg-emerald-50 text-emerald-800' : 'bg-stone-100 text-stone-600'">{{ portfolio.visibility === 'public' ? 'Público' : 'Privado' }}</span></td></tr></tbody>
          </table>
          <table v-else class="min-w-full text-left">
            <caption class="caption-top px-5 py-4 text-left text-sm font-bold text-emerald-900">Aportes confirmados: {{ donationsSummary.completed_count }} · Total: {{ new Intl.NumberFormat('es-CL', { style: 'currency', currency: donationsSummary.currency }).format(Number(donationsSummary.completed_total)) }}</caption>
            <thead class="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.1em] text-stone-500"><tr><th class="px-5 py-3.5 font-extrabold">Monto</th><th class="px-5 py-3.5 font-extrabold">Donante</th><th class="px-5 py-3.5 font-extrabold">Fecha</th><th class="px-5 py-3.5 font-extrabold">Estado</th><th class="px-5 py-3.5 font-extrabold">Referencia PayPal</th></tr></thead>
            <tbody class="divide-y divide-stone-200"><tr v-for="donation in filteredItems" :key="donation.id" class="transition hover:bg-stone-50/70"><td class="px-5 py-4 text-sm font-extrabold text-stone-900">{{ new Intl.NumberFormat('es-CL', { style: 'currency', currency: donation.currency }).format(Number(donation.amount)) }}</td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ donation.payer_name || donation.payer_email || 'Donación anónima' }}<span v-if="donation.payer_name && donation.payer_email" class="mt-0.5 block text-xs font-medium text-stone-500">{{ donation.payer_email }}</span></td><td class="px-5 py-4 text-sm font-semibold text-stone-600">{{ formatDate(donation.completed_at || donation.created_at) }}</td><td class="px-5 py-4"><span class="inline-flex rounded-md px-2 py-1 text-xs font-extrabold" :class="donation.status === 'completed' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'">{{ donation.status === 'completed' ? 'Confirmada' : 'Pendiente' }}</span></td><td class="px-5 py-4 font-mono text-xs text-stone-500">{{ donation.paypal_capture_id || donation.paypal_order_id }}</td></tr></tbody>
          </table>
        </div>
        <div v-if="!isLoadingUsers && !usersError && !isLoadingCvs && !cvsError && !isLoadingPortfolios && !portfoliosError && !isLoadingDonations && !donationsError && filteredItems.length === 0" class="px-5 py-12 text-center text-sm font-semibold text-stone-500">No hay resultados para esta búsqueda.</div>
        <footer v-if="activeTab === 'users' && !isLoadingUsers && !usersError" class="flex items-center justify-between border-t border-stone-200 px-5 py-3.5"><p class="text-xs font-semibold text-stone-500">Mostrando {{ filteredItems.length }} de {{ usersMeta.total }} usuarios</p><div class="flex gap-1"><button class="grid h-8 w-8 place-items-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400" type="button" aria-label="Página anterior" :disabled="usersMeta.currentPage <= 1" @click="fetchUsers(usersMeta.currentPage - 1)"><ChevronLeft :size="16" /></button><button class="grid h-8 w-8 place-items-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400" type="button" aria-label="Página siguiente" :disabled="usersMeta.currentPage >= usersMeta.lastPage" @click="fetchUsers(usersMeta.currentPage + 1)"><ChevronRight :size="16" /></button></div></footer>
        <footer v-else-if="activeTab === 'cvs' && !isLoadingCvs && !cvsError" class="flex items-center justify-between border-t border-stone-200 px-5 py-3.5"><p class="text-xs font-semibold text-stone-500">Mostrando {{ filteredItems.length }} de {{ cvsMeta.total }} CVs</p><div class="flex gap-1"><button class="grid h-8 w-8 place-items-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400" type="button" aria-label="Página anterior" :disabled="cvsMeta.currentPage <= 1" @click="fetchCvs(cvsMeta.currentPage - 1)"><ChevronLeft :size="16" /></button><button class="grid h-8 w-8 place-items-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400" type="button" aria-label="Página siguiente" :disabled="cvsMeta.currentPage >= cvsMeta.lastPage" @click="fetchCvs(cvsMeta.currentPage + 1)"><ChevronRight :size="16" /></button></div></footer>
        <footer v-else-if="activeTab === 'portfolios' && !isLoadingPortfolios && !portfoliosError" class="flex items-center justify-between border-t border-stone-200 px-5 py-3.5"><p class="text-xs font-semibold text-stone-500">Mostrando {{ filteredItems.length }} de {{ portfoliosMeta.total }} portafolios</p><div class="flex gap-1"><button class="grid h-8 w-8 place-items-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400" type="button" aria-label="Página anterior" :disabled="portfoliosMeta.currentPage <= 1" @click="fetchPortfolios(portfoliosMeta.currentPage - 1)"><ChevronLeft :size="16" /></button><button class="grid h-8 w-8 place-items-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400" type="button" aria-label="Página siguiente" :disabled="portfoliosMeta.currentPage >= portfoliosMeta.lastPage" @click="fetchPortfolios(portfoliosMeta.currentPage + 1)"><ChevronRight :size="16" /></button></div></footer>
        <footer v-else-if="activeTab === 'donations' && !isLoadingDonations && !donationsError" class="flex items-center justify-between border-t border-stone-200 px-5 py-3.5"><p class="text-xs font-semibold text-stone-500">Mostrando {{ filteredItems.length }} de {{ donationsMeta.total }} donaciones</p><div class="flex gap-1"><button class="grid h-8 w-8 place-items-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400" type="button" aria-label="Página anterior" :disabled="donationsMeta.currentPage <= 1" @click="fetchDonations(donationsMeta.currentPage - 1)"><ChevronLeft :size="16" /></button><button class="grid h-8 w-8 place-items-center rounded-md border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:text-stone-400" type="button" aria-label="Página siguiente" :disabled="donationsMeta.currentPage >= donationsMeta.lastPage" @click="fetchDonations(donationsMeta.currentPage + 1)"><ChevronRight :size="16" /></button></div></footer>
      </section>
    </main>

    <div v-if="selectedUser" class="fixed inset-0 z-[70] grid place-items-center bg-stone-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" :aria-labelledby="'user-content-title'" @click.self="closeUserContent">
      <section class="flex h-[min(760px,calc(100vh-2rem))] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
        <header class="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 sm:px-6">
          <div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">{{ selectedUser.name }}</p><h2 id="user-content-title" class="mt-1 text-xl font-black text-stone-950">{{ selectedContentLabel }} del usuario</h2></div>
          <button class="grid h-9 w-9 shrink-0 place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" type="button" aria-label="Cerrar" title="Cerrar" @click="closeUserContent"><X :size="20" /></button>
        </header>
        <div v-if="selectedItems.length" class="grid min-h-0 flex-1 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <aside class="overflow-y-auto border-b border-stone-200 bg-stone-50 p-3 lg:border-b-0 lg:border-r">
            <p class="px-2 pb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-stone-500">Selecciona para previsualizar</p>
            <div class="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-x-visible">
              <button v-for="item in selectedItems" :key="item.id" class="min-w-44 rounded-md border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 lg:min-w-0" :class="selectedItem?.id === item.id ? 'border-emerald-700 bg-emerald-50 text-emerald-950 shadow-sm' : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-400 hover:bg-emerald-50/50'" type="button" @click="selectContentItem(item)"><span class="flex items-start gap-2"><span class="grid h-8 w-8 shrink-0 place-items-center rounded-md" :class="selectedContentType === 'cvs' ? 'bg-emerald-100 text-emerald-900' : 'bg-coral-50 text-coral-600'"><FileText v-if="selectedContentType === 'cvs'" :size="16" /><FolderKanban v-else :size="16" /></span><span class="min-w-0"><strong class="block truncate text-sm">{{ item.name }}</strong><span class="mt-1 block truncate text-xs font-semibold opacity-70">{{ selectedContentType === 'cvs' ? item.role || item.full_name : item.template_id || item.status }}</span></span></span></button>
            </div>
          </aside>
          <div class="min-h-0 overflow-y-auto bg-stone-100 p-4 sm:p-6">
            <div v-if="selectedContentType === 'cvs' && selectedCvPreview" class="mx-auto w-full max-w-[794px]"><CvPreview :cv="selectedCvPreview" :country-config="adminCvPreviewConfig" :show-photo="false" :qualification-levels="[]" :immigration-statuses="[]" paper-mode /></div>
            <div v-else-if="selectedItem?.slug" class="flex h-full min-h-[420px] flex-col">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-3"><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-stone-500">Vista previa responsive</p><div class="inline-flex rounded-md border border-stone-300 bg-white p-1 shadow-sm"><button class="grid h-8 w-8 place-items-center rounded-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" :class="portfolioViewport === 'desktop' ? 'bg-emerald-900 text-white' : 'text-stone-600 hover:bg-stone-100'" type="button" aria-label="Vista de escritorio" title="Vista de escritorio" @click="portfolioViewport = 'desktop'"><Monitor :size="16" /></button><button class="grid h-8 w-8 place-items-center rounded-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700" :class="portfolioViewport === 'mobile' ? 'bg-emerald-900 text-white' : 'text-stone-600 hover:bg-stone-100'" type="button" aria-label="Vista móvil" title="Vista móvil" @click="portfolioViewport = 'mobile'"><Smartphone :size="16" /></button></div></div>
              <div ref="portfolioPreviewViewport" class="flex min-h-0 flex-1 items-start justify-center overflow-auto rounded-lg border border-stone-300 bg-stone-200 p-4 sm:p-6"><div class="shrink-0" :style="portfolioPreviewStageStyle"><div class="overflow-hidden rounded-md border border-stone-400 bg-white shadow-xl" :style="portfolioPreviewFrameStyle"><div class="flex h-8 items-center gap-1.5 border-b border-stone-200 bg-stone-50 px-3"><i class="h-2 w-2 rounded-full bg-coral-500"></i><i class="h-2 w-2 rounded-full bg-amber-400"></i><i class="h-2 w-2 rounded-full bg-emerald-500"></i><span class="ml-2 truncate text-[10px] font-bold text-stone-500">/p/{{ selectedItem.slug }}</span></div><iframe :src="`/p/${selectedItem.slug}`" :title="`Previsualización de ${selectedItem.name}`" class="block h-[calc(100%-2rem)] w-full border-0 bg-white"></iframe></div></div></div>
              <section class="mt-4 border border-stone-200 bg-white p-4 shadow-sm sm:p-5" aria-label="Visualizaciones del portafolio">
                <div class="flex flex-col gap-3 border-b border-stone-200 pb-4 lg:flex-row lg:items-center lg:justify-between"><div><p class="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800"><BarChart3 :size="15" /> Visualizaciones</p><h3 class="mt-1 font-black text-stone-950">Rendimiento del portafolio</h3></div><form class="flex flex-wrap items-end gap-2" @submit.prevent="fetchPortfolioReport"><label class="text-xs font-bold text-stone-600">Desde<input v-model="portfolioReportFrom" class="mt-1 block h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-800 outline-none focus:border-emerald-700" type="date" /></label><label class="text-xs font-bold text-stone-600">Hasta<input v-model="portfolioReportTo" class="mt-1 block h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-800 outline-none focus:border-emerald-700" type="date" /></label><button class="h-9 rounded-md bg-emerald-900 px-3 text-xs font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-70" type="submit" :disabled="isLoadingPortfolioReport">Aplicar</button></form></div>
                <p v-if="portfolioReportError" class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{{ portfolioReportError }}</p>
                <div v-else-if="isLoadingPortfolioReport" class="grid min-h-36 place-items-center text-sm font-semibold text-stone-500">Cargando visualizaciones...</div>
                <template v-else-if="portfolioReport"><div class="mt-4 grid gap-3 sm:grid-cols-2"><div class="border border-emerald-200 bg-emerald-50 p-3"><p class="text-xs font-bold text-emerald-800">Visualizaciones totales</p><p class="mt-1 text-2xl font-black text-emerald-950">{{ portfolioReport.summary?.total_views || 0 }}</p></div><div class="border border-stone-200 bg-stone-50 p-3"><p class="text-xs font-bold text-stone-600">Visitantes únicos</p><p class="mt-1 text-2xl font-black text-stone-950">{{ portfolioReport.summary?.unique_visitors || 0 }}</p></div></div><div class="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-stone-500">Vistas por día</p><div v-if="portfolioReport.daily?.length" class="mt-3 flex h-32 items-end gap-2 border-b border-stone-200 pb-0"><div v-for="day in portfolioReport.daily" :key="day.date" class="flex min-w-8 flex-1 flex-col justify-end"><span class="rounded-t-sm bg-emerald-700 transition" :style="{ height: `${Math.max((day.views / portfolioReportMaxViews) * 100, 4)}%` }" :aria-label="`${day.views} vistas el ${day.date}`"></span><span class="mt-2 truncate text-center text-[10px] font-bold text-stone-500">{{ day.date.slice(5) }}</span></div></div><p v-else class="mt-3 text-sm font-semibold text-stone-500">No hay visualizaciones para este período.</p></div><div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-stone-500">Principales fuentes</p><div v-if="portfolioReport.referrers?.length" class="mt-3 space-y-2"><div v-for="referrer in portfolioReport.referrers.slice(0, 4)" :key="referrer.referrer_host || 'direct'" class="flex items-center justify-between gap-3 border-b border-stone-100 pb-2 text-sm"><span class="truncate font-semibold text-stone-700">{{ referrer.referrer_host || 'Directo' }}</span><span class="shrink-0 font-extrabold text-emerald-800">{{ referrer.views }}</span></div></div><p v-else class="mt-3 text-sm font-semibold text-stone-500">No hay fuentes registradas.</p></div></div></template>
              </section>
            </div>
            <article v-else-if="selectedItem" class="mx-auto max-w-2xl overflow-hidden border border-stone-200 bg-white shadow-sm"><img v-if="selectedItem.cover_image_url" :src="selectedItem.cover_image_url" :alt="selectedItem.name" class="aspect-video w-full object-cover" /><div class="p-6"><div class="flex items-start gap-3"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-coral-50 text-coral-600"><FolderKanban :size="20" /></span><div><h3 class="text-xl font-black text-stone-950">{{ selectedItem.name }}</h3><p class="mt-1 text-sm font-semibold text-stone-600">{{ selectedItem.template_id || 'Sin plantilla' }}</p></div></div><div class="mt-5 flex flex-wrap gap-2"><span class="rounded-md bg-emerald-50 px-2 py-1 text-xs font-extrabold text-emerald-800">{{ selectedItem.status }}</span><span class="rounded-md bg-stone-200 px-2 py-1 text-xs font-extrabold text-stone-700">{{ selectedItem.visibility }}</span></div></div></article>
          </div>
        </div>
        <div v-else class="grid flex-1 place-items-center p-6 text-center"><div><span class="mx-auto grid h-11 w-11 place-items-center rounded-md bg-stone-100 text-stone-500"><FileText v-if="selectedContentType === 'cvs'" :size="20" /><FolderKanban v-else :size="20" /></span><p class="mt-3 text-sm font-semibold text-stone-600">Este usuario no tiene {{ selectedContentLabel.toLocaleLowerCase('es') }} todavía.</p></div></div>
      </section>
    </div>
  </div>
</template>