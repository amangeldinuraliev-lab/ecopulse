import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import PhotoUpload from '@/components/PhotoUpload';
import PollutionBadge from '@/components/PollutionBadge';
import { BEACHES, findBeach } from '@/lib/beaches';
import { getPosition } from '@/lib/geo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Loader2, CheckCircle2, MapPin } from 'lucide-react';

export default function Report() {
  const [photo, setPhoto] = useState('');
  const [beach, setBeach] = useState(BEACHES[0].name);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const analyze = async () => {
    setBusy(true); setResult(null); setSaved(false);
    const { data } = await base44.functions.invoke('analyzeBeach', { photo_url: photo });
    setResult(data);
    setBusy(false);
  };

  const save = async () => {
    setBusy(true);
    const user = await base44.auth.me();
    const pos = (await getPosition()) || findBeach(beach);
    await base44.entities.BeachReport.create({
      beach_name: beach,
      photo_url: photo,
      lat: pos?.lat, lng: pos?.lng,
      pollution_level: result.pollution_level,
      pollution_score: result.pollution_score,
      waste_types: result.waste_types || [],
      estimated_items: result.estimated_items,
      ai_summary: result.ai_summary,
      reporter_name: user?.full_name || 'Аноним',
    });
    setBusy(false); setSaved(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Smart Beach AI</h1>
        <p className="text-slate-500 mt-2">Жағажайдың фотосын жүкте — AI қоқыс түрін және ластану деңгейін анықтайды.</p>
      </div>

      <div className="bg-card rounded-3xl p-6 border border-teal-900/5 space-y-5">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-2">Жағажай</div>
          <Select value={beach} onValueChange={setBeach}>
            <SelectTrigger className="rounded-2xl h-12"><SelectValue /></SelectTrigger>
            <SelectContent>
              {BEACHES.map((b) => <SelectItem key={b.name} value={b.name}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <PhotoUpload label="Жағажай фотосы" value={photo} onChange={(v) => { setPhoto(v); setResult(null); setSaved(false); }} />

        <Button onClick={analyze} disabled={!photo || busy} className="w-full h-12 rounded-2xl bg-teal-900 hover:bg-teal-800">
          {busy && !result ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
          AI талдау
        </Button>
      </div>

      {result && (
        <div className="bg-card rounded-3xl p-6 border border-teal-900/5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold tracking-tight">AI қорытындысы</div>
            <PollutionBadge level={result.pollution_level} />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Ластану деңгейі</span><span>{Math.round(result.pollution_score || 0)}/100</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-700"
                style={{ width: `${Math.round(result.pollution_score || 0)}%` }} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(result.waste_types || []).map((w) => (
              <span key={w} className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs border border-teal-100">{w}</span>
            ))}
            {result.estimated_items ? (
              <span className="px-3 py-1 rounded-full bg-slate-50 text-muted-foreground text-xs border border-slate-200">~{result.estimated_items} қоқыс</span>
            ) : null}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{result.ai_summary}</p>

          {saved ? (
            <div className="flex items-center gap-2 text-emerald-700 text-sm">
              <CheckCircle2 className="w-4 h-4" /> Картаға қосылды
            </div>
          ) : (
            <Button onClick={save} disabled={busy} className="w-full h-12 rounded-2xl">
              {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
              Картаға қосу
            </Button>
          )}
        </div>
      )}
    </div>
  );
}