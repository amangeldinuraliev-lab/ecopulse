import { useState } from 'react';
import { LEVELS } from '@/components/PollutionBadge';

// Каспий жағалауы (Қазақстан) шамамен шектері
const B = { minLat: 42.2, maxLat: 47.6, minLng: 49.2, maxLng: 53.2 };
const W = 400, H = 520;

const proj = (lat, lng) => ({
  x: ((lng - B.minLng) / (B.maxLng - B.minLng)) * W,
  y: ((B.maxLat - lat) / (B.maxLat - B.minLat)) * H,
});

export default function EcoMap({ points = [], onSelect }) {
  const [active, setActive] = useState(null);

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-teal-900/10 bg-gradient-to-b from-sky-100 to-teal-50">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
        <path d="M0,0 L118,0 C104,70 150,120 132,190 C118,250 168,300 150,370 C136,430 176,470 168,520 L0,520 Z"
          fill="#bfe3ea" opacity="0.9" />
        <path d="M118,0 C104,70 150,120 132,190 C118,250 168,300 150,370 C136,430 176,470 168,520"
          fill="none" stroke="#0f766e" strokeOpacity="0.35" strokeWidth="1.5" />
        <path d="M118,0 L400,0 L400,520 L168,520 C176,470 136,430 150,370 C168,300 118,250 132,190 C150,120 104,70 118,0 Z"
          fill="#f2efe6" />
        {[100, 200, 300, 400].map((y) => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} stroke="#0f766e" strokeOpacity="0.06" />
        ))}
        {points.map((p, i) => {
          const { x, y } = proj(p.lat, p.lng);
          const hex = (LEVELS[p.level] || LEVELS.medium).hex;
          return (
            <g key={i} onClick={() => { setActive(p); onSelect?.(p); }} className="cursor-pointer">
              <circle cx={x} cy={y} r="16" fill={hex} opacity="0.15" />
              <circle cx={x} cy={y} r="7" fill={hex} stroke="#fff" strokeWidth="2.5" />
            </g>
          );
        })}
      </svg>

      {active && (
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg border border-teal-900/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-semibold">{active.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{active.note}</div>
            </div>
            <span className="text-xs font-semibold" style={{ color: (LEVELS[active.level] || LEVELS.medium).hex }}>
              {(LEVELS[active.level] || LEVELS.medium).label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}