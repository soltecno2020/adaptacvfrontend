<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { BriefcaseBusiness, FileText, FolderKanban, LogOut, Menu, ShieldCheck, UserRound, X } from '@lucide/vue'
import LanguageSelector from './LanguageSelector.vue'
import ThemeToggle from './ThemeToggle.vue'
import { useAuthStore } from '../../stores/authStore'
import { useLocaleStore } from '../../stores/localeStore'

const authStore = useAuthStore()
const localeStore = useLocaleStore()
const route = useRoute()
const { session } = storeToRefs(authStore)
const { locale, translations: copy } = storeToRefs(localeStore)
const accountInitial = computed(() => (session.value?.name || session.value?.email || '?').charAt(0).toUpperCase())
const isMobileMenuOpen = ref(false)

const navigationItems = computed(() => [
  { to: '/profile', label: 'profile', icon: UserRound },
  { to: '/cvs', label: 'cvs', icon: FileText },
  { to: '/portfolios', label: 'portfolios', icon: FolderKanban },
  { to: '/cover-letter', label: 'coverLetter', icon: FileText },
  ...(session.value?.isSuperAdmin ? [{ to: '/admin', label: 'Administración', icon: ShieldCheck }] : []),
])

function isNavigationActive(path) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

async function logout() {
  await authStore.logout()
  navigateTo('/')
}

watch(() => route.fullPath, () => {
  isMobileMenuOpen.value = false
})
</script>

<template>
  <header class="workspace-nav fixed inset-x-0 top-0 z-40 border-b border-stone-200 bg-white/90 px-4 shadow-[0_1px_12px_rgba(11,20,32,0.04)] backdrop-blur sm:px-6 lg:px-8">
    <nav class="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 lg:gap-5" :aria-label="copy.workspace.navigation">
      <RouterLink to="/" class="flex shrink-0 items-center gap-2 text-lg font-black text-stone-950">
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-stone-950 text-white shadow-sm"><BriefcaseBusiness :size="19" /></span>
        <span class="hidden xl:inline">adaptacv<span class="text-coral-500">.</span></span>
      </RouterLink>
      <div class="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto py-3 md:flex">
        <RouterLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          class="workspace-nav-item inline-flex shrink-0 items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-stone-100 hover:text-emerald-900"
          :class="isNavigationActive(item.to) ? 'workspace-nav-item-active bg-emerald-50 text-emerald-950 shadow-sm' : ''"
        >
          <component :is="item.icon" :size="16" :class="isNavigationActive(item.to) ? 'workspace-nav-active-icon' : ''" aria-hidden="true" />
          {{ copy.workspace[item.label] }}
        </RouterLink>
      </div>
      <div class="hidden shrink-0 items-center gap-2 md:flex">
        <ThemeToggle />
        <LanguageSelector :label="copy.nav.openMenu" />
        <RouterLink to="/profile" class="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-900 text-sm font-black text-white ring-2 ring-emerald-100 transition hover:ring-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" :aria-label="copy.workspace.profile" :title="copy.workspace.profile">
          <img v-if="session?.photoUrl" :src="session.photoUrl" :alt="session.name || copy.workspace.profile" class="h-full w-full object-cover" />
          <span v-else>{{ accountInitial }}</span>
        </RouterLink>
        <button class="grid h-10 w-10 place-items-center rounded-md text-stone-600 transition hover:bg-stone-100 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" :aria-label="copy.nav.logout" :title="copy.nav.logout" @click="logout">
          <LogOut :size="17" />
        </button>
      </div>
      <div class="flex min-w-0 items-center gap-1 py-3 md:hidden">
        <ThemeToggle />
        <div class="min-w-0 max-w-[112px] [&_select]:w-full [&_select]:px-1.5"><LanguageSelector :label="copy.nav.openMenu" /></div>
        <button class="grid h-10 w-10 shrink-0 place-items-center rounded-md text-stone-600 transition hover:bg-stone-100 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" :aria-label="copy.nav.openMenu" :title="copy.nav.openMenu" :aria-expanded="isMobileMenuOpen" @click="isMobileMenuOpen = !isMobileMenuOpen"><X v-if="isMobileMenuOpen" :size="20" /><Menu v-else :size="20" /></button>
      </div>
    </nav>
    <div v-if="isMobileMenuOpen" class="absolute inset-x-0 top-full border-b border-stone-200 bg-white px-4 py-4 shadow-xl md:hidden">
      <nav class="mx-auto grid max-w-7xl gap-1" :aria-label="copy.workspace.navigation">
        <RouterLink v-for="item in navigationItems" :key="item.to" :to="item.to" class="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" :class="isNavigationActive(item.to) ? 'bg-emerald-50 text-emerald-950' : ''"><component :is="item.icon" :size="17" aria-hidden="true" />{{ copy.workspace[item.label] }}</RouterLink>
        <button class="mt-1 flex items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-extrabold text-red-700 hover:bg-red-50" type="button" @click="logout"><LogOut :size="17" />{{ copy.nav.logout }}</button>
      </nav>
    </div>
  </header>
  <div class="h-16" aria-hidden="true"></div>
</template>