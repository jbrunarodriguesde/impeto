import { connection } from 'next/server'
import type { MetadataRoute } from 'next'
import { db, isLocal } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection()
  const site = process.env.SITE_URL
  if (!site || isLocal) return []
  const events = await (await db()).query<{slug:string}>('select slug from impeto.events where published order by starts_at limit 10000')
  return [{url:site}, ...events.map(event=>({url:new URL('/eventos/' + event.slug,site).href}))]
}
