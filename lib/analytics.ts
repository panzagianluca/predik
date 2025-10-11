// lib/analytics.ts
// Analytics initialization utilities

type ConsentState = {
  necessary: boolean
  analytics: boolean
  timestamp: number
}

// Initialize Google Analytics
export function initGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return
  
  // Add GA script
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script1)
  
  // Add GA config
  const script2 = document.createElement('script')
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', {
      page_path: window.location.pathname,
    });
  `
  document.head.appendChild(script2)
  
  console.log('📊 Google Analytics initialized:', measurementId)
}

// Initialize PostHog
export async function initPostHog(apiKey: string, host: string) {
  if (typeof window === 'undefined') return
  
  const posthog = await import('posthog-js')
  
  posthog.default.init(apiKey, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  })
  
  console.log('📊 PostHog initialized:', apiKey)
  return posthog.default
}

// Check if user has consented to analytics
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  
  const consent = localStorage.getItem('cookie-consent')
  if (!consent) return false
  
  try {
    const parsed: ConsentState = JSON.parse(consent)
    return parsed.analytics === true
  } catch {
    return false
  }
}

// Initialize all analytics based on consent
export async function initAnalyticsIfConsented() {
  if (!hasAnalyticsConsent()) {
    console.log('⚠️ Analytics NOT consented - skipping initialization')
    return
  }
  
  console.log('✅ Analytics consented - initializing...')
  
  // Google Analytics - Replace with your Measurement ID
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (GA_MEASUREMENT_ID) {
    initGoogleAnalytics(GA_MEASUREMENT_ID)
  } else {
    console.warn('⚠️ GA_MEASUREMENT_ID not configured')
  }
  
  // PostHog - Replace with your API key
  const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
  
  if (POSTHOG_KEY) {
    await initPostHog(POSTHOG_KEY, POSTHOG_HOST)
  } else {
    console.warn('⚠️ POSTHOG_KEY not configured')
  }
}
