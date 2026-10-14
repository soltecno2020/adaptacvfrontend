export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  try {
    const storedSession = localStorage.getItem('adaptacv-session')
    const session = storedSession ? JSON.parse(storedSession) : null

    if (!session?.isSuperAdmin) return navigateTo('/')
  } catch {
    return navigateTo('/')
  }
})