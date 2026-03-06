import { supabase } from './supabase';

export async function uploadPdf(file: File, key: string): Promise<void> {
  const { error } = await supabase.storage
    .from('pdfs')
    .upload(key, file, { upsert: true, contentType: 'application/pdf' });
  if (error) throw error;
}

export function getPdfURL(key: string): string {
  const { data } = supabase.storage.from('pdfs').getPublicUrl(key);
  return data.publicUrl;
}

export async function deletePdf(key: string): Promise<void> {
  await supabase.storage.from('pdfs').remove([key]);
}

export async function downloadPdf(key: string, filename: string): Promise<void> {
  const url = getPdfURL(key);
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
