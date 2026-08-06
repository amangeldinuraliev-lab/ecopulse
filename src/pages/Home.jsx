import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { computeHealth } from '@/lib/health';
import HealthIndex from '@/components/HealthIndex';
import PollutionBadge from '@/components/PollutionBadge';
import StatCard from '@/components/StatCard';
import { Image } from '@/components/ui/image';
import { Brain, Coins, Siren, MapPin, ArrowRight, Trash2, Users, Wallet, Activity } from 'lucide-react';

const MODULES = [
  { to: '/report', icon: Brain, titleKey: 'mod.smartBeach', descKey: 'mod.smartBeachDesc', grad: 'from-sky-500 to-teal-500' },
  { to: '/cleanup', icon: Coins, titleKey: 'mod.ecoCoin', descKey: 'mod.ecoCoinDesc', grad: 'from-amber-400 to-orange-500' },
  { to: '/sos', icon: Siren, titleKey: 'mod.ecoSos', descKey: 'mod.ecoSosDesc', grad: 'from-rose-500 to-red-600' },
];

export default function Home() {
  const { t } = useLang();
  const [reports, setReports] = useState([]);
  const [cleanups, setCleanups] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.entities.BeachReport.list('-created_date', 6).then(setReports);
    base44.entities.Cleanup.list('-created_date', 300).then(setCleanups);
    base44.entities.SosAlert.list('-created_date', 5).then(setAlerts);
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const health = computeHealth(reports, alerts);
  const verified = cleanups.filter((c) => c.verified);
  const kg = Math.round(verified.reduce((s, c) => s + (c.waste_kg || 0), 0));
  const people = new Set(verified.map((c) => c.user_email || c.user_name)).size;
  const totalCoins = verified.reduce((s, c) => s + (c.coins_awarded || 0), 0);
  const myCoins = verified.filter((c) => user && (c.user_email === user.email || c.user_name === user.full_name))
    .reduce((s, c) => s + (c.coins_awarded || 0), 0);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-900 via-teal-800 to-sky-900 text-white px-7 py-14 md:px-14 md:py-20">
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-teal-200/80">{t('home.badge')}</div>
          <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            {t('home.title1')}<br /><span className="text-teal-300">{t('home.title2')}</span>
          </h1>
          <p className="mt-5 text-teal-50/70 text-base md:text-lg leading-relaxed">{t('home.sub')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/report" className="inline-flex items-center gap-2 bg-white text-teal-900 px-6 py-3 rounded-full font-medium transition-transform hover:-translate-y-0.5">
              {t('home.cta1')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/map" className="inline-flex items-center gap-2 border border-white/25 px-6 py-3 rounded-full transition-colors hover:bg-white/10">
              <MapPin className="w-4 h-4" /> {t('common.openMap')}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[auto_1fr] gap-6 items-center">
        <div className="bg-card rounded-3xl p-8 border border-teal-500/10 flex flex-col items-center">
          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-5">{t('home.health')}</div>
          <HealthIndex score={health.score} band={health.band} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Brain} label={t('home.statsReports')} value={reports.length} />
          <StatCard icon={Trash2} label={t('home.statsWaste')} value={`${kg} кг`} />
          <StatCard icon={Users} label={t('home.statsPeople')} value={people} />
          <StatCard icon={Coins} label={t('home.statsCoins')} value={totalCoins} />
          <div className="col-span-2 md:col-span-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-3xl p-5 border border-amber-300/30 flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 grid place-items-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-[0.14em] text-amber-700/70">{t('home.wallet')}</div>
              <div className="text-2xl font-semibold tracking-tight">{myCoins} <span className="text-amber-600 text-sm font-normal">EcoCoin</span></div>
            </div>
            <Link to="/profile" className="text-sm text-amber-700 inline-flex items-center gap-1">{t('common.viewAll')}<ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        {MODULES.map((m) => (
          <Link key={m.to} to={m.to} className="group bg-card rounded-3xl p-6 border border-teal-500/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-24px_rgba(13,148,136,0.5)]">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${m.grad} grid place-items-center`}>
              <m.icon className="w-5 h-5 text-white" />
            </div>
            <div className="mt-5 font-semibold text-lg tracking-tight">{t(m.titleKey)}</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t(m.descKey)}</p>
            <div className="mt-4 text-sm text-teal-700 inline-flex items-center gap-1.5">
              {t('common.viewAll')} <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">{t('home.latest')}</h2>
            <Link to="/report" className="text-sm text-teal-700">{t('common.viewAll')}</Link>
          </div>
          <div className="space-y-3">
            {reports.slice(0, 4).map((r) => (
              <div key={r.id} className="bg-card rounded-2xl p-3 border border-teal-500/10 flex items-center gap-3">
                <Image src={r.photo_url} className="w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.beach_name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.ai_summary}</div>
                </div>
                <PollutionBadge level={r.pollution_level} />
              </div>
            ))}
            {reports.length === 0 && <div className="bg-card rounded-2xl p-8 text-center text-muted-foreground border border-teal-500/10">—</div>}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight">{t('home.sos')}</h2>
            <Link to="/sos" className="text-sm text-teal-700">{t('common.viewAll')}</Link>
          </div>
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="bg-card rounded-2xl p-4 border border-rose-300/30 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 grid place-items-center shrink-0"><Siren className="w-4 h-4 text-rose-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.location_note || 'EcoSOS'}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{a.ai_analysis}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.status === 'new' ? 'bg-rose-100 text-rose-700' : a.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{a.status}</span>
              </div>
            ))}
            {alerts.length === 0 && <div className="bg-card rounded-2xl p-8 text-center text-muted-foreground border border-teal-500/10">—</div>}
          </div>
        </div>
      </section>
    </div>
  );
}