import { z } from 'zod'
import { db } from '@/lib/db'

const metricSchema = z.object({ metric:z.enum(['view','LCP','CLS','INP']), value:z.number().finite().min(0).max(120000) })

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ANALYTICS !== '1') return new Response(null,{status:404})
  if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') return new Response(null,{status:204})
  const origin = request.headers.get('origin')
  const host = new URL(process.env.SITE_URL || request.url).origin
  if (origin !== host || request.headers.get('sec-fetch-site') === 'cross-site') return new Response(null,{status:403})
  const reader = request.body?.getReader()
  if (!reader) return new Response(null,{status:400})
  let input = ''
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (input.length + value.length > 150) {
      await reader.cancel()
      return new Response(null,{status:413})
    }
    input += decoder.decode(value,{stream:true})
  }
  let result
  try { result = metricSchema.safeParse(JSON.parse(input)) }
  catch { return new Response(null,{status:400}) }
  if (!result.success) return new Response(null,{status:400})
  await (await db()).query(`insert into impeto.daily_metrics(metric,count,total) values ($1,1,$2)
    on conflict (day,metric) do update set count=daily_metrics.count+1,total=daily_metrics.total+excluded.total`, [result.data.metric,result.data.value])
  return new Response(null,{status:204})
}
