<template>
  <label class="block">
    <span class="text-sm font-bold text-stone-800">{{ label }}</span>
    <slot />
  </label>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
})
</script>