import { HEALTH_BANDS } from '@/lib/health';
import { useLang } from '@/lib/i18n';

export default function HealthIndex({ score, band, size = 160 }) {
  const { t } = useLang();
  const b = HEALTH_BANDS[band] || HEALTH_BANDS.moderate;
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" className="text-muted/40" strokeWidth="12" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#g)`} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={off} className="transition-all duration-1000 ease-out" />
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={b.from} />
              <stop offset="100%" stopColor={b.to} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-semibold tracking-tight">{score}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">/ 100</div>
        </div>
      </div>
      <div className="mt-3 px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: b.from }}>
        {t(b.labelKey)}
      </div>
    </div>
  );
}