<script setup>
import EditorView from '../src/views/editor/EditorView.vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template><EditorView /></template>