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
