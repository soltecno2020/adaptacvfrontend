<script setup>
import CvLibraryView from '../src/views/cvs/CvLibraryView.vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template><CvLibraryView /></template>