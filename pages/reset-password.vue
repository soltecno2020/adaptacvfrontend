<script setup>
import { computed, ref } from 'vue'
import { ArrowRight, BriefcaseBusiness, KeyRound, MailCheck } from '@lucide/vue'
import LanguageSelector from '../src/components/navigation/LanguageSelector.vue'
import ThemeToggle from '../src/components/navigation/ThemeToggle.vue'
import { useAuthStore } from '../src/stores/authStore'
import { useLocaleStore } from '../src/stores/localeStore'

const route = useRoute()
const authStore = useAuthStore()
const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)
const token = computed(() => typeof route.query.token === 'string' ? route.query.token : '')
const form = ref({
  email: typeof route.query.email === 'string' ? route.query.email : '',
  password: '',
  passwordConfirmation: '',
})
const error = ref('')
const success = ref(false)
const isSubmitting = ref(false)

function validateForm() {
  if (!token.value) return 'El enlace de recuperacion es invalido o esta incompleto.'
  if (!/^\S+@\S+\.\S+$/.test(form.value.email.trim())) return 'Ingresa el email asociado a tu cuenta.'
  if (form.value.password.length < 8) return 'La contrasena debe tener al menos 8 caracteres.'
  if (form.value.password !== form.value.passwordConfirmation) return 'Las contrasenas no coinciden.'
  return ''
}

async function submit() {
  error.value = validateForm()
  if (error.value) return

  isSubmitting.value = true
  try {
    await authStore.resetPassword({ ...form.value, email: form.value.email.trim(), token: token.value })
    success.value = true
  } catch (requestError) {
    error.value = requestError.message || 'No fue posible actualizar la contrasena.'
  } finally {
    isSubmitting.value = false
  }
}

useSeoMeta({ title: 'Restablecer contrasena', robots: 'noindex, nofollow' })
</script>

<template>
  <main class="min-h-screen overflow-hidden bg-[#f7f3eb] px-5 text-stone-950 sm:px-8 lg:px-12">
    <div class="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_at_top,_#dcebd9_0%,_#f7f3eb_72%)]"></div>
    <header class="mx-auto flex max-w-7xl items-center justify-between py-5"><NuxtLink to="/" class="flex items-center gap-2.5 text-lg font-black text-emerald-950"><span class="grid h-9 w-9 place-items-center rounded-lg bg-emerald-900 text-white"><BriefcaseBusiness :size="19" /></span>adaptacv</NuxtLink><div class="flex gap-2"><ThemeToggle /><LanguageSelector :locale="locale" label="Cambiar idioma" @update:locale="localeStore.setLocale" /></div></header>
    <section class="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-md items-center pb-20"><div class="w-full border border-stone-300 bg-white p-6 shadow-xl shadow-stone-400/15 sm:p-8"><span class="grid h-12 w-12 place-items-center rounded-md bg-emerald-50 text-emerald-800"><KeyRound :size="23" aria-hidden="true" /></span><p class="mt-6 text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">Recuperar acceso</p><h1 class="mt-2 text-3xl font-black tracking-normal text-stone-950">Crea una nueva contrasena</h1><p class="mt-3 text-sm leading-6 text-stone-600">Elige una contrasena segura para volver a entrar a tu cuenta.</p><div v-if="success" class="mt-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-950"><div class="flex gap-3"><MailCheck :size="20" class="shrink-0" /><span>Tu contrasena fue actualizada. Ya puedes iniciar sesion.</span></div></div><form v-else novalidate class="mt-6 space-y-4" @submit.prevent="submit"><label class="block text-sm font-bold text-stone-800">Email<input v-model="form.email" inputmode="email" autocomplete="email" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label><label class="block text-sm font-bold text-stone-800">Nueva contrasena<input v-model="form.password" type="password" autocomplete="new-password" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label><label class="block text-sm font-bold text-stone-800">Confirmar nueva contrasena<input v-model="form.passwordConfirmation" type="password" autocomplete="new-password" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 outline-none transition focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" /></label><p v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">{{ error }}</p><button class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Actualizando...' : 'Actualizar contrasena' }} <ArrowRight v-if="!isSubmitting" :size="18" /></button></form><NuxtLink v-if="success" to="/?auth=login" class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-emerald-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-800">Iniciar sesion <ArrowRight :size="18" /></NuxtLink></div></section>
  </main>
</template>