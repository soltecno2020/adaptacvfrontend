<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  siteKey: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['verified', 'expired', 'error'])
const container = ref(null)
let widgetId = null

function waitForRecaptcha() {
  if (globalThis.grecaptcha?.render) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const onApiLoaded = () => {
      if (!globalThis.grecaptcha?.ready) {
        reject(new Error('reCAPTCHA API did not initialize.'))
        return
      }
      globalThis.grecaptcha.ready(resolve)
    }

    const existingScript = document.querySelector('script[src^="https://www.google.com/recaptcha/api.js"]')
    if (existingScript) {
      existingScript.addEventListener('load', onApiLoaded, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = onApiLoaded
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function render() {
  if (!props.siteKey || !container.value) return

  try {
    await waitForRecaptcha()
    widgetId = globalThis.grecaptcha.render(container.value, {
      sitekey: props.siteKey,
      callback: (token) => emit('verified', token),
      'expired-callback': () => emit('expired'),
      'error-callback': () => emit('error'),
    })
  } catch {
    emit('error')
  }
}

function reset() {
  if (widgetId !== null && globalThis.grecaptcha) globalThis.grecaptcha.reset(widgetId)
}

onMounted(render)
onBeforeUnmount(() => {
  if (widgetId !== null && globalThis.grecaptcha) globalThis.grecaptcha.reset(widgetId)
})

defineExpose({ reset })
</script>

<template>
  <div ref="container" class="min-h-[78px]" />
</template>
