import { useState, useEffect, useRef } from 'react';
import { Image, Video, Calendar, Megaphone, LogOut, Plus, Pencil, Trash2, Lock, X, Upload, Film, Users, LayoutTemplate, Music } from 'lucide-react';
import { saveVideo, deleteVideo } from '@/lib/videoDB';
import { uploadPdf, deletePdf } from '@/lib/pdfStorage';
import { saveToSupabase } from '@/lib/supabase';
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
  type Song,
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
        <h2 className="font-semibold text-lg">Photo Galleries</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add gallery</Button>
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
                  <p className="text-sm text-muted-foreground">{g.images.length} {g.images.length === 1 ? 'photo' : 'photos'}</p>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit gallery' : 'New gallery'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Gallery title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Upload zone */}
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {uploading ? 'Processing...' : 'Click or drag & drop to add photos'}
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
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={uploading}>Save</Button>
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
        <h2 className="font-semibold text-lg">Videos</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add video</Button>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit video' : 'New video'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>{editing ? 'Replace file (optional)' : 'Video file'}</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {videoFile ? videoFile.name : 'Click to select a video file'}
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
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={uploading || (!editing && !videoFile)}>
              {uploading ? 'Saving...' : 'Save'}
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
        <h2 className="font-semibold text-lg">Events</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </div>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Upcoming</p>
          <div className="space-y-2">{upcoming.map((e) => <EventRow key={e.id} e={e} />)}</div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Past</p>
          <div className="space-y-2 opacity-75">{past.map((e) => <EventRow key={e.id} e={e} />)}</div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit event' : 'New event'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as 'upcoming' | 'past' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
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
        <h2 className="font-semibold text-lg">Announcements</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit announcement' : 'New announcement'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Content</Label>
              <Textarea rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Image (optional)</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {form.image
                  ? <img src={form.image} className="max-h-40 mx-auto rounded object-cover" />
                  : (
                    <>
                      <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{uploading ? 'Processing...' : 'Click to add an image'}</p>
                    </>
                  )
                }
              </div>
              {form.image && (
                <button type="button" className="text-xs text-destructive underline mt-1" onClick={() => setForm((f) => ({ ...f, image: '' }))}>
                  Remove image
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={uploading}>Save</Button>
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
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add member</Button>
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
                <p className="font-medium truncate">{m.name || <span className="text-muted-foreground italic">No name</span>}</p>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit member' : 'New member'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Photo upload + reposition */}
            <div className="space-y-2">
              <Label>Profile photo</Label>
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
                    {form.image ? 'Change photo' : 'Upload photo'}
                  </button>
                  {form.image && <p className="text-xs">Drag the photo to adjust position</p>}
                  {uploading && <p className="text-primary text-xs">Processing...</p>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Nume</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ex: Andrei Pop" />
            </div>
            <div className="space-y-1">
              <Label>Instrument / Role</Label>
              <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="e.g. Guitar & Vocals" />
            </div>
            <div className="space-y-1">
              <Label>Descriere</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A few words about this member..." />
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
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={uploading}>Save</Button>
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
          <Plus className="h-4 w-4 mr-1" /> {uploading ? 'Processing...' : 'Add photos'}
        </Button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {data.heroImages.length === 0 && (
        <div
          className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Click to add the first hero image</p>
          <p className="text-xs text-muted-foreground mt-1">Will be displayed as a slideshow on the home page</p>
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

// ── Songs Admin ────────────────────────────────────────────────────────────

function SongsAdmin({ data, onChange }: { data: ResourcesData; onChange: (d: ResourcesData) => void }) {
  const songs = data.songs ?? [];
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Song | null>(null);
  const [draftId, setDraftId] = useState(1);
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [lyricsPdfKey, setLyricsPdfKey] = useState<string | undefined>();
  const [chordsPdfKey, setChordsPdfKey] = useState<string | undefined>();
  const [uploadingLyrics, setUploadingLyrics] = useState(false);
  const [uploadingChords, setUploadingChords] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const lyricsRef = useRef<HTMLInputElement>(null);
  const chordsRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    const newId = songs.length > 0 ? Math.max(...songs.map((s) => s.id)) + 1 : 1;
    setDraftId(newId);
    setEditing(null); setTitle(''); setTitleEn(''); setLyricsPdfKey(undefined); setChordsPdfKey(undefined);
    setOpen(true);
  };

  const openEdit = (s: Song) => {
    setDraftId(s.id);
    setEditing(s); setTitle(s.title); setTitleEn(s.titleEn ?? ''); setLyricsPdfKey(s.lyricsPdfKey); setChordsPdfKey(s.chordsPdfKey);
    setOpen(true);
  };

  const save = () => {
    if (!title.trim()) return;
    if (editing) {
      onChange({ ...data, songs: songs.map((s) => s.id === editing.id ? { ...s, title, titleEn: titleEn || undefined, lyricsPdfKey, chordsPdfKey } : s) });
    } else {
      onChange({ ...data, songs: [...songs, { id: draftId, title, titleEn: titleEn || undefined, lyricsPdfKey, chordsPdfKey }] });
    }
    setOpen(false);
  };

  const remove = async (s: Song) => {
    if (!window.confirm(`Ștergi "${s.title}"?`)) return;
    if (s.lyricsPdfKey) await deletePdf(s.lyricsPdfKey);
    if (s.chordsPdfKey) await deletePdf(s.chordsPdfKey);
    onChange({ ...data, songs: songs.filter((x) => x.id !== s.id) });
  };

  const handlePdf = async (file: File, type: 'lyrics' | 'chords') => {
    const key = `${draftId}-${type}.pdf`;
    setUploadError(null);
    if (type === 'lyrics') {
      setUploadingLyrics(true);
      try { await uploadPdf(file, key); setLyricsPdfKey(key); }
      catch (e) { setUploadError(String(e)); }
      finally { setUploadingLyrics(false); }
    } else {
      setUploadingChords(true);
      try { await uploadPdf(file, key); setChordsPdfKey(key); }
      catch (e) { setUploadError(String(e)); }
      finally { setUploadingChords(false); }
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Songs & PDFs</h2>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add song</Button>
      </div>

      {songs.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
          <Music className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No songs added yet</p>
        </div>
      )}

      <div className="space-y-3">
        {songs.map((s) => (
          <Card key={s.id} className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Music className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.title}</p>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${s.lyricsPdfKey ? 'border-primary text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                    Lyrics {s.lyricsPdfKey ? '✓' : '—'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${s.chordsPdfKey ? 'border-primary text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                    Chords {s.chordsPdfKey ? '✓' : '—'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(s)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit song' : 'Add song'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-1">
              <Label>Greek title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Εκπληκτική Χάρη" />
            </div>
            <div className="space-y-1">
              <Label>English title <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="ex: Amazing Grace" />
            </div>

            {/* Lyrics PDF */}
            <div className="space-y-2">
              <Label>PDF Lyrics</Label>
              <div className="flex items-center gap-3">
                <div className={`flex-1 text-sm px-3 py-2 rounded border ${lyricsPdfKey ? 'border-primary/50 text-primary bg-primary/5' : 'border-dashed text-muted-foreground'}`}>
                  {lyricsPdfKey ? `${draftId}-lyrics.pdf ✓` : 'No file uploaded'}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={uploadingLyrics}
                  onClick={() => lyricsRef.current?.click()}
                >
                  {uploadingLyrics ? 'Uploading...' : <><Upload className="h-3 w-3 mr-1" /> Upload</>}
                </Button>
                <input ref={lyricsRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handlePdf(e.target.files[0], 'lyrics'); e.target.value = ''; }}
                />
              </div>
            </div>

            {/* Chords PDF */}
            <div className="space-y-2">
              <Label>PDF Lyrics + Chords</Label>
              <div className="flex items-center gap-3">
                <div className={`flex-1 text-sm px-3 py-2 rounded border ${chordsPdfKey ? 'border-primary/50 text-primary bg-primary/5' : 'border-dashed text-muted-foreground'}`}>
                  {chordsPdfKey ? `${draftId}-chords.pdf ✓` : 'No file uploaded'}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={uploadingChords}
                  onClick={() => chordsRef.current?.click()}
                >
                  {uploadingChords ? 'Uploading...' : <><Upload className="h-3 w-3 mr-1" /> Upload</>}
                </Button>
                <input ref={chordsRef} type="file" accept="application/pdf" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handlePdf(e.target.files[0], 'chords'); e.target.value = ''; }}
                />
              </div>
            </div>

            {uploadError && (
              <p className="text-xs text-destructive bg-destructive/10 rounded p-2 font-mono break-all">{uploadError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!title.trim() || uploadingLyrics || uploadingChords}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    if (authed) {
      saveResourcesData(data);
      saveToSupabase(data);
    }
  }, [data, authed]);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      setAuthed(true);
      setError('');
    } else {
      setError('Incorrect password');
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
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={login}>Sign in</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('photos');

  const navItems = [
    { value: 'hero',          label: 'Hero',          icon: LayoutTemplate },
    { value: 'team',          label: 'Team',          icon: Users },
    { value: 'photos',        label: 'Photos',        icon: Image },
    { value: 'videos',        label: 'Videos',        icon: Video },
    { value: 'events',        label: 'Events',        icon: Calendar },
    { value: 'announcements', label: 'Announcements', icon: Megaphone },
    { value: 'songs',         label: 'Lyrics',        icon: Music },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'hero':          return <HeroAdmin data={data} onChange={setData} />;
      case 'team':          return <TeamAdmin data={data} onChange={setData} />;
      case 'photos':        return <PhotosAdmin data={data} onChange={setData} />;
      case 'videos':        return <VideosAdmin data={data} onChange={setData} />;
      case 'events':        return <EventsAdmin data={data} onChange={setData} />;
      case 'announcements': return <AnnouncementsAdmin data={data} onChange={setData} />;
      case 'songs':         return <SongsAdmin data={data} onChange={setData} />;
      default:              return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Top header */}
      <header className="bg-background border-b px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Lock className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Elpis Worship</p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4 mr-2" /> Sign out
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex flex-col w-56 bg-background border-r shrink-0 py-4 px-3 gap-1">
          {navItems.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${
                activeTab === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </aside>

        {/* Mobile top nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t flex overflow-x-auto">
          {navItems.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors shrink-0 ${
                activeTab === value
                  ? 'text-primary border-t-2 border-primary -mt-px'
                  : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
