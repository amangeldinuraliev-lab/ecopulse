import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Droplets, Thermometer, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import { statusInfo } from '@/lib/ecoHelpers';

export default function WaterMonitoring() {
  const { t } = useI18n();
  const [readings, setReadings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.WaterMonitoringReading.list();
        setReadings(list);
        if (list.length) setSelected(list[0]);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const center = readings.length ? [readings[0].lat, readings[0].lng] : [44.5, 50.3];

  const metrics = selected ? [
    { key: 'waterTemp', value: selected.water_temp, unit: '°C', icon: Thermometer },
    { key: 'waterPh', value: selected.ph, unit: '', icon: Activity },
    { key: 'waterSalinity', value: selected.salinity, unit: '‰', icon: Droplets },
    { key: 'waterTurbidity', value: selected.turbidity, unit: 'NTU', icon: Activity },
    { key: 'waterDissolvedOxygen', value: selected.dissolved_oxygen, unit: 'mg/L', icon: Activity },
    { key: 'waterChlorophyll', value: selected.chlorophyll, unit: 'µg/L', icon: Activity },
    { key: 'waterLevel', value: selected.water_level, unit: 'cm', icon: Droplets },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Droplets className="w-6 h-6 text-cyan-600" />
        <h1 className="text-2xl font-bold text-slate-900">{t('waterTitle')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-200">
          <MapContainer center={center} zoom={7} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {readings.map((r, i) => {
              const info = statusInfo(r.overall_status);
              return (
                <CircleMarker key={i} center={[r.lat, r.lng]} radius={14}
                  pathOptions={{ color: info.color, fillColor: info.color, fillOpacity: 0.8 }}
                  eventHandlers={{ click: () => setSelected(r) }}>
                  <Popup>{r.location_name}</Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Detail */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {loading ? (
            <div className="text-center text-slate-400 py-12">{t('loading')}</div>
          ) : selected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">{selected.location_name}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo(selected.overall_status).bg}`}>
                  {statusInfo(selected.overall_status).label} {t(selected.overall_status)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
                <span className="text-slate-500">{t('waterQualityScore')}</span>
                <span className="text-3xl font-bold text-teal-600">{selected.water_quality_score}<span className="text-base text-slate-400">/100</span></span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-400 flex items-center gap-1"><m.icon className="w-3.5 h-3.5" /> {t(m.key)}</div>
                    <div className="font-semibold text-slate-800">{m.value}{m.unit ? ` ${m.unit}` : ''}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{t('waterOilPollution')}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${statusInfo(selected.oil_pollution).bg}`}>
                  {statusInfo(selected.oil_pollution).label} {t(selected.oil_pollution)}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>{t('source')}: <span className="font-semibold uppercase">{t('demoData')}</span></span>
                {selected.updated_at && <span>{new Date(selected.updated_at).toLocaleString()}</span>}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">{t('dataUnavailable')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
