import { createClient } from '@supabase/supabase-js';
import type { ResourcesData } from './resourcesData';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

export async function loadFromSupabase(): Promise<ResourcesData | null> {
  const { data, error } = await supabase
    .from('site_data')
    .select('data')
    .eq('id', 1)
    .single();
  if (error || !data) return null;
  return data.data as ResourcesData;
}

export async function saveToSupabase(data: ResourcesData): Promise<void> {
  await supabase.from('site_data').upsert({ id: 1, data, updated_at: new Date().toISOString() });
}

// ── Analytics ──────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  id: number;
  event_name: string;
  params: Record<string, unknown>;
  created_at: string;
}

export async function logAnalyticsEvent(
  eventName: string,
  params?: Record<string, unknown>,
): Promise<void> {
  await supabase.from('analytics_events').insert({ event_name: eventName, params: params ?? {} });
}

export async function getAnalyticsEvents(limit = 500): Promise<AnalyticsEvent[]> {
  const { data } = await supabase
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as AnalyticsEvent[];
}
