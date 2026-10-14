<script setup>
import { storeToRefs } from 'pinia'
import { Moon, Sun } from '@lucide/vue'
import { useThemeStore } from '../../stores/themeStore'

const themeStore = useThemeStore()
const { theme } = storeToRefs(themeStore)
</script>

<template>
  <button
    class="grid h-10 w-10 place-items-center rounded-md text-stone-600 transition hover:bg-stone-100 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
    type="button"
    :aria-label="theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    :title="theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
    @click="themeStore.toggleTheme"
  >
    <Sun v-if="theme === 'dark'" :size="18" aria-hidden="true" />
    <Moon v-else :size="18" aria-hidden="true" />
  </button>
</template>