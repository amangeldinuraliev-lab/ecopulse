import { Outlet, Link, useLocation } from 'react-router-dom';
import { useLang } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import { Waves, Map, Camera, Recycle, Trophy, Siren, LayoutDashboard, User, Compass, Users } from 'lucide-react';

const NAV = [
  { to: '/', key: 'nav.home', icon: Waves },
  { to: '/map', key: 'nav.map', icon: Map },
  { to: '/report', key: 'nav.report', icon: Camera },
  { to: '/cleanup', key: 'nav.cleanup', icon: Recycle },
  { to: '/leaderboard', key: 'nav.leaderboard', icon: Trophy },
  { to: '/ecotour', key: 'nav.ecotour', icon: Compass },
  { to: '/community', key: 'nav.community', icon: Users },
  { to: '/sos', key: 'nav.sos', icon: Siren },
  { to: '/profile', key: 'nav.profile', icon: User },
  { to: '/admin', key: 'nav.admin', icon: LayoutDashboard },
];

export default function Layout() {
  const { t } = useLang();
  const { pathname } = useLocation();
  const top = NAV.slice(0, 7);
  const bottom = NAV.slice(7);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-teal-500/10">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-400 to-sky-600 grid place-items-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none hidden sm:block">
              <div className="font-semibold tracking-tight">EcoPulse</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-teal-700/60">Caspian Twin</div>
            </div>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {top.map((n) => (
              <Link key={n.to} to={n.to} className={`px-3 py-2 rounded-full text-sm transition-all ${pathname === n.to ? 'bg-teal-700 text-white' : 'text-muted-foreground hover:bg-teal-700/5 hover:text-foreground'}`}>{t(n.key)}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8 pb-28 lg:pb-16">
        <Outlet />
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/90 backdrop-blur-xl border-t border-teal-500/10 px-1 py-1.5 flex justify-between overflow-x-auto">
        {NAV.map((n) => {
          const A = n.icon;
          const active = pathname === n.to;
          return (
            <Link key={n.to} to={n.to} className={`flex-1 min-w-[52px] flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${active ? 'text-teal-600' : 'text-muted-foreground'}`}>
              <A className="w-5 h-5" />
              <span className="text-[9px] font-medium whitespace-nowrap">{t(n.key)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}