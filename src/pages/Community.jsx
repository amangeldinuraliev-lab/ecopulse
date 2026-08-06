import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import PhotoUpload from '@/components/PhotoUpload';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Plus, Loader2, ShieldCheck, Flag, MapPin } from 'lucide-react';

export default function Community() {
  const { t } = useLang();
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', photo: '', description: '', location: '', rating: 5 });
  const [busy, setBusy] = useState(false);

  const load = () => base44.entities.CommunityPost.list('-created_date', 50).then(setPosts);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setBusy(true);
    const { data } = await base44.functions.invoke('moderatePost', { photo_url: form.photo, title: form.title, description: form.description });
    const user = await base44.auth.me();
    await base44.entities.CommunityPost.create({
      title: form.title, photo_url: form.photo, description: form.description,
      location_note: form.location, rating: Number(form.rating) || 5,
      author_name: user?.full_name || 'Аноним',
      ai_moderation: data.ai_moderation, ai_note: data.ai_note,
    });
    setForm({ title: '', photo: '', description: '', location: '', rating: 5 });
    setOpen(false);
    await load();
    setBusy(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('com.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('com.sub')}</p>
        </div>
        <Button onClick={() => setOpen((o) => !o)} className="rounded-2xl bg-teal-900 hover:bg-teal-800">
          <Plus className="w-4 h-4 mr-2" />{t('com.add')}
        </Button>
      </div>

      {open && (
        <div className="bg-card rounded-3xl p-6 border border-teal-500/10 space-y-4">
          <Input placeholder="Атауы" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 rounded-2xl" />
          <div className="grid sm:grid-cols-2 gap-4">
            <PhotoUpload label="Фото" value={form.photo} onChange={(v) => setForm({ ...form, photo: v })} />
            <div className="space-y-3">
              <Input placeholder="Орналасқан жері" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="h-12 rounded-2xl" />
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} onClick={() => setForm({ ...form, rating: n })}>
                    <Star className={`w-6 h-6 ${(form.rating || 0) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Textarea placeholder="Сипаттама" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-2xl min-h-24" />
          <Button onClick={submit} disabled={!form.title || !form.photo || busy} className="w-full h-12 rounded-2xl">
            {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            {t('com.moderated')}
          </Button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((p) => (
          <div key={p.id} className="bg-card rounded-3xl overflow-hidden border border-teal-500/10">
            <Image src={p.photo_url} className="w-full h-44" />
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold tracking-tight">{p.title}</div>
                {p.ai_moderation === 'approved' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700"><ShieldCheck className="w-3 h-3" />AI ✓</span>
                ) : p.ai_moderation === 'flagged' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700"><Flag className="w-3 h-3" /></span>
                ) : null}
              </div>
              {p.location_note && <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location_note}</div>}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{p.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-teal-500/10">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${(p.rating||0) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />)}
                </div>
                <span className="text-xs text-muted-foreground">{p.author_name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}