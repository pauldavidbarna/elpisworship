import { supabase } from './supabase';

const BUCKET = 'photos';

async function compressToBlob(file: File, maxWidth = 1400, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas 2D context unavailable'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
          'image/jpeg',
          quality,
        );
      };
      img.onerror = () => reject(new Error('Image decode failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

function makeKey(): string {
  const rand = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${rand}.jpg`;
}

/** Compress + upload; returns the public URL. */
export async function uploadPhoto(file: File, maxWidth = 1400, quality = 0.82): Promise<string> {
  const blob = await compressToBlob(file, maxWidth, quality);
  const key = makeKey();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, blob, { upsert: false, contentType: 'image/jpeg' });
  if (error) throw new Error(error.message ?? JSON.stringify(error));
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/** Extract the storage key from a public URL, or null if this isn't a Supabase photo URL. */
export function keyFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function deletePhoto(url: string): Promise<void> {
  const key = keyFromUrl(url);
  if (!key) return; // legacy base64 or unknown URL — nothing to delete server-side.
  await supabase.storage.from(BUCKET).remove([key]);
}
