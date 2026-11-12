'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

function send(metric: string, value: number) {
  if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?:boolean }).globalPrivacyControl) return
  navigator.sendBeacon('/api/medicao',new Blob([JSON.stringify({metric,value})],{type:'application/json'}))
}

function report({name,value}: {name:string;value:number}) {
  if (['LCP','CLS','INP'].includes(name)) send(name,value)
}

export function Metrics() {
  const path = usePathname()
  useReportWebVitals(report)
  useEffect(() => {
    if (path === '/' || /^\/eventos\/[a-z0-9-]+$/.test(path)) send('view',1)
  },[path])
  return null
}
