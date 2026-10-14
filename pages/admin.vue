<script setup>
import AdminView from '../src/views/admin/AdminView.vue'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template><AdminView /></template>