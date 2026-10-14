<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Check, Copy, Sparkles } from '@lucide/vue'
import WorkspaceNav from '../../components/navigation/WorkspaceNav.vue'
import { useAuthStore } from '../../stores/authStore'
import { useCvStore } from '../../stores/cvStore'
import { useLocaleStore } from '../../stores/localeStore'

const authStore = useAuthStore()
const cvStore = useCvStore()
const localeStore = useLocaleStore()
const { session } = storeToRefs(authStore)
const { cv } = storeToRefs(cvStore)
const { translations: copy } = storeToRefs(localeStore)
const recipient = ref('')
const copied = ref(false)
const profileCopy = computed(() => copy.value.profile)

const letter = computed(() => profileCopy.value.letterBody
  .replace('{company}', recipient.value.trim() || profileCopy.value.recipientPlaceholder)
  .replace('{role}', cv.value.profile.role)
  .replace('{skills}', cv.value.skills.slice(0, 3).join(', '))
  .replace('{name}', session.value?.name || cv.value.profile.fullName))

async function copyLetter() {
  await navigator.clipboard.writeText(letter.value)
  copied.value = true
  window.setTimeout(() => { copied.value = false }, 1600)
}
</script>

<template>
  <main class="workspace-page min-h-screen bg-[#f7f3eb] text-stone-950">
    <WorkspaceNav />
    <section class="relative overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
      <div class="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_#dcebd9_0%,_#f7f3eb_74%)]"></div>
      <div class="mx-auto max-w-5xl"><div class="flex items-start gap-4"><span class="grid h-12 w-12 place-items-center rounded-lg bg-amber-100 text-amber-900"><Sparkles :size="23" /></span><div><p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">{{ profileCopy.documents }}</p><h1 class="mt-1 text-4xl font-black tracking-normal">{{ profileCopy.letterTitle }}</h1><p class="mt-2 text-stone-600">{{ profileCopy.documentsText }}</p></div></div>
        <div class="mt-8 grid gap-5 lg:grid-cols-[0.38fr_0.62fr]"><section class="rounded-lg border border-stone-300 bg-white p-6 shadow-sm"><label class="block text-sm font-bold text-stone-700">{{ profileCopy.recipient }}<input v-model="recipient" class="mt-2 w-full rounded-md border border-stone-300 px-3 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-2 focus:ring-emerald-900/15" :placeholder="profileCopy.recipientPlaceholder" /></label><p class="mt-5 border-t border-stone-200 pt-5 text-sm leading-6 text-stone-600">{{ cv.profile.role }} · {{ cv.profile.city }}</p></section><article class="rounded-lg border border-stone-300 bg-white p-6 shadow-xl shadow-stone-200/70"><p class="whitespace-pre-line text-sm leading-7 text-stone-700">{{ letter }}</p><button class="mt-6 inline-flex items-center gap-2 rounded-md bg-emerald-900 px-4 py-3 text-sm font-extrabold text-white hover:bg-emerald-800" type="button" @click="copyLetter"><Check v-if="copied" :size="17" /><Copy v-else :size="17" />{{ copied ? profileCopy.copied : profileCopy.copy }}</button></article></div>
      </div>
    </section>
  </main>
</template>