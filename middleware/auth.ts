export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return
  if (!localStorage.getItem('adaptacv-session')) return navigateTo('/')
})