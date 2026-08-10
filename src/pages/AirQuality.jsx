import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Wind, Droplets, Thermometer, Navigation } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { aqiCategory } from '@/lib/ecoHelpers';

function PollutantRow({ label, value, unit }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value} <span className="text-xs text-slate-400">{unit}</span></span>
    </div>
  );
}

export default function AirQuality() {
  const { t } = useI18n();
  const [readings, setReadings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.AirQualityReading.list();
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
            <Wind className="w-6 h-6 text-sky-500" /> {t('airQualityTitle')}
          </h1>
          <p className="text-sm text-slate-500">Mangistau — Caspian coast</p>
        </div>
        {isDemo && (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
            {t('demoData')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-[420px]">
          <MapContainer center={[44.0, 51.0]} zoom={7} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap' />
            {readings.map((r, i) => {
              const cat = aqiCategory(r.aqi);
              return (
                <CircleMarker key={i} center={[r.lat, r.lng]} radius={16}
                  pathOptions={{ color: cat.color, fillColor: cat.color, fillOpacity: 0.7 }}
                  eventHandlers={{ click: () => setSelected(r) }}>
                  <Popup>
                    <strong>{r.location_name}</strong><br />AQI: {r.aqi} — {t(cat.key)}
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Detail panel */}
        <div className="space-y-4">
          {loading && <div className="text-slate-400">{t('loading')}</div>}
          {!loading && !readings.length && <div className="text-slate-400">{t('dataUnavailable')}</div>}
          {readings.map((r) => {
            const cat = aqiCategory(r.aqi);
            const active = selected?.id === r.id;
            return (
              <button key={r.id} onClick={() => setSelected(r)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all ${active ? 'border-teal-400 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-800">{r.location_name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                    <span className="text-2xl font-bold" style={{ color: cat.color }}>{r.aqi}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-500">{cat.label} {t(cat.key)} · {t('demoData')}</div>
              </button>
            );
          })}

          {selected && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900">{selected.location_name}</h3>
                <span className="text-xs text-slate-400">{t('lastUpdate')}: {selected.updated_at || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-sky-50 rounded-lg p-2 text-center">
                  <Thermometer className="w-4 h-4 mx-auto text-sky-500" />
                  <div className="text-lg font-bold text-slate-800">{selected.temperature}°</div>
                  <div className="text-[10px] text-slate-400">°C</div>
                </div>
                <div className="bg-teal-50 rounded-lg p-2 text-center">
                  <Navigation className="w-4 h-4 mx-auto text-teal-500" />
                  <div className="text-lg font-bold text-slate-800">{selected.wind_speed}</div>
                  <div className="text-[10px] text-slate-400">m/s {selected.wind_direction || ''}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <Droplets className="w-4 h-4 mx-auto text-blue-500" />
                  <div className="text-lg font-bold text-slate-800">{selected.humidity}</div>
                  <div className="text-[10px] text-slate-400">% ылғал</div>
                </div>
              </div>
              <div className="px-1">
                <PollutantRow label="PM2.5" value={selected.pm25} unit="µg/m³" />
                <PollutantRow label="PM10" value={selected.pm10} unit="µg/m³" />
                <PollutantRow label="CO" value={selected.co} unit="mg/m³" />
                <PollutantRow label="NO₂" value={selected.no2} unit="µg/m³" />
                <PollutantRow label="SO₂" value={selected.so2} unit="µg/m³" />
                <PollutantRow label="O₃" value={selected.o3} unit="µg/m³" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AQI legend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3">AQI</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[['good', 0, 50, '#22c55e'], ['moderate', 51, 100, '#eab308'], ['unhealthy', 101, 150, '#f97316'], ['veryUnhealthy', 151, 200, '#ef4444'], ['hazardous', 201, 300, '#a855f7']].map(([k, lo, hi, c]) => (
            <div key={k} className="rounded-lg p-2 text-center" style={{ background: c + '22' }}>
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: c }} />
              <div className="text-xs font-semibold text-slate-700">{t(k)}</div>
              <div className="text-[10px] text-slate-400">{lo}–{hi}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
