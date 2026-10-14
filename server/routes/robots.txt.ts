export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return `User-agent: *
Allow: /
Disallow: /profile
Disallow: /cvs
Disallow: /editor
Disallow: /portfolios
Disallow: /cover-letter

Sitemap: ${config.public.siteUrl}/sitemap.xml
`
})