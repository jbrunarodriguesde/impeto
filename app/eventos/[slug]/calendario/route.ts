import { getEvent } from '@/lib/db'

const escape = (value: string) => value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/[,;]/g,'\\$&')
const stamp = (date: string) => new Date(date).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')
function fold(line: string) {
  let part = ''
  const parts: string[] = []
  for (const char of line) {
    if (Buffer.byteLength(part + char) > 75) {
      parts.push(part)
      part = ' '
    }
    part += char
  }
  return [...parts, part].join('\r\n')
}

export async function GET(_request: Request, { params }: { params: Promise<{slug:string}> }) {
  const event = await getEvent((await params).slug)
  if (!event) return new Response('Evento indisponível.', {status:404})
  const origin = process.env.SITE_URL || 'http://localhost:3000'
  const rows = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Impeto//Eventos//PT','CALSCALE:GREGORIAN','BEGIN:VEVENT',
    'UID:' + event.id + '@' + new URL(origin).hostname, 'DTSTAMP:' + stamp(new Date().toISOString()),
    'DTSTART:' + stamp(event.starts_at), 'DTEND:' + stamp(event.ends_at), 'SUMMARY:' + escape(event.title),
    'LOCATION:' + escape(event.venue + ', ' + event.city), 'DESCRIPTION:' + escape(event.description),
    'URL:' + new URL('/eventos/' + event.slug,origin).href, 'END:VEVENT','END:VCALENDAR','']
  return new Response(rows.map(fold).join('\r\n'), { headers:{ 'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'attachment; filename="' + event.slug + '.ics"' } })
}
