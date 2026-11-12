import { NextRequest, NextResponse } from 'next/server'
import { destination, supabase, useSupabase } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const origin = process.env.SITE_URL || request.nextUrl.origin
  const code = params.get('code')
  if (useSupabase && code) {
    const { error } = await (await supabase()).auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(destination(params.get('next')), origin))
  }
  return NextResponse.redirect(new URL('/conta?erro=confirmacao', origin))
}
