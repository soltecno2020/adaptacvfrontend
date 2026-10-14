<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, BriefcaseBusiness, Check, CircleCheck, FileCheck2, Globe2, LogOut, Menu, ShieldCheck, Sparkles, UserRound, X } from '@lucide/vue'
import LanguageSelector from '../../components/navigation/LanguageSelector.vue'
import ThemeToggle from '../../components/navigation/ThemeToggle.vue'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton.vue'
import RecaptchaChallenge from '../../components/auth/RecaptchaChallenge.vue'
import DonationWidget from '../../components/donations/DonationWidget.vue'
import { useAuthStore } from '../../stores/authStore'
import { useLocaleStore } from '../../stores/localeStore'

const isAuthDialogOpen = ref(false)
const isMobileMenuOpen = ref(false)
const authMode = ref('signup')
const isSubmitting = ref(false)
const authError = ref('')
const authFieldErrors = ref({})
const registrationComplete = ref(false)
const passwordResetRequested = ref(false)
const authForm = ref({ name: '', email: '', password: '', passwordConfirmation: '' })
const nameInput = ref(null)
const recaptcha = ref(null)
const captchaToken = ref('')
const config = useRuntimeConfig()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const localeStore = useLocaleStore()
const { locale, translations: copy } = storeToRefs(localeStore)
const { isAuthenticated, session } = storeToRefs(authStore)
const accountInitial = computed(() => (session.value?.name || session.value?.email || '?').charAt(0).toUpperCase())

const authTitle = computed(() => ({ signup: copy.value.auth.signupTitle, login: copy.value.auth.loginTitle, forgot: copy.value.auth.forgotPasswordTitle })[authMode.value])
const authDescription = computed(() => (
  ({ signup: copy.value.auth.signupDescription, login: copy.value.auth.loginDescription, forgot: copy.value.auth.forgotPasswordDescription })[authMode.value]
))

const benefits = computed(() => [Globe2, FileCheck2, ShieldCheck].map((icon, index) => ({ icon, ...copy.value.benefits.items[index] })))

function normalizeFieldErrors(errors) {
  if (!errors) return {}

  try {
    return typeof errors === 'string' ? JSON.parse(errors) : errors
  } catch {
    return {}
  }
}

function trackRegistration() {
  if (import.meta.client && typeof window.gtag === 'function') {
    window.gtag('event', 'sign_up', { method: 'email' })
  }
}

function validateAuthForm() {
  const errors = {}
  const email = authForm.value.email.trim()

  if (authMode.value === 'signup' && !authForm.value.name.trim()) errors.name = ['Ingresa tu nombre completo.']
  if (!email) errors.email = ['Ingresa tu email.']
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = ['Ingresa un email valido.']
  if (authMode.value === 'forgot') {
    authFieldErrors.value = errors
    return Object.keys(errors).length === 0
  }
  if (!authForm.value.password) errors.password = ['Ingresa tu contrasena.']
  else if (authForm.value.password.length < 8) errors.password = ['La contrasena debe tener al menos 8 caracteres.']
  if (authMode.value === 'signup' && !authForm.value.passwordConfirmation) errors.password_confirmation = ['Confirma tu contrasena.']
  else if (authMode.value === 'signup' && authForm.value.password !== authForm.value.passwordConfirmation) errors.password_confirmation = ['Las contrasenas no coinciden.']

  authFieldErrors.value = errors
  return Object.keys(errors).length === 0
}

async function openAuthDialog(mode = 'signup') {
  authMode.value = mode
  authError.value = ''
  authFieldErrors.value = {}
  registrationComplete.value = false
  passwordResetRequested.value = false
  captchaToken.value = ''
  recaptcha.value?.reset()
  authForm.value = { name: '', email: '', password: '', passwordConfirmation: '' }
  isAuthDialogOpen.value = true
  await nextTick()
  if (mode === 'signup') nameInput.value?.focus()
}

async function submitAuthForm() {
  authError.value = ''
  authFieldErrors.value = {}
  if (!validateAuthForm()) return
  if (!captchaToken.value) {
    authError.value = 'Completa la verificación de seguridad.'
    return
  }
  isSubmitting.value = true

  try {
    if (authMode.value === 'signup') {
      await authStore.register({ ...authForm.value, captchaToken: captchaToken.value })
      trackRegistration()
      registrationComplete.value = true
      return
    } else if (authMode.value === 'forgot') {
      await authStore.requestPasswordReset(authForm.value.email.trim(), captchaToken.value)
      passwordResetRequested.value = true
      return
    } else {
      await authStore.login({ ...authForm.value, captchaToken: captchaToken.value })
    }
    isAuthDialogOpen.value = false
    router.push({ name: 'profile' })
  } catch (error) {
    authError.value = error.message || copy.value.auth.error
    authFieldErrors.value = normalizeFieldErrors(error.errors)
  } finally {
    isSubmitting.value = false
    captchaToken.value = ''
    recaptcha.value?.reset()
  }
}

async function loginWithGoogle(credential) {
  authError.value = ''
  isSubmitting.value = true

  try {
    await authStore.loginWithGoogle(credential)
    isAuthDialogOpen.value = false
    router.push({ name: 'profile' })
  } catch (error) {
    authError.value = error.message || copy.value.auth.error
  } finally {
    isSubmitting.value = false
  }
}

async function logout() {
  await authStore.logout()
}

function startCv() {
  if (isAuthenticated.value) {
    router.push({ name: 'profile' })
    return
  }
  openAuthDialog('signup')
}

function closeModalOnEscape(event) {
  if (event.key !== 'Escape') return
  isAuthDialogOpen.value = false
  isMobileMenuOpen.value = false
}

onMounted(() => {
  document.addEventListener('keydown', closeModalOnEscape)
  if (route.query.auth === 'login') openAuthDialog('login')
})
onBeforeUnmount(() => document.removeEventListener('keydown', closeModalOnEscape))
</script>

<template>
  <main class="min-h-screen overflow-hidden bg-[#f7f3eb] text-stone-950">
    <header class="fixed inset-x-0 top-0 z-40 border-b border-stone-200 bg-white/90 px-4 py-3 shadow-[0_1px_12px_rgba(11,20,32,0.04)] backdrop-blur sm:px-8 sm:py-5 lg:px-12">
      <nav class="mx-auto flex max-w-7xl items-center justify-between" :aria-label="copy.nav.openMenu">
        <RouterLink to="/" class="flex items-center gap-2.5 text-lg font-black tracking-normal text-stone-950">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-stone-950 text-white shadow-sm"><BriefcaseBusiness :size="19" /></span>
          <span class="hidden min-[380px]:inline">adaptacv<span class="text-coral-500">.</span></span>
        </RouterLink>
        <div class="hidden items-center gap-4 md:flex">
          <a href="#como-funciona" class="text-sm font-bold text-stone-600 transition hover:text-emerald-900">{{ copy.nav.howItWorks }}</a>
          <RouterLink to="/wikimigration" class="text-sm font-bold text-stone-600 transition hover:text-emerald-900">Wikimigration</RouterLink>
          <ThemeToggle />
          <LanguageSelector :label="copy.nav.openMenu" />
          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-emerald-900 text-sm font-black text-white ring-2 ring-emerald-100 transition hover:ring-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" :aria-label="copy.workspace.profile" :title="copy.workspace.profile"><img v-if="session?.photoUrl" :src="session.photoUrl" :alt="session.name || copy.workspace.profile" class="h-full w-full object-cover" /><span v-else>{{ accountInitial }}</span></RouterLink>
            <button class="grid h-10 w-10 place-items-center rounded-md text-stone-600 transition hover:bg-stone-100 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" :aria-label="copy.nav.logout" :title="copy.nav.logout" @click="logout"><LogOut :size="18" /></button>
          </template>
          <template v-else>
            <button class="text-sm font-bold text-emerald-900 hover:text-emerald-700" type="button" @click="openAuthDialog('login')">{{ copy.nav.login }}</button>
            <button class="rounded-md bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900" type="button" @click="openAuthDialog()">{{ copy.nav.signup }}</button>
          </template>
        </div>
        <div class="flex min-w-0 items-center gap-1 md:hidden">
          <ThemeToggle />
          <div class="min-w-0 max-w-[112px] [&_select]:w-full [&_select]:px-1.5"><LanguageSelector :label="copy.nav.openMenu" /></div>
          <button class="grid h-10 w-10 shrink-0 place-items-center rounded-md text-stone-600 transition hover:bg-stone-100 hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800" type="button" :aria-label="copy.nav.openMenu" :title="copy.nav.openMenu" :aria-expanded="isMobileMenuOpen" @click="isMobileMenuOpen = !isMobileMenuOpen"><X v-if="isMobileMenuOpen" :size="20" /><Menu v-else :size="20" /></button>
        </div>
      </nav>
      <div v-if="isMobileMenuOpen" class="absolute inset-x-0 top-full border-b border-stone-200 bg-white px-4 py-4 shadow-xl md:hidden">
        <nav class="mx-auto grid max-w-7xl gap-1" :aria-label="copy.nav.openMenu">
          <a href="#como-funciona" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">{{ copy.nav.howItWorks }}</a>
          <RouterLink to="/wikimigration" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">Wikimigration</RouterLink>
          <template v-if="isAuthenticated">
            <RouterLink to="/profile" class="rounded-md px-3 py-3 text-sm font-extrabold text-stone-700 hover:bg-stone-100" @click="isMobileMenuOpen = false">{{ copy.workspace.profile }}</RouterLink>
            <button class="flex items-center gap-2 rounded-md px-3 py-3 text-left text-sm font-extrabold text-stone-700 hover:bg-stone-100" type="button" @click="isMobileMenuOpen = false; logout()"><LogOut :size="17" /> {{ copy.nav.logout }}</button>
          </template>
          <template v-else>
            <button class="rounded-md px-3 py-3 text-left text-sm font-extrabold text-stone-700 hover:bg-stone-100" type="button" @click="isMobileMenuOpen = false; openAuthDialog('login')">{{ copy.nav.login }}</button>
            <button class="mt-1 rounded-md bg-emerald-900 px-3 py-3 text-left text-sm font-extrabold text-white" type="button" @click="isMobileMenuOpen = false; openAuthDialog()">{{ copy.nav.signup }}</button>
          </template>
        </nav>
      </div>
    </header>
    <div class="h-16 sm:h-20" aria-hidden="true"></div>

    <section class="relative px-4 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-16 lg:px-12 lg:pb-24">
      <div class="home-hero-atmosphere absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[linear-gradient(120deg,_#e7f3f1_0%,_#f8fafb_52%,_#fff3ef_100%)]"></div>
      <div class="mx-auto grid max-w-7xl items-center gap-10 sm:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div class="max-w-xl">
          <p class="home-hero-eyebrow inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-emerald-900"><Sparkles :size="14" aria-hidden="true" /> {{ copy.hero.eyebrow }}</p>
          <h1 class="mt-5 text-4xl font-black leading-[1.05] tracking-normal text-stone-950 sm:mt-6 sm:text-6xl sm:leading-[1.02]">{{ copy.hero.title }}</h1>
          <p class="mt-5 max-w-lg text-base leading-7 text-stone-600 sm:mt-6 sm:text-lg sm:leading-8">{{ copy.hero.description }}</p>
          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <button class="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900" type="button" @click="startCv">{{ copy.hero.primaryCta }} <ArrowRight :size="18" aria-hidden="true" /></button>
            <RouterLink to="/editor" class="inline-flex items-center justify-center rounded-md border border-stone-300 bg-white px-5 py-3.5 text-sm font-extrabold text-stone-800 transition hover:border-emerald-800 hover:text-emerald-900">{{ copy.hero.secondaryCta }}</RouterLink>
          </div>
          <div class="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-stone-600">
            <span class="inline-flex items-center gap-1.5"><Check :size="16" class="text-emerald-700" /> {{ copy.hero.noCard }}</span>
            <span class="inline-flex items-center gap-1.5"><Check :size="16" class="text-emerald-700" /> {{ copy.hero.countryRules }}</span>
          </div>
        </div>

        <div class="relative mx-auto w-full max-w-2xl">
          <div class="absolute right-0 top-0 h-20 w-20 rounded-full bg-coral-500/20 blur-2xl sm:-right-4 sm:-top-5 sm:h-24 sm:w-24"></div>
          <article class="relative overflow-hidden rounded-lg border border-stone-300 bg-white shadow-2xl shadow-stone-400/25">
            <div class="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-3">
              <div class="flex gap-1.5" aria-hidden="true"><span class="h-2.5 w-2.5 rounded-full bg-stone-300"></span><span class="h-2.5 w-2.5 rounded-full bg-stone-300"></span><span class="h-2.5 w-2.5 rounded-full bg-stone-300"></span></div>
              <span class="text-xs font-bold text-stone-500">{{ copy.preview.cvForAnywhere }}</span><CircleCheck :size="18" class="text-emerald-700" :aria-label="copy.preview.validated" />
            </div>
            <div class="grid grid-cols-[0.39fr_0.61fr] sm:grid-cols-[0.32fr_0.68fr]">
              <div class="bg-emerald-950 p-4 text-white sm:p-8">
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">{{ copy.preview.profile }}</p>
                <div class="mt-4 h-12 w-12 rounded-lg border-2 border-emerald-300/50 bg-emerald-800 sm:mt-5 sm:h-16 sm:w-16"></div>
                <h2 class="mt-4 text-base font-black tracking-normal sm:mt-5 sm:text-2xl">Tu perfil<br />profesional</h2><p class="mt-2 hidden text-sm font-semibold text-emerald-100 sm:block">Completa tus datos</p>
                <div class="mt-8 hidden space-y-3 border-t border-emerald-800 pt-5 text-xs leading-5 text-emerald-100 sm:block"><p>Información de contacto</p><p>Experiencia relevante</p><p>Idiomas y habilidades</p></div>
              </div>
              <div class="p-4 sm:p-8">
                <div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3"><p class="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-800 sm:text-xs sm:tracking-[0.14em]">{{ copy.preview.experience }}</p><span class="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800 sm:text-xs">ATS ready</span></div>
                <div class="mt-4 border-l-2 border-emerald-700 pl-3 sm:mt-5 sm:pl-4"><p class="text-sm font-extrabold text-stone-900 sm:text-base">Agrega tu experiencia</p><p class="mt-1 text-xs font-semibold leading-5 text-stone-500 sm:text-sm">Destaca los resultados de tu carrera</p><p class="mt-3 hidden text-sm leading-6 text-stone-600 sm:block">Crea un perfil orientado al mercado laboral de tu destino.</p></div>
                <div class="mt-4 border-t border-stone-200 pt-4 sm:mt-6 sm:pt-5"><p class="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-800 sm:text-xs sm:tracking-[0.14em]">{{ copy.preview.ready }}</p><div class="mt-3 flex flex-wrap gap-1.5 sm:gap-2"><span class="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-700 sm:px-2.5 sm:text-xs">Perfil</span><span class="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-700 sm:px-2.5 sm:text-xs">Experiencia</span><span class="hidden rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700 sm:inline">Habilidades</span></div></div>
              </div>
            </div>
          </article>
          <div class="relative -mt-1 ml-3 mr-3 flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2.5 shadow-lg sm:absolute sm:-bottom-5 sm:left-5 sm:ml-0 sm:mr-0 sm:gap-3 sm:px-4 sm:py-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 sm:h-8 sm:w-8"><Check :size="16" /></span><p class="text-xs font-extrabold text-stone-800 sm:text-sm">{{ copy.preview.localFormat }}</p></div>
        </div>
      </div>
    </section>

    <section id="como-funciona" class="border-y border-stone-200 bg-white px-5 py-16 sm:px-8 lg:px-12">
      <div class="mx-auto max-w-7xl"><div class="max-w-2xl"><p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">{{ copy.benefits.eyebrow }}</p><h2 class="mt-3 text-3xl font-black tracking-normal sm:text-4xl">{{ copy.benefits.title }}</h2></div>
        <div class="mt-10 grid gap-5 md:grid-cols-3"><article v-for="benefit in benefits" :key="benefit.title" class="border-t-2 border-emerald-800 pt-5"><component :is="benefit.icon" :size="27" class="text-emerald-800" aria-hidden="true" /><h3 class="mt-5 text-xl font-black tracking-normal">{{ benefit.title }}</h3><p class="mt-2 text-sm leading-6 text-stone-600">{{ benefit.description }}</p></article></div>
      </div>
    </section>

    <section id="destinos" class="border-y border-stone-200 bg-white px-5 py-16 sm:px-8 lg:px-12"><div class="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_.72fr] lg:items-end"><div class="max-w-3xl"><p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">Wikimigration</p><h2 class="mt-3 text-3xl font-black tracking-normal text-stone-950 sm:text-4xl">{{ copy.wikimigration.homeSection.title }}</h2><p class="mt-4 text-base leading-7 text-stone-600">{{ copy.wikimigration.homeSection.description }}</p></div><div class="border-l-2 border-coral-500 pl-6"><p class="text-sm font-bold leading-6 text-stone-600">{{ copy.wikimigration.homeSection.supportingText }}</p><RouterLink to="/wikimigration" class="mt-5 inline-flex items-center gap-2 rounded-md bg-emerald-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-800">{{ copy.wikimigration.homeSection.action }} <ArrowRight :size="18" aria-hidden="true" /></RouterLink></div></div></section>

    <section class="border-y border-stone-200 bg-[#f7f3eb] px-5 py-10 sm:px-8 lg:px-12" aria-label="Donaciones">
      <div class="mx-auto max-w-7xl"><DonationWidget /></div>
    </section>

    <footer class="border-t border-stone-200 px-5 py-8 sm:px-8 lg:px-12">
      <div class="mx-auto grid max-w-7xl gap-5 text-sm text-stone-500 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p class="font-extrabold text-stone-700">adaptacv · {{ copy.footer.motto }}</p>
          <p class="mt-1 font-semibold">{{ copy.footer.destination }}</p>
        </div>
        <div class="space-y-1 text-xs font-semibold sm:text-right">
          <p>{{ copy.footer.sponsoredBy }} <a class="home-footer-credit font-extrabold transition" href="https://www.soltecno.cl" target="_blank" rel="noopener noreferrer">Soltecno</a></p>
          <p>{{ copy.footer.createdBy }} <a class="home-footer-credit font-extrabold transition" href="https://www.linkedin.com/in/hugo-martinez-68105442b" target="_blank" rel="noopener noreferrer">Hugo Martínez</a> · {{ copy.footer.creatorRole }}</p>
        </div>
      </div>
    </footer>

    <div v-if="isAuthDialogOpen" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/45 p-4 sm:items-center" role="dialog" aria-modal="true" :aria-label="authTitle" @click.self="isAuthDialogOpen = false">
      <section class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl sm:p-8">
        <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900" type="button" :aria-label="copy.auth.close" :title="copy.auth.close" @click="isAuthDialogOpen = false"><X :size="20" /></button>
        <p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">adaptacv</p><h2 class="mt-3 text-3xl font-black tracking-normal text-stone-950">{{ authTitle }}</h2><p class="mt-2 text-sm leading-6 text-stone-600">{{ authDescription }}</p>
        <p v-if="registrationComplete" class="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-950">{{ copy.auth.verificationSent }}</p>
        <p v-else-if="passwordResetRequested" class="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-950">{{ copy.auth.passwordResetSent }}</p>
        <form v-else novalidate class="mt-6 space-y-4" @submit.prevent="submitAuthForm">
          <label v-if="authMode === 'signup'" class="block text-sm font-bold text-stone-800">{{ copy.auth.name }}<input ref="nameInput" v-model="authForm.name" autocomplete="name" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :class="{ 'border-red-500': authFieldErrors.name }" :placeholder="copy.auth.namePlaceholder" /><span v-if="authFieldErrors.name" class="mt-1 block text-sm font-semibold text-red-700">{{ authFieldErrors.name[0] }}</span></label>
          <label class="block text-sm font-bold text-stone-800">{{ copy.auth.email }}<input v-model="authForm.email" inputmode="email" autocomplete="email" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :class="{ 'border-red-500': authFieldErrors.email }" :placeholder="copy.auth.emailPlaceholder" /><span v-if="authFieldErrors.email" class="mt-1 block text-sm font-semibold text-red-700">{{ authFieldErrors.email[0] }}</span></label>
          <label v-if="authMode !== 'forgot'" class="block text-sm font-bold text-stone-800">{{ copy.auth.password }}<input v-model="authForm.password" type="password" :autocomplete="authMode === 'signup' ? 'new-password' : 'current-password'" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :class="{ 'border-red-500': authFieldErrors.password }" :placeholder="copy.auth.passwordPlaceholder" /><span v-if="authFieldErrors.password" class="mt-1 block text-sm font-semibold text-red-700">{{ authFieldErrors.password[0] }}</span></label>
          <label v-if="authMode === 'signup'" class="block text-sm font-bold text-stone-800">{{ copy.auth.confirmPassword }}<input v-model="authForm.passwordConfirmation" type="password" autocomplete="new-password" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :class="{ 'border-red-500': authFieldErrors.password_confirmation }" :placeholder="copy.auth.confirmPasswordPlaceholder" /><span v-if="authFieldErrors.password_confirmation" class="mt-1 block text-sm font-semibold text-red-700">{{ authFieldErrors.password_confirmation[0] }}</span></label>
          <RecaptchaChallenge v-if="config.public.recaptchaSiteKey" ref="recaptcha" :site-key="config.public.recaptchaSiteKey" @verified="captchaToken = $event" @expired="captchaToken = ''" @error="captchaToken = ''" />
          <p v-else class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">La verificación de seguridad no está configurada.</p>
          <p v-if="authError" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">{{ authError }}</p>
          <button class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="isSubmitting">{{ isSubmitting ? copy.auth.submitting : authMode === 'signup' ? copy.auth.signupButton : authMode === 'forgot' ? copy.auth.forgotPasswordButton : copy.auth.loginButton }} <ArrowRight v-if="!isSubmitting" :size="18" aria-hidden="true" /></button>
          <div v-if="authMode !== 'forgot' && config.public.googleClientId" class="border-t border-stone-200 pt-4">
            <GoogleSignInButton :client-id="config.public.googleClientId" @credential="loginWithGoogle" @error="authError = 'No fue posible cargar el inicio de sesión con Google.'" />
          </div>
        </form>
        <p v-if="authMode !== 'forgot'" class="mt-5 text-center text-sm text-stone-600">{{ authMode === 'signup' ? copy.auth.hasAccount : copy.auth.noAccount }} <button class="font-extrabold text-emerald-800 hover:text-emerald-950" type="button" @click="authMode = authMode === 'signup' ? 'login' : 'signup'">{{ authMode === 'signup' ? copy.auth.switchToLogin : copy.auth.switchToSignup }}</button></p>
        <button v-if="authMode === 'login'" class="mt-4 w-full text-center text-sm font-extrabold text-emerald-800 hover:text-emerald-950" type="button" @click="openAuthDialog('forgot')">{{ copy.auth.forgotPassword }}</button>
        <button v-if="authMode === 'forgot'" class="mt-5 w-full text-center text-sm font-extrabold text-emerald-800 hover:text-emerald-950" type="button" @click="openAuthDialog('login')">{{ copy.auth.backToLogin }}</button>
      </section>
    </div>
  </main>
</template>