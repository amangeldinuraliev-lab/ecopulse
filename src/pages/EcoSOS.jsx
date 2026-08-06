import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import PhotoUpload from '@/components/PhotoUpload';
import { getPosition } from '@/lib/geo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Siren, Loader2, MapPin, Copy } from 'lucide-react';

export default function EcoSOS() {
  const { t } = useLang();
  const [photo, setPhoto] = useState('');
  const [note, setNote] = useState('');
  const [cat, setCat] = useState('oil_spill');
  const [pos, setPos] = useState(null);
  const [busy, setBusy] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const CATS = ['oil_spill', 'dead_fish', 'dead_seal', 'illegal_dump', 'illegal_fishing', 'accident', 'other'];
  const CAT_KEY = { oil_spill: 'sos.catOil', dead_fish: 'sos.catFish', dead_seal: 'sos.catSeal', illegal_dump: 'sos.catDump', illegal_fishing: 'sos.catFishing', accident: 'sos.catAccident', other: 'sos.catOther' };
  const catLabel = (c) => t(CAT_KEY[c] || 'sos.catOther');
  const SEV = { low: 'bg-slate-100 text-slate-600', medium: 'bg-amber-100 text-amber-700', high: 'bg-orange-100 text-orange-700', critical: 'bg-rose-100 text-rose-700' };
  const SEV_LABEL = { low: 'Төмен', medium: 'Орташа', high: 'Жоғары', critical: 'Аса қауіпті' };

  const load = () => base44.entities.SosAlert.list('-created_date', 20).then(setAlerts);
  useEffect(() => { load(); getPosition().then(setPos); }, []);

  const send = async () => {
    setBusy(true);
    const { data } = await base44.functions.invoke('analyzeSos', { photo_url: photo, location_note: note, lat: pos?.lat, lng: pos?.lng });
    const user = await base44.auth.me();
    await base44.entities.SosAlert.create({
      photo_url: photo, location_note: note, lat: pos?.lat, lng: pos?.lng,
      category: data.category || cat, severity: data.severity,
      ai_analysis: data.ai_analysis, official_message: data.official_message,
      status: 'new', reporter_name: user?.full_name || 'Аноним',
    });
    setPhoto(''); setNote(''); await load(); setBusy(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="rounded-[2rem] bg-gradient-to-br from-rose-600 to-red-700 text-white p-7">
        <Siren className="w-8 h-8" />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{t('sos.title')}</h1>
        <p className="mt-2 text-rose-50/80">{t('sos.sub')}</p>
      </div>

      <div className="bg-card rounded-3xl p-6 border border-teal-500/10 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-2.5 rounded-2xl text-xs font-medium border transition-all ${cat === c ? 'bg-rose-600 text-white border-rose-600' : 'bg-card text-muted-foreground border-teal-500/10 hover:border-rose-300'}`}>
              {catLabel(c)}
            </button>
          ))}
        </div>
        <PhotoUpload label="Оқиға фотосы" value={photo} onChange={setPhoto} />
        <Input placeholder="Орналасқан жері" value={note} onChange={(e) => setNote(e.target.value)} className="h-12 rounded-2xl" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />{pos ? `${pos.lat}, ${pos.lng}` : 'Координат алынбады — орынды қолмен жазыңыз'}
        </div>
        <Button onClick={send} disabled={!photo || busy} className="w-full h-12 rounded-2xl bg-rose-600 hover:bg-rose-700">
          {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Siren className="w-4 h-4 mr-2" />}{t('sos.send')}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">{t('sos.reports')}</h2>
        {alerts.length === 0 && <div className="bg-card rounded-3xl p-8 text-center text-muted-foreground border border-teal-500/10">—</div>}
        {alerts.map((a) => (
          <div key={a.id} className="bg-card rounded-3xl p-5 border border-teal-500/10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium text-sm">{catLabel(a.category || 'other')}</div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${SEV[a.severity] || SEV.medium}`}>{SEV_LABEL[a.severity] || '—'}</span>
            </div>
            <div className="text-xs text-muted-foreground">{a.location_note || (a.lat ? `${a.lat}, ${a.lng}` : '—')} • {a.reporter_name}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{a.ai_analysis}</p>
            {a.official_message && (
              <div className="bg-muted/50 rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap border border-teal-500/10">
                {a.official_message}
                <button onClick={() => navigator.clipboard.writeText(a.official_message)} className="mt-3 inline-flex items-center gap-1.5 text-xs text-teal-700">
                  <Copy className="w-3.5 h-3.5" />{t('sos.copy')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}