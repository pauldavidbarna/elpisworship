import { useState, useEffect, useRef } from 'react';
import { Image, Video, Calendar, Megaphone, LogOut, Plus, Pencil, Trash2, Lock, X, Upload, Film, Users, LayoutTemplate } from 'lucide-react';
import { saveVideo, deleteVideo } from '@/lib/videoDB';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  getResourcesData,
  saveResourcesData,
  nextId,
  type ResourcesData,
  type PhotoGallery,
  type Video as VideoType,
  type ResourceEvent,
  type Announcement,
  type TeamMember,
} from '@/lib/resourcesData';

const ADMIN_PASSWORD = 'elpis2024';
const AUTH_KEY = 'elpis_admin_auth';

// ── Image compression ──────────────────────────────────────────────────────

async function compressImage(file: File, maxWidth = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function extractYoutubeId(input: string): string {
  const m = input.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  if (m) return m[1];
  return input.trim();
}

// ── Photos Admin ───────────────────────────────────────────────────────────

function PhotosAdmin({ data, onChange }: { data: ResourcesData; onChange: (d: ResourcesData) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PhotoGallery | null>(null);
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditing(null); setTitle(''); setImages([]); setOpen(true);
  };
  const openEdit = (g: PhotoGallery) => {
    setEditing(g); setTitle(g.title); setImages([...g.images]); setOpen(true);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const compressed = await Promise.all(Array.from(files).map((f) => compressImage(f)));
    setImages((prev) => [...prev, ...compressed]);
    setUploading(false);
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const save = () => {
    const updated = editing
      ? data.photos.map((p) => p.id === editing.id ? { ...p, title, images } : p)
      : [...data.photos, { id: nextId(data.photos), title, images }];
    onChange({ ...data, photos: updated });
    setOpen(false);
  };

  const remove = (id: number) => onChange({ ...data, photos: data.photos.filter((p) => p.id !== id) });

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Galerii foto</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Adaugă galerie</Button>
      </div>
      <div className="space-y-2">
        {data.photos.map((g) => (
          <Card key={g.id} className="border shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {g.images[0]
                  ? <img src={g.images[0]} className="w-14 h-10 object-cover rounded" />
                  : <div className="w-14 h-10 bg-muted rounded flex items-center justify-center"><Image className="h-5 w-5 text-muted-foreground" /></div>
                }
                <div>
                  <p className="font-medium">{g.title}</p>
                  <p className="text-sm text-muted-foreground">{g.images.length} {g.images.length === 1 ? 'poză' : 'poze'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(g.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editează galerie' : 'Galerie nouă'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Titlu galerie</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Upload zone */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {uploading ? 'Se procesează...' : 'Click sau drag & drop pentru a adăuga poze'}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((src, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <img src={src} className="w-full h-full object-cover rounded" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Anulează</Button>
            <Button onClick={save} disabled={uploading}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Videos Admin ───────────────────────────────────────────────────────────

function VideosAdmin({ data, onChange }: { data: ResourcesData; onChange: (d: ResourcesData) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VideoType | null>(null);
  const [title, setTitle] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => { setEditing(null); setTitle(''); setVideoFile(null); setOpen(true); };
  const openEdit = (v: VideoType) => { setEditing(v); setTitle(v.title); setVideoFile(null); setOpen(true); };

  const handleFile = (files: FileList | null) => {
    if (files?.[0]) setVideoFile(files[0]);
  };

  const save = async () => {
    if (!editing && !videoFile) return;
    setUploading(true);
    try {
      if (editing) {
        // rename only - no new file
        if (videoFile) {
          await deleteVideo(editing.dbKey);
          const newKey = `video_${Date.now()}`;
          await saveVideo(newKey, videoFile);
          onChange({ ...data, videos: data.videos.map((v) => v.id === editing.id ? { ...v, title, dbKey: newKey } : v) });
        } else {
          onChange({ ...data, videos: data.videos.map((v) => v.id === editing.id ? { ...v, title } : v) });
        }
      } else if (videoFile) {
        const dbKey = `video_${Date.now()}`;
        await saveVideo(dbKey, videoFile);
        onChange({ ...data, videos: [...data.videos, { id: nextId(data.videos), title, dbKey }] });
      }
      setOpen(false);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (v: VideoType) => {
    await deleteVideo(v.dbKey);
    onChange({ ...data, videos: data.videos.filter((x) => x.id !== v.id) });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Videoclipuri</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Adaugă video</Button>
      </div>
      <div className="space-y-2">
        {data.videos.map((v) => (
          <Card key={v.id} className="border shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-14 h-10 bg-muted rounded flex items-center justify-center">
                  <Film className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium">{v.title}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => openEdit(v)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(v)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'Editează video' : 'Video nou'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Titlu</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{editing ? 'Înlocuiește fișier (opțional)' : 'Fișier video'}</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {videoFile ? videoFile.name : 'Click pentru a selecta un fișier video'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files)}
                />
              </div>
              {videoFile && (
                <video src={URL.createObjectURL(videoFile)} controls className="w-full rounded mt-2 max-h-48" />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Anulează</Button>
            <Button onClick={save} disabled={uploading || (!editing && !videoFile)}>
              {uploading ? 'Se salvează...' : 'Salvează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Events Admin ───────────────────────────────────────────────────────────

function EventsAdmin({ data, onChange }: { data: ResourcesData; onChange: (d: ResourcesData) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ResourceEvent | null>(null);
  const [form, setForm] = useState({ title: '', date: '', location: '', type: 'upcoming' as 'upcoming' | 'past' });

  const openAdd = () => { setEditing(null); setForm({ title: '', date: '', location: '', type: 'upcoming' }); setOpen(true); };
  const openEdit = (e: ResourceEvent) => { setEditing(e); setForm({ title: e.title, date: e.date, location: e.location, type: e.type }); setOpen(true); };

  const save = () => {
    const updated = editing
      ? data.events.map((e) => e.id === editing.id ? { ...e, ...form } : e)
      : [...data.events, { id: nextId(data.events), ...form }];
    onChange({ ...data, events: updated });
    setOpen(false);
  };

  const remove = (id: number) => onChange({ ...data, events: data.events.filter((e) => e.id !== id) });

  const upcoming = data.events.filter((e) => e.type === 'upcoming');
  const past = data.events.filter((e) => e.type === 'past');

  const EventRow = ({ e }: { e: ResourceEvent }) => (
    <Card className="border shadow-sm">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="font-medium">{e.title}</p>
          <p className="text-sm text-muted-foreground">{e.location} · {e.date}</p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Evenimente</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Adaugă</Button>
      </div>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Viitoare</p>
          <div className="space-y-2">{upcoming.map((e) => <EventRow key={e.id} e={e} />)}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Trecute</p>
          <div className="space-y-2 opacity-75">{past.map((e) => <EventRow key={e.id} e={e} />)}</div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editează eveniment' : 'Eveniment nou'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Titlu</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Dată</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Locație</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Tip</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'upcoming' | 'past' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Viitor</SelectItem>
                  <SelectItem value="past">Trecut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Anulează</Button>
            <Button onClick={save}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Announcements Admin ────────────────────────────────────────────────────

function AnnouncementsAdmin({ data, onChange }: { data: ResourcesData; onChange: (d: ResourcesData) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: '', date: '', content: '', image: '' });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openAdd = () => { setEditing(null); setForm({ title: '', date: new Date().toISOString().split('T')[0], content: '', image: '' }); setOpen(true); };
  const openEdit = (a: Announcement) => { setEditing(a); setForm({ title: a.title, date: a.date, content: a.content, image: a.image || '' }); setOpen(true); };

  const handleFile = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setUploading(true);
    const compressed = await compressImage(files[0], 1200, 0.85);
    setForm((f) => ({ ...f, image: compressed }));
    setUploading(false);
  };

  const save = () => {
    const updated = editing
      ? data.announcements.map((a) => a.id === editing.id ? { ...a, ...form } : a)
      : [...data.announcements, { id: nextId(data.announcements), ...form }];
    onChange({ ...data, announcements: updated });
    setOpen(false);
  };

  const remove = (id: number) => onChange({ ...data, announcements: data.announcements.filter((a) => a.id !== id) });

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Anunțuri</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Adaugă</Button>
      </div>
      <div className="space-y-2">
        {data.announcements.map((a) => (
          <Card key={a.id} className="border shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 flex-1 mr-4">
                  {a.image
                    ? <img src={a.image} className="w-14 h-10 object-cover rounded shrink-0" />
                    : <div className="w-14 h-10 bg-muted rounded shrink-0" />
                  }
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{a.title}</p>
                      <Badge variant="outline" className="text-xs">{a.date}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.content}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Editează anunț' : 'Anunț nou'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Titlu</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Dată</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Conținut</Label>
              <Textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Imagine (opțional)</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {form.image
                  ? <img src={form.image} className="max-h-40 mx-auto rounded object-cover" />
                  : (
                    <>
                      <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{uploading ? 'Se procesează...' : 'Click pentru a adăuga o imagine'}</p>
                    </>
                  )
                }
              </div>
              {form.image && (
                <button type="button" className="text-xs text-destructive underline mt-1" onClick={() => setForm((f) => ({ ...f, image: '' }))}>
                  Elimină imaginea
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Anulează</Button>
            <Button onClick={save} disabled={uploading}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Team Admin ─────────────────────────────────────────────────────────────

function TeamAdmin({ data, onChange }: { data: ResourcesData; onChange: (d: ResourcesData) => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: '', role: '', description: '', image: '', instagram: '', imagePosX: 50, imagePosY: 50 });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', role: '', description: '', image: '', instagram: '', imagePosX: 50, imagePosY: 50 });
    setOpen(true);
  };
  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role, description: m.description, image: m.image, instagram: m.instagram || '', imagePosX: m.imagePosX ?? 50, imagePosY: m.imagePosY ?? 50 });
    setOpen(true);
  };

  const handleFile = async (files: FileList | null) => {
    if (!files?.[0]) return;
    setUploading(true);
    const compressed = await compressImage(files[0], 600, 0.85);
    setForm((f) => ({ ...f, image: compressed, imagePosX: 50, imagePosY: 50 }));
    setUploading(false);
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!form.image) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { startX: clientX, startY: clientY, posX: form.imagePosX, posY: form.imagePosY };

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const cx = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
      const cy = 'touches' in ev ? ev.touches[0].clientY : ev.clientY;
      const dx = cx - dragRef.current.startX;
      const dy = cy - dragRef.current.startY;
      // invert: dragging down moves the crop window up (shows more of top)
      const newX = Math.min(100, Math.max(0, dragRef.current.posX - dx * 0.5));
      const newY = Math.min(100, Math.max(0, dragRef.current.posY - dy * 0.5));
      setForm((f) => ({ ...f, imagePosX: newX, imagePosY: newY }));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
  };

  const save = () => {
    const updated = editing
      ? data.team.map((m) => m.id === editing.id ? { ...m, ...form } : m)
      : [...data.team, { id: nextId(data.team), ...form }];
    onChange({ ...data, team: updated });
    setOpen(false);
    dragRef.current = null;
  };

  const remove = (id: number) => onChange({ ...data, team: data.team.filter((m) => m.id !== id) });

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Meet the Team</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Adaugă membru</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.team.map((m) => (
          <Card key={m.id} className="border shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              {m.image
                ? <img src={m.image} className="w-12 h-12 object-cover rounded-full shrink-0" />
                : <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0"><Users className="h-5 w-5 text-muted-foreground" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{m.name || <span className="text-muted-foreground italic">Fără nume</span>}</p>
                <p className="text-sm text-primary truncate">{m.role}</p>
                {m.description && <p className="text-xs text-muted-foreground truncate">{m.description}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Editează membru' : 'Membru nou'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Photo upload + reposition */}
            <div className="space-y-2">
              <Label>Poză profil</Label>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div
                    className={`w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-dashed ${form.image ? 'cursor-grab active:cursor-grabbing border-primary/40' : 'cursor-pointer hover:border-primary'} transition-colors select-none`}
                    onClick={() => !form.image && fileRef.current?.click()}
                    onMouseDown={onDragStart}
                    onTouchStart={onDragStart}
                  >
                    {form.image
                      ? <img
                          src={form.image}
                          className="w-full h-full object-cover pointer-events-none"
                          style={{ objectPosition: `${form.imagePosX}% ${form.imagePosY}%` }}
                          draggable={false}
                        />
                      : <Upload className="h-6 w-6 text-muted-foreground" />
                    }
                  </div>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <button
                    type="button"
                    className="block text-xs underline hover:text-foreground transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    {form.image ? 'Schimbă poza' : 'Încarcă poza'}
                  </button>
                  {form.image && <p className="text-xs">Trage poza pentru a ajusta poziția</p>}
                  {uploading && <p className="text-primary text-xs">Se procesează...</p>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Nume</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Andrei Pop" />
            </div>
            <div className="space-y-1">
              <Label>Instrument / Rol</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="ex: Chitară & Voce" />
            </div>
            <div className="space-y-1">
              <Label>Descriere</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Câteva cuvinte despre acest membru..." />
            </div>
            <div className="space-y-1">
              <Label>Instagram</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">@</span>
                <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="username" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Anulează</Button>
            <Button onClick={save} disabled={uploading}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Hero Admin ─────────────────────────────────────────────────────────────

function HeroAdmin({ data, onChange }: { data: ResourcesData; onChange: (d: ResourcesData) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    const compressed = await Promise.all(Array.from(files).map((f) => compressImage(f, 1600, 0.88)));
    onChange({ ...data, heroImages: [...data.heroImages, ...compressed] });
    setUploading(false);
  };

  const remove = (idx: number) => {
    onChange({ ...data, heroImages: data.heroImages.filter((_, i) => i !== idx) });
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const imgs = [...data.heroImages];
    [imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]];
    onChange({ ...data, heroImages: imgs });
  };

  const moveDown = (idx: number) => {
    if (idx === data.heroImages.length - 1) return;
    const imgs = [...data.heroImages];
    [imgs[idx], imgs[idx + 1]] = [imgs[idx + 1], imgs[idx]];
    onChange({ ...data, heroImages: imgs });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Imagini Hero (Carousel)</h2>
        <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Plus className="h-4 w-4 mr-1" /> {uploading ? 'Se procesează...' : 'Adaugă poze'}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {data.heroImages.length === 0 && (
        <div
          className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Click pentru a adăuga prima imagine hero</p>
          <p className="text-xs text-muted-foreground mt-1">Se va afișa ca slideshow pe pagina principală</p>
        </div>
      )}

      <div className="space-y-3">
        {data.heroImages.map((src, idx) => (
          <Card key={idx} className="border shadow-sm">
            <CardContent className="p-3 flex items-center gap-3">
              <img src={src} className="w-24 h-14 object-cover rounded shrink-0" />
              <div className="flex-1 text-sm text-muted-foreground">Imagine {idx + 1}</div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => moveUp(idx)} disabled={idx === 0}>↑</Button>
                <Button size="icon" variant="ghost" onClick={() => moveDown(idx)} disabled={idx === data.heroImages.length - 1}>↓</Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(idx)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

// ── Main Admin ─────────────────────────────────────────────────────────────

const Admin = () => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState<ResourcesData>(getResourcesData);

  useEffect(() => {
    if (authed) saveResourcesData(data);
  }, [data, authed]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      setAuthed(true);
      setError('');
    } else {
      setError('Parolă incorectă');
    }
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setPassword('');
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Elpis Worship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Parolă</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={login}>Intră</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="bg-background border-b px-6 py-3 flex justify-between items-center">
        <h1 className="font-bold text-lg">Admin · Elpis Worship</h1>
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Ieși
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="photos">
          <TabsList className="grid grid-cols-6 w-full mb-8">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" /><span className="hidden sm:inline">Hero</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" /><span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Image className="h-4 w-4" /><span className="hidden sm:inline">Foto</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="h-4 w-4" /><span className="hidden sm:inline">Video</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /><span className="hidden sm:inline">Evenimente</span>
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="h-4 w-4" /><span className="hidden sm:inline">Anunțuri</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hero"><HeroAdmin data={data} onChange={setData} /></TabsContent>
          <TabsContent value="team"><TeamAdmin data={data} onChange={setData} /></TabsContent>
          <TabsContent value="photos"><PhotosAdmin data={data} onChange={setData} /></TabsContent>
          <TabsContent value="videos"><VideosAdmin data={data} onChange={setData} /></TabsContent>
          <TabsContent value="events"><EventsAdmin data={data} onChange={setData} /></TabsContent>
          <TabsContent value="announcements"><AnnouncementsAdmin data={data} onChange={setData} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
