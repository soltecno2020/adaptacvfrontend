import { computed, onMounted, ref } from 'vue'
import { defineStore } from 'pinia'
import { messages, supportedLocales } from '../config/locales'
import { useAuthStore } from './authStore'

const defaultLocale = 'es'

function getStoredLocale() {
  if (import.meta.server) return defaultLocale

  const storedLocale = localStorage.getItem('adaptacv-locale')
  return supportedLocales.some((locale) => locale.code === storedLocale) ? storedLocale : defaultLocale
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref(getStoredLocale())
  const languages = ref(supportedLocales)
  const selectedLanguageId = ref(null)
  const translations = computed(() => messages[locale.value])

  function updateDocumentLanguage() {
    if (import.meta.client) document.documentElement.lang = locale.value
  }

  onMounted(() => {
    locale.value = getStoredLocale()
    updateDocumentLanguage()
  })

  async function loadLanguages() {
    const { public: { apiBaseUrl } } = useRuntimeConfig()

    try {
      const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/v1/languages`, {
        headers: { Accept: 'application/json' },
      })
      const data = response?.success === true ? response.data : response
      const availableLanguages = data?.languages || data

      if (Array.isArray(availableLanguages)) {
        const remoteLanguages = availableLanguages
          .map((language) => {
            const localLanguage = supportedLocales.find((supportedLocale) => (
              supportedLocale.code === language.code
            ))

            return {
              ...localLanguage,
              ...language,
            }
          })
        if (remoteLanguages.length) {
          languages.value = remoteLanguages
          selectedLanguageId.value = remoteLanguages.find((language) => language.code === locale.value)?.id || null
        }
      }
    } catch {
      // Keep the bundled options available if the language catalog cannot be loaded.
    }
  }

  async function setLocale(languageId, { persistRemote = true } = {}) {
    const language = languages.value.find((item) => String(item.id) === String(languageId))
      || languages.value.find((item) => item.code === languageId)
    if (!language) return

    selectedLanguageId.value = language.id
    if (messages[language.code]) {
      locale.value = language.code
      if (import.meta.client) localStorage.setItem('adaptacv-locale', language.code)
      updateDocumentLanguage()
    }

    if (persistRemote) {
      try {
        if (language?.id != null) await useAuthStore().updateLanguage(language.id)
      } catch {
        // The local preference remains available when the API is temporarily unreachable.
      }
    }
  }

  function t(path) {
    return path.split('.').reduce((value, key) => value?.[key], translations.value) ?? path
  }

  return { locale, languages, selectedLanguageId, translations, loadLanguages, setLocale, t }
})