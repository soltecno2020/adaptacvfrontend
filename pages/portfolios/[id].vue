<script setup>
import PortfolioEditorView from '../../src/views/portfolios/PortfolioEditorView.vue'

definePageMeta({ middleware: 'auth' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()
</script>

<template><PortfolioEditorView :portfolio-id="route.params.id" /></template>