<script setup>
import { nextTick, onMounted, ref } from 'vue'

const props = defineProps({
  clientId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['credential', 'error'])
const container = ref(null)
let initialized = false

function waitForGoogleIdentity() {
  if (globalThis.google?.accounts?.id) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const onLoaded = () => {
      if (globalThis.google?.accounts?.id) resolve()
      else reject(new Error('Google Identity Services did not initialize.'))
    }
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (existingScript) {
      existingScript.addEventListener('load', onLoaded, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = onLoaded
    script.onerror = reject
    document.head.appendChild(script)
  })
}

async function render() {
  if (initialized || !props.clientId || !container.value) return

  try {
    await waitForGoogleIdentity()
    await nextTick()
    globalThis.google.accounts.id.initialize({
      client_id: props.clientId,
      callback: (response) => {
        if (response.credential) emit('credential', response.credential)
        else emit('error')
      },
    })
    globalThis.google.accounts.id.renderButton(container.value, {
      theme: 'outline',
      size: 'large',
      width: Math.min(400, Math.floor(container.value.clientWidth)),
      text: 'continue_with',
    })
    initialized = true
  } catch {
    emit('error')
  }
}

onMounted(render)
</script>

<template>
  <div ref="container" class="min-h-10 w-full" />
</template>
