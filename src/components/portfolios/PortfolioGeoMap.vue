<script setup>
import { computed, ref } from 'vue'
import { LoaderCircle, RefreshCw } from '@lucide/vue'
import worldMap from '@svg-maps/world'

const props = defineProps({
  report: { type: Object, default: null },
  isLoading: Boolean,
  error: { type: String, default: '' },
  selectedCode: { type: String, default: '' },
})

const emit = defineEmits(['select', 'refresh'])
const refreshScrollTop = ref(null)
const countries = computed(() => props.report?.countries || [])
const countriesByCode = computed(() => new Map(countries.value.map((country) => [String(country.country_code || '').toLowerCase(), country])))
const selectedCountry = computed(() => countriesByCode.value.get(props.selectedCode) || null)
const nextRefreshAt = computed(() => {
  const updatedAt = props.report?.updated_at
  const refreshAfter = Number(props.report?.refresh_after_seconds)
  if (!updatedAt || !Number.isFinite(refreshAfter)) return null
  const timestamp = new Date(updatedAt).getTime()
  return Number.isFinite(timestamp) ? new Date(timestamp + refreshAfter * 1000) : null
})

function formatDate(value) {
  if (!value) return 'No disponible'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function selectCountry(countryCode) {
  if (countriesByCode.value.has(countryCode)) emit('select', countryCode)
}

function rememberRefreshScroll(event) {
  event.preventDefault()
  refreshScrollTop.value = window.scrollY
}

function requestRefresh() {
  emit('refresh', refreshScrollTop.value ?? window.scrollY)
  refreshScrollTop.value = null
}
</script>

<template>
  <section class="mt-7 border-t border-stone-200 pt-5" aria-labelledby="portfolio-geo-title">
    <div class="flex flex-wrap items-start justify-between gap-3"><div><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">Audiencia geográfica</p><h3 id="portfolio-geo-title" class="mt-1 text-lg font-black text-stone-950">Mapa de visitas</h3><p v-if="report" class="mt-1 text-xs font-semibold text-stone-500">Actualizado: {{ formatDate(report.updated_at) }}<span v-if="nextRefreshAt"> · Próxima actualización: {{ formatDate(nextRefreshAt) }}</span></p></div><button class="inline-flex h-9 items-center gap-2 rounded-md border border-stone-300 px-3 text-xs font-extrabold text-stone-700 hover:border-emerald-800 hover:text-emerald-800" type="button" :aria-busy="isLoading" @pointerdown="rememberRefreshScroll" @click="requestRefresh"><RefreshCw :size="15" :class="isLoading ? 'animate-spin' : ''" /> Actualizar</button></div>
    <div v-if="isLoading && !report" class="grid min-h-64 place-items-center text-sm font-semibold text-stone-500"><span class="inline-flex items-center gap-2"><LoaderCircle :size="18" class="animate-spin" /> Cargando mapa de visitas...</span></div>
    <p v-else-if="error && !report" class="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{{ error }}</p>
    <div v-else class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem]"><div class="overflow-hidden border border-stone-200 bg-stone-50 p-2 sm:p-4"><svg class="h-auto w-full" :viewBox="worldMap.viewBox" role="img" aria-label="Mapa mundial de visitas"><path v-for="location in worldMap.locations" :key="location.id" :d="location.path" :class="countriesByCode.has(location.id) ? 'cursor-pointer fill-emerald-600 stroke-white stroke-[0.7] transition hover:fill-emerald-800 focus:fill-emerald-800' : 'fill-stone-200 stroke-white stroke-[0.7]'" :tabindex="countriesByCode.has(location.id) ? 0 : undefined" :aria-label="countriesByCode.has(location.id) ? `${countriesByCode.get(location.id).country || countriesByCode.get(location.id).country_code}: ${countriesByCode.get(location.id).views} vistas, ${countriesByCode.get(location.id).users} usuarios` : undefined" @mouseenter="selectCountry(location.id)" @focus="selectCountry(location.id)" @click="selectCountry(location.id)" @keydown.enter.prevent="selectCountry(location.id)" /></svg></div><aside class="border border-stone-200 bg-white p-4"><template v-if="selectedCountry"><p class="text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-800">País seleccionado</p><h4 class="mt-1 font-black text-stone-950">{{ selectedCountry.country || selectedCountry.country_code }}</h4><dl class="mt-4 space-y-3"><div><dt class="text-xs font-bold text-stone-500">Vistas</dt><dd class="text-xl font-black text-stone-950">{{ selectedCountry.views }}</dd></div><div><dt class="text-xs font-bold text-stone-500">Usuarios</dt><dd class="text-xl font-black text-stone-950">{{ selectedCountry.users }}</dd></div></dl></template><p v-else class="text-sm font-semibold leading-6 text-stone-500">Pasa el cursor o selecciona un país resaltado para ver su detalle.</p></aside></div>
    <p v-if="error && report" class="mt-4 border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{{ error }}</p>
    <p v-if="!countries.length && !isLoading && !error" class="mt-4 border border-stone-200 bg-stone-50 p-3 text-sm font-semibold text-stone-600">Aún no hay datos geográficos para este período.</p>
    <div v-if="countries.length" class="mt-4 grid gap-2 sm:grid-cols-2"><button v-for="country in countries" :key="country.country_code" class="flex items-center justify-between gap-3 border px-3 py-2 text-left text-sm transition" :class="selectedCode === String(country.country_code).toLowerCase() ? 'border-emerald-700 bg-emerald-50 text-emerald-950' : 'border-stone-200 text-stone-700 hover:border-emerald-400'" type="button" @click="emit('select', String(country.country_code).toLowerCase())"><span class="truncate font-bold">{{ country.country || country.country_code }}</span><span class="shrink-0 font-extrabold">{{ country.views }} vistas · {{ country.users }} usuarios</span></button></div>
  </section>
</template>