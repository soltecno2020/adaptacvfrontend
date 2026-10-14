<script setup>
import { ArrowRight, BadgeCheck, BriefcaseBusiness, MailCheck } from '@lucide/vue'
import LanguageSelector from '../src/components/navigation/LanguageSelector.vue'
import ThemeToggle from '../src/components/navigation/ThemeToggle.vue'
import { useLocaleStore } from '../src/stores/localeStore'

const localeStore = useLocaleStore()
const { locale } = storeToRefs(localeStore)

useSeoMeta({
  title: 'Correo verificado',
  description: 'Tu correo de adaptacv fue verificado correctamente.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <main class="min-h-screen overflow-hidden bg-[#f7f3eb] px-5 text-stone-950 sm:px-8 lg:px-12">
    <div class="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(ellipse_at_top,_#dcebd9_0%,_#f7f3eb_72%)]"></div>
    <header class="mx-auto flex max-w-7xl items-center justify-between py-5">
      <NuxtLink to="/" class="flex items-center gap-2.5 text-lg font-black tracking-normal text-emerald-950">
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-emerald-900 text-white"><BriefcaseBusiness :size="19" /></span>
        adaptacv
      </NuxtLink>
      <div class="flex items-center gap-2"><ThemeToggle /><LanguageSelector :locale="locale" label="Cambiar idioma" @update:locale="localeStore.setLocale" /></div>
    </header>

    <section class="mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-2xl items-center pb-20">
      <div class="w-full text-center">
        <div class="mx-auto grid h-20 w-20 place-items-center rounded-full border-8 border-emerald-100 bg-emerald-900 text-white shadow-xl shadow-emerald-950/15"><BadgeCheck :size="38" aria-hidden="true" /></div>
        <p class="mt-8 text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">Cuenta confirmada</p>
        <h1 class="mt-3 text-4xl font-black leading-tight tracking-normal text-stone-950 sm:text-5xl">Tu correo fue validado.</h1>
        <p class="mx-auto mt-5 max-w-lg text-base leading-7 text-stone-600 sm:text-lg">Ya puedes iniciar sesión y comenzar a preparar tu perfil profesional para tu próximo destino.</p>
        <div class="mx-auto mt-9 max-w-lg border border-emerald-200 bg-white p-5 text-left shadow-sm sm:p-6">
          <div class="flex gap-4"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-800"><MailCheck :size="21" aria-hidden="true" /></span><div><h2 class="font-black text-stone-900">Verificación completada</h2><p class="mt-1 text-sm leading-6 text-stone-600">Tu cuenta está lista para acceder de forma segura.</p></div></div>
        </div>
        <NuxtLink to="/?auth=login" class="mt-8 inline-flex items-center justify-center gap-2 rounded-md bg-emerald-900 px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900">Iniciar sesión <ArrowRight :size="18" aria-hidden="true" /></NuxtLink>
      </div>
    </section>
  </main>
</template>