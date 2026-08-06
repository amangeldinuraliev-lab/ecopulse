import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import PhotoUpload from '@/components/PhotoUpload';
import { BEACHES, findBeach } from '@/lib/beaches';
import { getPosition } from '@/lib/geo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Coins, Loader2, Sparkles, XCircle } from 'lucide-react';

export default function CleanupPage() {
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [beach, setBeach] = useState(BEACHES[0].name);
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setRes(null);
    const { data } = await base44.functions.invoke('verifyCleanup', { before_url: before, after_url: after });
    const user = await base44.auth.me();
    const pos = (await getPosition()) || findBeach(beach);
    await base44.entities.Cleanup.create({
      beach_name: beach, before_url: before, after_url: after,
      lat: pos?.lat, lng: pos?.lng,
      verified: !!data.verified,
      improvement_percent: data.improvement_percent,
      coins_awarded: data.coins_awarded || 0,
      waste_kg: data.waste_kg,
      ai_verdict: data.ai_verdict,
      user_name: user?.full_name || 'Аноним',
      user_email: user?.email,
    });
    setRes(data); setBusy(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">EcoCoin</h1>
        <p className="text-slate-500 mt-2">«Дейін» және «кейін» фотоларын жүкте — AI салыстырып, ұпай береді.</p>
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

        <div className="grid sm:grid-cols-2 gap-5">
          <PhotoUpload label="Дейін" value={before} onChange={setBefore} />
          <PhotoUpload label="Кейін" value={after} onChange={setAfter} />
        </div>

        <Button onClick={submit} disabled={!before || !after || busy} className="w-full h-12 rounded-2xl bg-teal-900 hover:bg-teal-800">
          {busy ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Тексеруге жіберу
        </Button>
      </div>

      {res && (
        <div className={`rounded-3xl p-7 border text-center ${res.verified ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-card border-rose-200'}`}>
          {res.verified ? (
            <>
              <Coins className="w-10 h-10 mx-auto text-amber-500" />
              <div className="mt-3 text-5xl font-semibold tracking-tight text-amber-600">+{res.coins_awarded}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-amber-700/70 mt-1">EcoCoin</div>
              <div className="mt-4 text-sm text-muted-foreground">Тазалық жақсаруы: {Math.round(res.improvement_percent)}% • ~{res.waste_kg || 0} кг қоқыс</div>
            </>
          ) : (
            <>
              <XCircle className="w-10 h-10 mx-auto text-rose-500" />
              <div className="mt-3 font-semibold">Расталмады</div>
            </>
          )}
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{res.ai_verdict}</p>
        </div>
      )}
    </div>
  );
}