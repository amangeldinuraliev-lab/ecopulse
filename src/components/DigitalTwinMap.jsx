import { useState } from 'react';
import { useLang } from '@/lib/i18n';

const B = { minLat: 42.2, maxLat: 47.6, minLng: 49.2, maxLng: 53.2 };
const W = 420, H = 540;
const proj = (lat, lng) => ({ x: ((lng - B.minLng) / (B.maxLng - B.minLng)) * W, y: ((B.maxLat - lat) / (B.maxLat - B.minLat)) * H });

const COLORS = {
  water: '#38bdf8', seal: '#a78bfa', sturgeon: '#fbbf24', oil: '#ef4444', waste: '#f59e0b', sos: '#dc2626', citizen: '#10b981',
};

// құрлық контуры (Каспий шығыс/оңтүстік жағалауы)
const LAND = 'M0,0 L120,0 C108,70 150,120 134,190 C122,250 170,300 154,372 C142,430 178,470 172,540 L420,540 L420,0 Z';

export default function DigitalTwinMap({ layers, onToggle, points, active, onSelect }) {
  const { t } = useLang();
  const [hover, setHover] = useState(null);

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-teal-500/10 bg-gradient-to-b from-sky-100 to-teal-50 dark:from-slate-800 dark:to-slate-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        <rect width={W} height={H} fill="url(#sea)" />
        <defs>
          <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#7dd3fc" />
          </linearGradient>
          <radialGradient id="oilgrad">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* су деңгейі толқындары */}
        {layers.water && [120, 230, 340].map((y, i) => (
          <path key={i} d={`M0,${y} Q60,${y - 12} 120,${y} T240,${y} T360,${y} L420,${y}`} fill="none" stroke={COLORS.water} strokeOpacity="0.4" strokeWidth="2" />
        ))}

        {/* құрлық */}
        <path d={LAND} fill="#f2efe6" className="dark:fill-slate-700" />
        <path d="M120,0 C108,70 150,120 134,190 C122,250 170,300 154,372 C142,430 178,470 172,540" fill="none" stroke="#0f766e" strokeOpacity="0.3" strokeWidth="1.5" />

        {/* бекіре қорығы (аяқшық) */}
        {layers.sturgeon && (
          <ellipse cx={150} cy={150} rx="60" ry="40" fill={COLORS.sturgeon} fillOpacity="0.18" stroke={COLORS.sturgeon} strokeOpacity="0.5" strokeDasharray="5 4" />
        )}

        {/* мұнай дақтары */}
        {layers.oil && points.oil.map((p, i) => { const { x, y } = proj(p.lat, p.lng); return <circle key={i} cx={x} cy={y} r="26" fill="url(#oilgrad)" />; })}

        {/* нүктелер */}
        {layers.waste && points.waste.map((p, i) => { const { x, y } = proj(p.lat, p.lng); return <Dot key={i} x={x} y={y} c={COLORS.waste} p={p} onHover={setHover} onSelect={onSelect} />; })}
        {layers.sos && points.sos.map((p, i) => { const { x, y } = proj(p.lat, p.lng); return <Dot key={i} x={x} y={y} c={COLORS.sos} p={p} onHover={setHover} onSelect={onSelect} big />; })}
        {layers.citizen && points.citizen.map((p, i) => { const { x, y } = proj(p.lat, p.lng); return <Dot key={i} x={x} y={y} c={COLORS.citizen} p={p} onHover={setHover} onSelect={onSelect} />; })}
        {layers.seal && points.seal.map((p, i) => { const { x, y } = proj(p.lat, p.lng); return <Dot key={i} x={x} y={y} c={COLORS.seal} p={p} onHover={setHover} onSelect={onSelect} />; })}
      </svg>

      {/* қабаттар */}
      <div className="absolute top-4 right-4 bg-card/90 backdrop-blur rounded-2xl p-3 border border-teal-500/10 w-44">
        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-2">{t('layers.title')}</div>
        <div className="space-y-1.5">
          {Object.entries(layers).map(([k, v]) => (
            <button key={k} onClick={() => onToggle(k)}
              className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${v ? 'bg-teal-700/10 text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[k] }} />{t('layers.' + k)}</span>
              <span className={`w-7 h-3.5 rounded-full transition-colors relative ${v ? 'bg-teal-600' : 'bg-muted'}`}>
                <span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${v ? 'right-0.5' : 'left-0.5'}`} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {(hover || active) && (
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur rounded-2xl p-4 shadow-lg border border-teal-500/10">
          <div className="flex items-center justify-between gap-3">
            <div className="font-medium text-sm">{(hover || active)?.name}</div>
            {active && <button onClick={() => onSelect(null)} className="text-xs text-muted-foreground">✕</button>}
          </div>
          {(hover || active)?.note && <div className="text-xs text-muted-foreground mt-0.5">{(hover || active).note}</div>}
        </div>
      )}
    </div>
  );
}

function Dot({ x, y, c, p, onHover, onSelect, big }) {
  return (
    <g className="cursor-pointer" onMouseEnter={() => onHover(p)} onMouseLeave={() => onHover(null)} onClick={() => onSelect?.(p)}>
      {big && <circle cx={x} cy={y} r="14" fill={c} opacity="0.18" />}
      <circle cx={x} cy={y} r={big ? 8 : 6} fill={c} stroke="#fff" strokeWidth="2.5" />
    </g>
  );
}