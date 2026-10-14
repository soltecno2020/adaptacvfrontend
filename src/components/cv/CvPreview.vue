<script setup>
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '../../stores/localeStore'
import { dateLocales } from '../../config/locales'

defineProps({
  cv: {
    type: Object,
    required: true,
  },
  countryConfig: {
    type: Object,
    required: true,
  },
  showPhoto: {
    type: Boolean,
    required: true,
  },
  profilePhotoUrl: {
    type: String,
    default: '',
  },
  qualificationLevels: {
    type: Array,
    default: () => [],
  },
  immigrationStatuses: {
    type: Array,
    default: () => [],
  },
  paperMode: {
    type: Boolean,
    default: false,
  },
})

const localeStore = useLocaleStore()
const { translations: copy } = storeToRefs(localeStore)

function findLabel(options, value) {
  const option = options.find((item) => String(item.id ?? item.value) === String(value))
  return option?.name ?? option?.label ?? value
}

function formatExperiencePeriod(startDate, endDate) {
  if (!startDate || !endDate) return ''
  const formatter = new Intl.DateTimeFormat(dateLocales[localeStore.locale] || dateLocales.es, { month: 'short', year: 'numeric' })
  const formatDate = (date) => formatter.format(new Date(`${date}T12:00:00`)).replace('.', '')
  return `${formatDate(startDate)} - ${formatDate(endDate)}`
}
</script>

<template>
  <article class="min-h-[1123px] rounded-lg border border-stone-300 bg-white p-8 shadow-xl shadow-stone-200/70" :class="paperMode ? 'cv-paper' : ''">
    <header class="relative flex flex-col items-center border-b border-stone-200 pb-6 text-center">
      <div
        v-if="showPhoto && profilePhotoUrl"
        class="absolute right-0 top-0 h-24 w-24 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100"
      >
        <img :src="profilePhotoUrl" :alt="cv.profile.fullName" class="h-full w-full object-cover" />
      </div>
      <div class="min-w-0" :class="showPhoto && profilePhotoUrl ? 'pr-28' : ''">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">{{ countryConfig.marketLabel }}</p>
        <h2 class="mt-2 text-3xl font-black tracking-normal text-stone-950">{{ cv.profile.fullName }}</h2>
        <p class="mt-1 text-lg font-semibold text-stone-700">{{ cv.profile.role }}</p>
        <p class="mt-3 text-sm leading-6 text-stone-600">
          {{ cv.profile.city }}, {{ cv.profile.country }} · {{ cv.profile.email }} · {{ cv.profile.phone }}
        </p>
        <p class="mt-1 break-all text-sm font-semibold text-emerald-800">{{ cv.profile.linkedIn }}</p>
        <p v-if="cv.migration.includeMigration && (cv.migration.visaStatus || cv.migration.workAvailability)" class="mt-2 text-sm font-semibold text-stone-700">{{ [findLabel(immigrationStatuses, cv.migration.visaStatus), cv.migration.workAvailability].filter(Boolean).join(' · ') }}</p>
      </div>
    </header>

    <section class="border-b border-stone-200 py-6">
      <h3 class="text-sm font-black uppercase tracking-[0.18em] text-stone-500">{{ copy.cvPreview.profile }}</h3>
      <p class="mt-3 leading-7 text-stone-700">{{ cv.profile.professionalSummary }}</p>
    </section>

    <section class="border-b border-stone-200 py-6">
      <h3 class="text-sm font-black uppercase tracking-[0.18em] text-stone-500">{{ copy.cvPreview.education }}</h3>
      <div v-for="education in cv.educations" :key="`${education.credential}-${education.institution}`" class="mt-3 first:mt-2">
        <p class="font-bold text-stone-900">{{ education.credential }}</p>
        <p class="mt-1 text-sm text-stone-600">{{ education.institution }} · {{ education.startYear }} - {{ education.endYear }}</p>
        <p class="mt-1 text-sm text-stone-600">{{ findLabel(qualificationLevels, education.localLevel) }}</p>
      </div>
    </section>

    <section class="border-b border-stone-200 py-6">
      <h3 class="text-sm font-black uppercase tracking-[0.18em] text-stone-500">{{ copy.cvPreview.experience }}</h3>
      <div v-for="item in cv.experience" :key="`${item.company}-${item.period}`" class="mt-4">
        <div class="cv-experience-heading flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h4 class="font-extrabold text-stone-950">{{ item.role }} · {{ item.company }}</h4>
          <p class="text-sm font-semibold text-stone-500">{{ formatExperiencePeriod(item.startDate, item.endDate) || item.period }}</p>
        </div>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-stone-700">{{ item.summary }}</p>
      </div>
    </section>

    <section class="py-6">
      <h3 class="text-sm font-black uppercase tracking-[0.18em] text-stone-500">{{ copy.cvPreview.skills }}</h3>
      <div class="mt-3 flex flex-wrap gap-2">
        <span v-for="skill in cv.skills" :key="skill" class="rounded-md bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-900">
          {{ skill }}
        </span>
      </div>
    </section>

    <section v-if="cv.employmentRecommendations?.length" class="border-t border-stone-200 py-6">
      <h3 class="text-sm font-black uppercase tracking-[0.18em] text-stone-500">{{ copy.cvPreview.employmentRecommendations }}</h3>
      <div class="mt-3 space-y-2">
        <a v-for="(recommendation, index) in cv.employmentRecommendations" :key="`${recommendation.id || recommendation.name}-${index}`" :href="recommendation.url" target="_blank" rel="noopener" class="block break-all text-sm font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-950">{{ recommendation.name }}</a>
      </div>
    </section>

    <section class="border-t border-stone-200 py-6">
      <h3 class="text-sm font-black uppercase tracking-[0.18em] text-stone-500">{{ copy.cvPreview.languagesAndInterests }}</h3>
      <p class="mt-3 text-sm leading-6 text-stone-700">{{ cv.languages.join(' · ') }}</p>
      <p class="mt-2 text-sm leading-6 text-stone-600">{{ cv.interests.join(' · ') }}</p>
    </section>
  </article>
</template>

<style scoped>
.cv-paper .cv-experience-heading {
  align-items: baseline;
  flex-direction: row;
  justify-content: space-between;
}
</style>