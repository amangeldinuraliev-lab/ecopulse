import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Image } from '@/components/ui/image';
import { Star, MapPin, Route, Navigation, Heart, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ROAD = { good: 'roadGood', moderate: 'roadMod', rough: 'roadRough' };

export default function EcoTour() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [favs, setFavs] = useState(() => JSON.parse(localStorage.getItem('eco-favs') || '[]'));
  const [q, setQ] = useState('');

  useEffect(() => { base44.entities.EcoTourLocation.list('-rating', 50).then(setItems); }, []);
  useEffect(() => { localStorage.setItem('eco-favs', JSON.stringify(favs)); }, [favs]);

  const toggleFav = (id) => setFavs((f) => f.includes(id) ? f.filter((x) => x !== id) : [...f, id]);
  const filtered = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{t('tour.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('tour.sub')}</p>
      </div>

      <Input placeholder="🔍" value={q} onChange={(e) => setQ(e.target.value)} className="h-12 rounded-2xl max-w-md" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((it) => (
          <div key={it.id} className="bg-card rounded-3xl overflow-hidden border border-teal-500/10 group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-24px_rgba(13,148,136,0.5)]">
            <div className="relative">
              <Image src={it.photo_url} className="w-full h-48" />
              <button onClick={() => toggleFav(it.id)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur grid place-items-center">
                <Heart className={`w-4 h-4 ${favs.includes(it.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </button>
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-black/40 backdrop-blur px-2.5 py-1 rounded-full text-white text-xs">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {it.rating?.toFixed(1) || '—'}
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="font-semibold tracking-tight">{it.name}</div>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{it.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-700 border border-sky-200/50"><Route className="w-3 h-3" />{it.distance_km || 0} км</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 border border-teal-200/50"><Gauge className="w-3 h-3" />{t('tour.' + (ROAD[it.road_condition] || 'roadMod'))}</span>
              </div>
              {it.route_info && <div className="text-xs text-muted-foreground leading-relaxed border-t border-teal-500/10 pt-3">{it.route_info}</div>}
              <Button asChild variant="outline" className="w-full rounded-2xl">
                <a href={`https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}`} target="_blank" rel="noreferrer">
                  <Navigation className="w-4 h-4 mr-2" />{t('common.navigate')}
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}