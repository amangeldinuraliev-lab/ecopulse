export const LEVELS = {
  clean: { label: 'Таза', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', hex: '#10b981' },
  medium: { label: 'Орташа', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200', hex: '#f59e0b' },
  dirty: { label: 'Лас', dot: 'bg-rose-500', chip: 'bg-rose-50 text-rose-700 border-rose-200', hex: '#f43f5e' },
};

export default function PollutionBadge({ level }) {
  const l = LEVELS[level] || LEVELS.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${l.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${l.dot}`} />
      {l.label}
    </span>
  );
}