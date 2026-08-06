import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import { Image } from '@/components/ui/image';
import { Coins, MapPin, Trophy, Recycle, Wallet } from 'lucide-react';

export default function Profile() {
  const { t } = useLang();
  const [user, setUser] = useState(null);
  const [cleanups, setCleanups] = useState([]);
  const [rank, setRank] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.Cleanup.list('-created_date', 500).then((all) => {
      setCleanups(all.filter((c) => c.verified));
      const map = {};
      all.filter((c) => c.verified).forEach((c) => {
        const k = c.user_email || c.user_name;
        map[k] = (map[k] || 0) + (c.coins_awarded || 0);
      });
      const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
      const idx = sorted.findIndex(([k]) => k === user?.email || k === user?.full_name);
      setRank(idx >= 0 ? idx + 1 : null);
    });
  }, []);

  const mine = cleanups.filter((c) => user && (c.user_email === user.email || c.user_name === user.full_name));
  const coins = mine.reduce((s, c) => s + (c.coins_awarded || 0), 0);
  const kg = Math.round(mine.reduce((s, c) => s + (c.waste_kg || 0), 0));
  const locations = new Set(mine.map((c) => c.beach_name)).size;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-teal-800 to-sky-900 text-white rounded-3xl p-7 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-white/15 grid place-items-center text-2xl font-semibold">
          {(user?.full_name || 'Eco')[0]}
        </div>
        <div>
          <div className="text-xl font-semibold">{user?.full_name || 'Eco Hero'}</div>
          <div className="text-teal-100/70 text-sm">{user?.email || '—'}</div>
          {rank && <div className="mt-1 inline-flex items-center gap-1.5 text-amber-300 text-sm"><Trophy className="w-4 h-4" />#{rank} {t('profile.rank')}</div>}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 rounded-3xl p-6 border border-amber-300/30">
          <Wallet className="w-6 h-6 text-amber-600" />
          <div className="mt-3 text-3xl font-semibold tracking-tight">{coins}</div>
          <div className="text-xs uppercase tracking-[0.14em] text-amber-700/70 mt-1">{t('profile.coins')}</div>
          <div className="mt-3 text-sm text-muted-foreground">≈ {coins} KZT</div>
          <div className="mt-1 text-[11px] text-amber-700/70">{t('profile.kzt')}</div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-teal-500/10">
          <Recycle className="w-6 h-6 text-teal-600" />
          <div className="mt-3 text-3xl font-semibold tracking-tight">{mine.length}</div>
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground mt-1">{t('profile.history')}</div>
        </div>
        <div className="bg-card rounded-3xl p-6 border border-teal-500/10">
          <MapPin className="w-6 h-6 text-sky-600" />
          <div className="mt-3 text-3xl font-semibold tracking-tight">{locations}</div>
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground mt-1">{t('profile.locations')}</div>
        </div>
      </div>

      <div className="bg-card rounded-3xl p-5 border border-teal-500/10 text-sm text-muted-foreground leading-relaxed">
        💰 {t('profile.walletNote')}
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">{t('profile.history')}</h2>
        {mine.length === 0 ? (
          <div className="bg-card rounded-3xl p-10 text-center text-muted-foreground border border-teal-500/10">Әзірге тазалау жоқ.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {mine.map((c) => (
              <div key={c.id} className="bg-card rounded-3xl border border-teal-500/10 overflow-hidden">
                <div className="flex">
                  <Image src={c.before_url} className="w-1/2 h-28" />
                  <Image src={c.after_url} className="w-1/2 h-28" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{c.beach_name}</div>
                    <div className="text-xs text-muted-foreground">~{c.waste_kg || 0} кг</div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-amber-600 font-semibold text-sm"><Coins className="w-4 h-4" />+{c.coins_awarded}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}