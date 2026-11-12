import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const site = process.env.SITE_URL
  if (!process.env.DATABASE_URL || !site) return { rules:{userAgent:'*',disallow:'/'} }
  return { rules:{userAgent:'*',allow:'/',disallow:['/conta','/gestao','/api','/auth','/eventos/*/checkout']}, sitemap: new URL('/sitemap.xml',site).href }
}
