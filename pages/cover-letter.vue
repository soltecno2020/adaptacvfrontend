<script setup>
import CoverLetterView from '../src/views/cover-letter/CoverLetterView.vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template><CoverLetterView /></template>