<script setup>
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '../../stores/localeStore'

defineProps({
  label: { type: String, required: true },
})

const localeStore = useLocaleStore()
const { languages, selectedLanguageId } = storeToRefs(localeStore)

function selectLanguage(languageId) {
  localeStore.setLocale(languageId)
}
</script>

<template>
  <select
    :value="selectedLanguageId"
    :aria-label="label"
    class="h-10 rounded-md border border-stone-300 bg-white px-2 text-sm font-bold text-stone-700 outline-none transition hover:border-emerald-700 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15"
    @change="selectLanguage($event.target.value)"
  >
    <option v-for="language in languages" :key="language.id || language.code" :value="language.id">{{ language.name || language.label }}</option>
  </select>
</template>