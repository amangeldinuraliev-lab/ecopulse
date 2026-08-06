import { useLang } from '@/lib/i18n';
import { Check } from 'lucide-react';

const LANGS = [
  { code: 'kz', flag: '🇰🇿', label: 'Қаз' },
  { code: 'ru', flag: '🇷🇺', label: 'Рус' },
  { code: 'en', flag: '🇬🇧', label: 'Eng' },
];

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-card border border-teal-500/10">
      {LANGS.map((l) => (
        <button key={l.code} onClick={() => setLang(l.code)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${lang === l.code ? 'bg-teal-700 text-white' : 'text-muted-foreground hover:text-foreground'}`}>
          <span className="mr-1">{l.flag}</span>{l.label}
        </button>
      ))}
    </div>
  );
}