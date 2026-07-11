// Analytics are managed via Google Tag Manager (GTM-K2HDKRL5)
// Events pushed to dataLayer are picked up by GTM and forwarded to GA4 / other tags.
// Events are also persisted to Supabase for the admin dashboard.

import { logAnalyticsEvent } from '@/lib/supabase';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...params });
  logAnalyticsEvent(eventName, params).catch(() => {});
}
