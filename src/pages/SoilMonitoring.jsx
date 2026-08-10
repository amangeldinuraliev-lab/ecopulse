import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Sprout, Leaf, Droplet, Mountain, AlertTriangle, Bot } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { statusInfo } from '@/lib/ecoHelpers';

const INDICATORS = [
  { key: 'soil_pollution', icon: Sprout, label: 'Топырақ ластануы' },
  { key: 'oil_impact', icon: Droplet, label: 'Мұнай әсері' },
  { key: 'waste_level', icon: AlertTriangle, label: 'Қоқыс деңгейі' },
  { key: 'vegetation_change', icon: Leaf, label: 'Өсімдік жамылғысы' },
  { key: 'coastal_erosion', icon: Mountain, label: 'Жағалау эрозиясы' },
];

export default function SoilMonitoring() {
  const { t } = useI18n();
  const [readings, setReadings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.SoilMonitoringReading.list();
        setReadings(data);
        if (data.length) setSelected(data[0]);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const isDemo = readings.length > 0 && readings.every(r => r.source === 'demo');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-amber-600" /> {t('soilTitle')}
          </h1>
          <p className="text-sm text-slate-500">Mangistau — Caspian coast land monitoring</p>
        </div>
        {isDemo && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
            {t('demoData')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-[420px]">
          <MapContainer center={[44.0, 51.0]} zoom={7} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {readings.map((r, i) => {
              const info = statusInfo(r.overall_status);
              return (
                <CircleMarker key={i} center={[r.lat, r.lng]} radius={16}
                  pathOptions={{ color: info.color, fillColor: info.color, fillOpacity: 0.7 }}
                  eventHandlers={{ click: () => setSelected(r) }}>
                  <Popup><strong>{r.location_name}</strong><br />{t(r.overall_status)}</Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <div className="space-y-3">
          {loading && <div className="text-slate-400">{t('loading')}</div>}
          {!loading && !readings.length && <div className="text-slate-400">{t('dataUnavailable')}</div>}
          {readings.map((r) => {
            const info = statusInfo(r.overall_status);
            const active = selected?.id === r.id;
            return (
              <button key={r.id} onClick={() => setSelected(r)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all ${active ? 'border-teal-400 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{r.location_name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${info.bg}`}>{info.label} {t(r.overall_status)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-lg">{selected.location_name}</h3>
            <span className="text-xs text-slate-400">{t('lastUpdate')}: {selected.updated_at || '—'}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            {INDICATORS.map((ind) => {
              const info = statusInfo(selected[ind.key]);
              const Icon = ind.icon;
              return (
                <div key={ind.key} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-500">{ind.label}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${info.bg}`}>
                    {info.label} {t(selected[ind.key])}
                  </span>
                </div>
              );
            })}
          </div>

          {selected.ai_assessment && (
            <div className="rounded-xl bg-gradient-to-br from-violet-50 to-teal-50 border border-violet-100 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-semibold text-violet-700">AI assessment</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-600">AI estimate</span>
              </div>
              <p className="text-sm text-slate-700">{selected.ai_assessment}</p>
              <p className="text-[11px] text-slate-400 mt-2">AI бағасы — бағдарламалық бағалау, зертханалық өлшем емес.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
