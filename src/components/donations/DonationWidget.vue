<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useLocaleStore } from '../../stores/localeStore'

const config = useRuntimeConfig()
const localeStore = useLocaleStore()
const copy = computed(() => localeStore.translations.donations)
const apiBaseUrl = config.public.apiBaseUrl.replace(/\/$/, '')
const presets = [5, 10, 25]
const amount = ref(10)
const customAmount = ref('')
const currency = ref('USD')
const paypalContainer = ref(null)
const isLoading = ref(true)
const isAvailable = ref(false)
const isProcessing = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
let buttonsInstance

const normalizedAmount = computed(() => (
  customAmount.value !== ''
    ? Number(customAmount.value)
    : amount.value
))

const isValidAmount = computed(() => (
  Number.isFinite(normalizedAmount.value)
  && normalizedAmount.value >= 1
  && normalizedAmount.value <= 500
  && Math.round(normalizedAmount.value * 100) === normalizedAmount.value * 100
))

function formatAmount(value) {
  return new Intl.NumberFormat(localeStore.locale === 'en' ? 'en-US' : localeStore.locale, {
    style: 'currency',
    currency: currency.value,
  }).format(value)
}

function selectAmount(value) {
  amount.value = value
  customAmount.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

function chooseCustomAmount() {
  amount.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

async function createOrder() {
  errorMessage.value = ''
  successMessage.value = ''
  isProcessing.value = true

  try {
    const response = await $fetch(`${apiBaseUrl}/v1/donations/orders`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: { amount: normalizedAmount.value.toFixed(2) },
    })

    if (!response?.success || !response.data?.order_id) {
      throw new Error(response?.message || copy.value.error)
    }

    return response.data.order_id
  } catch (error) {
    isProcessing.value = false
    errorMessage.value = error.data?.message || error.message || copy.value.error
    throw error
  }
}

async function captureOrder(data) {
  try {
    const response = await $fetch(`${apiBaseUrl}/v1/donations/capture`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: { order_id: data.orderID },
    })

    if (!response?.success || response.data?.status !== 'completed') {
      throw new Error(response?.message || copy.value.error)
    }

    successMessage.value = copy.value.thankYou.replace('{amount}', formatAmount(Number(response.data.amount)))
  } catch (error) {
    errorMessage.value = error.data?.message || error.message || copy.value.error
  } finally {
    isProcessing.value = false
  }
}

function loadPayPalSdk(clientId, sdkLocale) {
  if (window.paypal?.Buttons) return Promise.resolve(window.paypal)

  const existingScript = document.querySelector('script[data-adaptacv-paypal-sdk]')
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', () => resolve(window.paypal), { once: true })
      existingScript.addEventListener('error', () => reject(new Error(copy.value.unavailable)), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    const parameters = new URLSearchParams({
      'client-id': clientId,
      currency: currency.value,
      intent: 'capture',
      components: 'buttons',
      locale: sdkLocale,
    })

    script.src = `https://www.paypal.com/sdk/js?${parameters}`
    script.async = true
    script.dataset.adaptacvPaypalSdk = 'true'
    script.onload = () => resolve(window.paypal)
    script.onerror = () => reject(new Error(copy.value.unavailable))
    document.head.append(script)
  })
}

async function mountPayPalButtons() {
  if (!isAvailable.value || !paypalContainer.value || !window.paypal?.Buttons) return
  buttonsInstance?.close()
  paypalContainer.value.replaceChildren()

  buttonsInstance = window.paypal.Buttons({
    style: { layout: 'vertical', shape: 'rect', label: 'paypal', tagline: false },
    onClick(data, actions) {
      errorMessage.value = ''
      successMessage.value = ''
      if (!isValidAmount.value) {
        errorMessage.value = copy.value.invalidAmount
        return actions.reject()
      }
      return actions.resolve()
    },
    createOrder,
    onApprove: captureOrder,
    onCancel() {
      isProcessing.value = false
      errorMessage.value = copy.value.cancelled
    },
    onError(error) {
      isProcessing.value = false
      errorMessage.value = error?.message || copy.value.error
    },
  })

  await buttonsInstance.render(paypalContainer.value)
}

async function initialize() {
  isLoading.value = true
  try {
    const response = await $fetch(`${apiBaseUrl}/v1/donations/config`, {
      headers: { Accept: 'application/json' },
    })
    const data = response?.data
    currency.value = data?.currency || 'USD'
    if (!response?.success || !data?.enabled || !data?.client_id) return

    const paypalLocale = { es: 'es_ES', en: 'en_US', 'pt-BR': 'pt_BR' }[localeStore.locale] || 'en_US'
    await loadPayPalSdk(data.client_id, paypalLocale)
    isAvailable.value = true
    await mountPayPalButtons()
  } catch (error) {
    errorMessage.value = error.data?.message || error.message || copy.value.unavailable
  } finally {
    isLoading.value = false
  }
}

watch(() => localeStore.locale, async () => {
  successMessage.value = ''
  if (isAvailable.value) await mountPayPalButtons()
})

onMounted(initialize)
onBeforeUnmount(() => buttonsInstance?.close())
</script>

<template>
  <section class="border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
    <div class="grid gap-7 lg:grid-cols-[1fr_21rem] lg:items-center">
      <div>
        <p class="text-sm font-extrabold uppercase tracking-[0.14em] text-emerald-800">{{ copy.eyebrow }}</p>
        <h2 class="mt-2 text-2xl font-black tracking-normal text-stone-950 sm:text-3xl">{{ copy.title }}</h2>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{{ copy.description }}</p>
        <p class="mt-3 text-sm font-bold text-stone-700">{{ copy.caption }}</p>
      </div>

      <div class="rounded-lg border border-stone-200 bg-stone-50 p-4">
        <p class="text-sm font-extrabold text-stone-800">{{ copy.chooseAmount }}</p>
        <div class="mt-3 grid grid-cols-4 gap-2">
          <button
            v-for="preset in presets"
            :key="preset"
            class="rounded-md border px-2 py-2.5 text-sm font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            :class="amount === preset && !customAmount ? 'border-emerald-800 bg-emerald-900 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-700'"
            type="button"
            :aria-pressed="amount === preset && !customAmount"
            @click="selectAmount(preset)"
          >{{ formatAmount(preset) }}</button>
          <button
            class="rounded-md border px-2 py-2.5 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            :class="amount === null ? 'border-emerald-800 bg-emerald-900 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-emerald-700'"
            type="button"
            :aria-pressed="amount === null"
            @click="chooseCustomAmount"
          >{{ copy.customAmount }}</button>
        </div>

        <label v-if="amount === null" class="mt-3 block text-xs font-bold text-stone-600">
          {{ copy.customAmountLabel }}
          <input
            v-model="customAmount"
            class="mt-1.5 w-full rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15"
            type="number"
            min="1"
            max="500"
            step="0.01"
            inputmode="decimal"
            :placeholder="copy.customAmountPlaceholder"
          >
          <span class="mt-1 block font-medium">{{ copy.amountLimit }}</span>
        </label>

        <div v-if="isLoading" class="mt-4 grid min-h-11 place-items-center text-xs font-semibold text-stone-500">{{ copy.loading }}</div>
        <div v-else-if="isAvailable" ref="paypalContainer" class="mt-4 min-h-11" />
        <p v-else class="mt-4 text-xs font-semibold leading-5 text-stone-500">{{ copy.unavailable }}</p>
        <p v-if="isProcessing" class="mt-2 text-center text-xs font-semibold text-stone-500">{{ copy.processing }}</p>
        <p v-if="errorMessage" class="mt-3 rounded-md border border-red-200 bg-red-50 p-2.5 text-xs font-semibold leading-5 text-red-800" role="alert">{{ errorMessage }}</p>
        <p v-if="successMessage" class="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold leading-5 text-emerald-900" role="status">{{ successMessage }}</p>
      </div>
    </div>
  </section>
</template>
