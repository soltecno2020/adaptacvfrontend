<script setup>
import ProfileView from '../src/views/profile/ProfileView.vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template><ProfileView /></template>