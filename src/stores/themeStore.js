import { onMounted, ref, watch } from 'vue'
import { defineStore } from 'pinia'

const themeKey = 'adaptacv-theme'

function getStoredTheme() {
  if (import.meta.server) return 'light'
  return localStorage.getItem(themeKey) === 'dark' ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(getStoredTheme())

  function applyTheme() {
    if (import.meta.client) document.documentElement.classList.toggle('theme-dark', theme.value === 'dark')
  }

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  onMounted(() => {
    theme.value = getStoredTheme()
    applyTheme()
  })

  watch(theme, () => {
    if (import.meta.client) localStorage.setItem(themeKey, theme.value)
    applyTheme()
  })

  return { theme, toggleTheme }
})