import { supabase } from './supabase';

const BUCKET = 'videos';

export async function saveVideo(key: string, file: Blob): Promise<void> {
  const ext = file instanceof File ? file.name.split('.').pop() : 'mp4';
  const path = `${key}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
}

export async function getVideoURL(key: string): Promise<string | null> {
  // Try common extensions
  for (const ext of ['mp4', 'mov', 'webm', 'avi']) {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${key}.${ext}`);
    // Verify the file exists by checking if URL resolves
    const res = await fetch(data.publicUrl, { method: 'HEAD' }).catch(() => null);
    if (res?.ok) return data.publicUrl;
  }
  return null;
}

export async function deleteVideo(key: string): Promise<void> {
  for (const ext of ['mp4', 'mov', 'webm', 'avi']) {
    await supabase.storage.from(BUCKET).remove([`${key}.${ext}`]);
  }
}
