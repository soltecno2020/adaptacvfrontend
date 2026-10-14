<script setup>
import PortfolioView from '../src/views/portfolios/PortfolioView.vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template><PortfolioView /></template>