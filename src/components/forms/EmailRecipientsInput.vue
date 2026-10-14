<script setup>
import { computed, ref } from 'vue'
import { X } from '@lucide/vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  ownerEmail: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])
const input = ref('')
const error = ref('')

const recipients = computed(() => {
  const values = [...props.modelValue, props.ownerEmail].map((value) => String(value || '').trim().toLowerCase()).filter(Boolean)
  return [...new Set(values)]
})

function updateRecipients(values) {
  emit('update:modelValue', [...new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean))])
}

function addRecipients() {
  const values = input.value.split(/[\s,;]+/).map((value) => value.trim()).filter(Boolean)
  if (!values.length) return
  const invalidEmail = values.find((value) => !/^\S+@\S+\.\S+$/.test(value))
  if (invalidEmail) {
    error.value = `La dirección ${invalidEmail} no es válida.`
    return
  }
  error.value = ''
  updateRecipients([...recipients.value, ...values])
  input.value = ''
}

function removeRecipient(email) {
  if (email === props.ownerEmail?.trim().toLowerCase()) return
  updateRecipients(recipients.value.filter((recipient) => recipient !== email))
}

function handleKeydown(event) {
  if (!['Enter', ','].includes(event.key)) return
  event.preventDefault()
  addRecipients()
}
</script>

<template>
  <div class="mt-2 rounded-md border border-stone-300 bg-white p-2 focus-within:border-emerald-800 focus-within:ring-2 focus-within:ring-emerald-900/15">
    <div class="flex flex-wrap gap-1.5">
      <span v-for="recipient in recipients" :key="recipient" class="inline-flex max-w-full items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-950">
        <span class="truncate">{{ recipient }}</span>
        <button v-if="recipient !== ownerEmail.trim().toLowerCase()" type="button" class="grid h-4 w-4 shrink-0 place-items-center rounded text-emerald-800 hover:bg-emerald-200" :aria-label="`Quitar ${recipient}`" :title="`Quitar ${recipient}`" @click="removeRecipient(recipient)"><X :size="13" /></button>
      </span>
      <input v-model="input" type="email" inputmode="email" class="min-w-40 flex-1 bg-transparent px-1 py-1 text-sm outline-none" placeholder="Agregar correo" @keydown="handleKeydown" @blur="addRecipients" />
    </div>
  </div>
  <p class="mt-1 text-xs text-stone-500">Presiona Enter o usa una coma para agregar otro destinatario.</p>
  <p v-if="error" class="mt-1 text-xs font-semibold text-red-700" role="alert">{{ error }}</p>
</template>