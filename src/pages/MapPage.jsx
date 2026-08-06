import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import DigitalTwinMap from '@/components/DigitalTwinMap';
import PollutionBadge from '@/components/PollutionBadge';
import { computeHealth, HEALTH_BANDS } from '@/lib/health';
import { findBeach } from '@/lib/beaches';
import { MapPin } from 'lucide-react';

const DEFAULT_LAYERS = { water: true, seal: true, sturgeon: true, oil: true, waste: true, sos: true, citizen: true };

// үлгілік мұнай дақтары (спутник дерегінің орнына)
const OIL_PATCHES = [{ lat: 43.6, lng: 51.1 }, { lat: 44.5, lng: 50.3 }, { lat: 47.0, lng: 51.9 }];
const SEALS = [{ lat: 43.66, lng: 51.14, name: 'Каспий итбалығы — байқау', note: '3 дария көрінді' }, { lat: 44.5, lng: 50.25, name: 'Итбалық колониясы', note: 'Тыныш аймақ' }];

export default function MapPage() {
  const { t } = useLang();
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [reports, setReports] = useState([]);
  const [cleanups, setCleanups] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [community, setCommunity] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    base44.entities.BeachReport.list('-created_date', 200).then(setReports);
    base44.entities.Cleanup.list('-created_date', 200).then(setCleanups);
    base44.entities.SosAlert.list('-created_date', 200).then(setAlerts);
    base44.entities.CommunityPost.list('-created_date', 200).then(setCommunity);
  }, []);

  const coords = (r) => { if (r.lat && r.lng) return { lat: r.lat, lng: r.lng }; const b = findBeach(r.beach_name); return b || null; };

  const points = useMemo(() => ({
    oil: OIL_PATCHES,
    seal: SEALS,
    waste: reports.map((r) => { const c = coords(r); return c && { ...c, name: r.beach_name || 'Бағалау', note: `Ластану: ${Math.round(r.pollution_score || 0)}/100` }; }).filter(Boolean),
    sos: alerts.filter((a) => a.lat && a.lng).map((a) => ({ lat: a.lat, lng: a.lng, name: 'EcoSOS', note: a.location_note || a.ai_analysis })),
    citizen: community.map((p) => ({ lat: 43.6 + Math.random() * 0.1, lng: 51.1 + Math.random() * 0.1, name: p.title, note: p.location_note })).slice(0, 10),
  }), [reports, alerts, community]);

  const health = computeHealth(reports, alerts);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('nav.map')}</h1>
          <p className="text-muted-foreground mt-2">Caspian Digital Twin — қабаттарды қосып-өшіріп зертте.</p>
        </div>
        <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-2 border border-teal-500/10">
          <div className="text-xs text-muted-foreground">{t('home.health')}</div>
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: (HEALTH_BANDS[health.band] || HEALTH_BANDS.moderate).from }} />
          <div className="font-semibold">{health.score}<span className="text-muted-foreground text-sm font-normal">/100</span></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
        <DigitalTwinMap layers={layers} onToggle={(k) => setLayers((l) => ({ ...l, [k]: !l[k] }))} points={points} active={active} onSelect={setActive} />

        <div className="space-y-4">
          <div className="bg-card rounded-3xl p-5 border border-teal-500/10">
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-3">Легенда</div>
            {[
              { c: '#10b981', l: t('water.clean') },
              { c: '#f59e0b', l: t('water.moderate') },
              { c: '#ef4444', l: t('water.polluted') },
            ].map((x) => (
              <div key={x.l} className="flex items-center gap-2.5 py-1 text-sm"><span className="w-3 h-3 rounded-full" style={{ background: x.c }} /><span className="text-muted-foreground">{x.l}</span></div>
            ))}
          </div>

          <div className="bg-card rounded-3xl p-5 border border-teal-500/10 space-y-3">
            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Аймақ баяндамалары</div>
            {reports.slice(0, 5).map((r) => (
              <button key={r.id} onClick={() => setActive({ name: r.beach_name, note: r.ai_summary })} className="w-full flex items-center justify-between gap-2 text-left">
                <span className="text-sm flex items-center gap-2 truncate"><MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />{r.beach_name}</span>
                <PollutionBadge level={r.pollution_level} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}