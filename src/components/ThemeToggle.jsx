import { useTheme } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button onClick={toggle} aria-label="theme"
      className="w-9 h-9 rounded-full bg-card border border-teal-500/10 grid place-items-center text-muted-foreground hover:text-foreground transition-colors">
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}