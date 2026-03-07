import memberGuitarVocal from '@/assets/team/member-guitar-vocal.jpg';
import memberDrums1 from '@/assets/team/member-drums-1.jpg';
import memberVocal1 from '@/assets/team/member-vocal-1.jpg';
import memberVocal2 from '@/assets/team/member-vocal-2.jpg';
import memberBass from '@/assets/team/member-bass.jpg';
import memberGuitar from '@/assets/team/member-guitar.jpg';
import memberKeyboard from '@/assets/team/member-keyboard.jpg';

// fallback images by team member id (for migration)
const defaultTeamImages: Record<number, string> = {
  1: memberGuitarVocal,
  2: memberDrums1,
  3: memberVocal1,
  4: memberVocal2,
  5: memberBass,
  6: memberGuitar,
  7: '',
  8: memberKeyboard,
};

export interface PhotoGallery {
  id: number;
  title: string;
  images: string[]; // base64 data URLs
}

export interface Video {
  id: number;
  title: string;
  dbKey: string; // key in IndexedDB
}

export interface ResourceEvent {
  id: number;
  title: string;
  date: string;
  time?: string;
  location: string;
  locationUrl?: string;
  type: 'upcoming' | 'past';
}

export interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
  image?: string; // base64 data URL
}

export interface Song {
  id: number;
  title: string;
  titleEn?: string;
  lyricsPdfKey?: string; // key in Supabase Storage 'pdfs' bucket
  chordsPdfKey?: string; // key in Supabase Storage 'pdfs' bucket
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string; // base64 or empty
  instagram: string; // username or full URL
  imagePosX: number; // 0-100, default 50
  imagePosY: number; // 0-100, default 50
}

export interface ResourcesData {
  photos: PhotoGallery[];
  videos: Video[];
  events: ResourceEvent[];
  announcements: Announcement[];
  team: TeamMember[];
  heroImages: string[]; // base64 data URLs
  songs: Song[];
}

const STORAGE_KEY = 'elpis_resources';

const defaultData: ResourcesData = {
  heroImages: [],
  songs: [],
  photos: [
    { id: 1, title: 'Worship Night 2024', images: [] },
    { id: 2, title: 'Easter Concert', images: [] },
    { id: 3, title: 'Youth Conference', images: [] },
  ],
  videos: [],
  events: [
    { id: 1, title: 'Worship Night Athens', date: '2025-03-15', location: 'Athens', type: 'upcoming' },
    { id: 2, title: 'Easter Concert', date: '2025-04-20', location: 'Kallithea', type: 'upcoming' },
    { id: 3, title: 'Christmas Concert 2024', date: '2024-12-20', location: 'Athens', type: 'past' },
    { id: 4, title: 'Autumn Worship', date: '2024-10-15', location: 'Thessaloniki', type: 'past' },
  ],
  announcements: [
    { id: 1, title: 'New Single Released!', date: '2025-02-01', content: 'Check out our new single on Spotify!' },
    { id: 2, title: 'Tour Dates Announced', date: '2025-01-15', content: 'Spring 2025 tour dates are now available!' },
  ],
  team: [
    { id: 1, name: '', role: 'Guitar & Vocals', description: '', image: memberGuitarVocal, instagram: '', imagePosX: 50, imagePosY: 50 },
    { id: 2, name: '', role: 'Drums', description: '', image: memberDrums1, instagram: '', imagePosX: 50, imagePosY: 50 },
    { id: 3, name: '', role: 'Vocals', description: '', image: memberVocal1, instagram: '', imagePosX: 50, imagePosY: 50 },
    { id: 4, name: '', role: 'Vocals', description: '', image: memberVocal2, instagram: '', imagePosX: 50, imagePosY: 50 },
    { id: 5, name: '', role: 'Bass', description: '', image: memberBass, instagram: '', imagePosX: 50, imagePosY: 50 },
    { id: 6, name: '', role: 'Guitar', description: '', image: memberGuitar, instagram: '', imagePosX: 50, imagePosY: 50 },
    { id: 7, name: '', role: 'Drums', description: '', image: '', instagram: '', imagePosX: 50, imagePosY: 50 },
    { id: 8, name: '', role: 'Keyboard', description: '', image: memberKeyboard, instagram: '', imagePosX: 50, imagePosY: 50 },
  ],
};

export function getResourcesData(): ResourcesData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as ResourcesData;
      // migrate: photos.images was a number, now string[]
      parsed.photos = parsed.photos.map((p) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
      }));
      // migrate: team might not exist in old data
      if (!parsed.heroImages) parsed.heroImages = [];
      if (!parsed.songs) parsed.songs = [];
      if (!parsed.team) {
        parsed.team = defaultData.team;
      } else {
        // fill empty images with default asset images
        parsed.team = parsed.team.map((m) => ({
          ...m,
          image: m.image || defaultTeamImages[m.id] || '',
          instagram: m.instagram || '',
          imagePosX: m.imagePosX ?? 50,
          imagePosY: m.imagePosY ?? 50,
        }));
      }
      return parsed;
    }
  } catch {}
  return defaultData;
}

export function saveResourcesData(data: ResourcesData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function nextId(items: { id: number }[]): number {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}
