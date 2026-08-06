import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy, Coins } from 'lucide-react';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    base44.entities.Cleanup.filter({ verified: true }, '-created_date', 500).then((list) => {
      const map = {};
      list.forEach((c) => {
        const key = c.user_email || c.user_name || 'Аноним';
        if (!map[key]) map[key] = { name: c.user_name || 'Аноним', coins: 0, kg: 0, count: 0 };
        map[key].coins += c.coins_awarded || 0;
        map[key].kg += c.waste_kg || 0;
        map[key].count += 1;
      });
      setRows(Object.values(map).sort((a, b) => b.coins - a.coins));
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <Trophy className="w-9 h-9 mx-auto text-amber-500" />
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Рейтинг</h1>
        <p className="text-slate-500 mt-2">Ең көп EcoCoin жинаған экоқаһармандар.</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-card rounded-3xl p-10 text-center text-slate-400 border border-teal-900/5">
          Әзірге расталған сенбілік жоқ.
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.name + i}
              className={`flex items-center gap-4 p-5 rounded-3xl border transition-all duration-300 ${i < 3 ? 'bg-gradient-to-r from-amber-50 to-white border-amber-200' : 'bg-card border-teal-900/5'}`}>
              <div className="w-10 text-center text-2xl">{MEDALS[i] || <span className="text-sm text-slate-400">{i + 1}</span>}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{r.name}</div>
                <div className="text-xs text-slate-400">{r.count} сенбілік • {Math.round(r.kg)} кг қоқыс</div>
              </div>
              <div className="flex items-center gap-1.5 text-amber-600 font-semibold">
                <Coins className="w-4 h-4" />{r.coins}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}