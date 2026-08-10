import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { aqiCategory, statusInfo } from '@/lib/ecoHelpers';

const LAYER_DEFS = [
  { key: 'health', label: '🌊 Caspian Health', color: '#0891b2' },
  { key: 'coastline', label: '🏖️ Coastline', color: '#14b8a6' },
  { key: 'air', label: '🌬️ Air Quality', color: '#0ea5e9' },
  { key: 'water', label: '💧 Water', color: '#22d3ee' },
  { key: 'soil', label: '🌱 Soil & Land', color: '#84cc16' },
  { key: 'waste', label: '🗑️ Waste', color: '#64748b' },
  { key: 'seal', label: '🦭 Seal incidents', color: '#3b82f6' },
  { key: 'fish', label: '🐟 Fish incidents', color: '#06b6d4' },
  { key: 'oil', label: '🛢️ Oil spills', color: '#1f2937' },
  { key: 'ecosos', label: '🚨 EcoSOS', color: '#ef4444' },
  { key: 'ecotour', label: '📍 EcoTour', color: '#8b5cf6' },
];

export default function MapPage() {
  const { t } = useI18n();
  const [layers, setLayers] = useState({ health: true, coastline: true, air: true, water: true, soil: true, waste: true, seal: true, fish: true, oil: true, ecosos: true, ecotour: true });
  const [beaches, setBeaches] = useState([]);
  const [air, setAir] = useState([]);
  const [soil, setSoil] = useState([]);
  const [sos, setSos] = useState([]);
  const [tour, setTour] = useState([]);
  const [cleanups, setCleanups] = useState([]);
  const [water, setWater] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [b, a, s, so, to, c, w] = await Promise.all([
          base44.entities.Beach.list(),
          base44.entities.AirQualityReading.list(),
          base44.entities.SoilMonitoringReading.list(),
          base44.entities.EcoSOSReport.list(),
          base44.entities.EcoTourLocation.list(),
          base44.entities.TrashCleanup.list(),
          base44.entities.WaterMonitoringReading.list(),
        ]);
        setBeaches(b); setAir(a); setSoil(s); setSos(so); setTour(to); setCleanups(c); setWater(w);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const toggle = (k) => setLayers((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-6 h-6 text-teal-600" /> {t('mapTitle')}
        </h1>
        <p className="text-sm text-slate-500">Mangistau — Caspian coast</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {LAYER_DEFS.map((l) => (
          <button key={l.key} onClick={() => toggle(l.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${layers[l.key] ? 'bg-white border-slate-300 text-slate-800 shadow-sm' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
            <span className="w-2 h-2 rounded-full inline-block mr-1.5" style={{ background: layers[l.key] ? l.color : '#cbd5e1' }} />
            {l.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-200 h-[600px]">
        <MapContainer center={[43.65, 51.0]} zoom={8} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />

          {layers.coastline && beaches.map((b, i) => (
            <CircleMarker key={`b${i}`} center={[b.lat, b.lng]} radius={10}
              pathOptions={{ color: statusInfo(b.coastal_status).color, fillColor: statusInfo(b.coastal_status).color, fillOpacity: 0.8 }}>
              <Popup>
                <strong>{b.name}</strong><br />{t(b.coastal_status)} · ⭐ {b.visitor_rating || '—'}<br />
                <Link to={`/beach/${b.id}`} className="text-teal-600 font-medium text-xs">{t('beachReviews')} →</Link>
              </Popup>
            </CircleMarker>
          ))}

          {layers.water && water.map((r, i) => (
            <CircleMarker key={`wtr${i}`} center={[r.lat, r.lng]} radius={13}
              pathOptions={{ color: statusInfo(r.overall_status).color, fillColor: statusInfo(r.overall_status).color, fillOpacity: 0.6 }}>
              <Popup><strong>{r.location_name}</strong><br />{t('waterQualityScore')}: {r.water_quality_score}</Popup>
            </CircleMarker>
          ))}

          {layers.air && air.map((r, i) => {
            const c = aqiCategory(r.aqi);
            return (
              <CircleMarker key={`a${i}`} center={[r.lat, r.lng]} radius={14}
                pathOptions={{ color: c.color, fillColor: c.color, fillOpacity: 0.6 }}>
                <Popup><strong>{r.location_name}</strong><br />AQI: {r.aqi} — {t(c.key)}</Popup>
              </CircleMarker>
            );
          })}

          {layers.soil && soil.map((r, i) => {
            const c = statusInfo(r.overall_status);
            return (
              <CircleMarker key={`s${i}`} center={[r.lat, r.lng]} radius={12}
                pathOptions={{ color: c.color, fillColor: c.color, fillOpacity: 0.5 }}>
                <Popup><strong>{r.location_name}</strong><br />{t(r.overall_status)}</Popup>
              </CircleMarker>
            );
          })}

          {layers.ecosos && sos.map((r, i) => (
            <CircleMarker key={`sos${i}`} center={[r.lat, r.lng]} radius={10}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.7 }}>
              <Popup><strong>{r.location_name}</strong><br />{r.type}<br />{r.description}</Popup>
            </CircleMarker>
          ))}

          {layers.waste && cleanups.map((r, i) => (
            <CircleMarker key={`w${i}`} center={[43.65, 51.17]} radius={6}
              pathOptions={{ color: '#64748b', fillColor: '#64748b', fillOpacity: 0.6 }}>
              <Popup>🗑️ {r.location_name || 'Cleanup'}</Popup>
            </CircleMarker>
          ))}

          {layers.ecotour && tour.map((r, i) => (
            <CircleMarker key={`t${i}`} center={[r.lat, r.lng]} radius={10}
              pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.7 }}>
              <Popup><strong>{r.name}</strong><br />⭐ {r.rating || '—'}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-400">Карта OpenStreetMap негізінде. Google Maps-ке ауыстыру үшін VITE_GOOGLE_MAPS_API_KEY керек.</p>
    </div>
  );
}
