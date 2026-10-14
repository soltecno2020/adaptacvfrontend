export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = config.public.siteUrl.replace(/\/$/, '')
  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return createSitemap(siteUrl, config.public.apiBaseUrl)
})

function slugify(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] || character)
}

async function createSitemap(siteUrl: string, apiBaseUrl: string) {
  const paths = ['/', '/destinations', '/wikimigration']

  try {
    const response = await $fetch(`${apiBaseUrl.replace(/\/$/, '')}/v1/destination-countries`, { headers: { Accept: 'application/json' } })
    const countries = response?.success ? response.data?.countries : []

    if (Array.isArray(countries)) {
      paths.push(...countries.map((country) => `/wikimigration/${slugify(country.name)}`).filter((path) => path !== '/wikimigration/'))
    }
  } catch {
    // The public static routes remain indexable when the API is unavailable.
  }

  const urls = [...new Set(paths)].map((path) => `  <url><loc>${escapeXml(`${siteUrl}${path}`)}</loc></url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}