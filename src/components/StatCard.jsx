export default function StatCard({ icon: Icon, label, value, sub, accent = 'text-teal-700' }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-teal-900/5 transition-all duration-300 hover:shadow-[0_12px_40px_-16px_rgba(13,148,136,0.35)]">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-[0.14em] text-slate-400">{label}</div>
        {Icon && <Icon className={`w-4 h-4 ${accent}`} />}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}