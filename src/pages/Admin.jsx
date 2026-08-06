import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLang } from '@/lib/i18n';
import StatCard from '@/components/StatCard';
import PollutionBadge from '@/components/PollutionBadge';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Users, Trash2, Siren, Activity, FileText, Sheet } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function Admin() {
  const { t } = useLang();
  const [reports, setReports] = useState([]);
  const [cleanups, setCleanups] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    base44.entities.BeachReport.list('-created_date', 500).then(setReports);
    base44.entities.Cleanup.list('-created_date', 500).then(setCleanups);
    base44.entities.SosAlert.list('-created_date', 500).then(setAlerts);
  }, []);

  const weekAgo = Date.now() - 7 * 864e5;
  const recent = reports.filter((r) => new Date(r.created_date).getTime() > weekAgo);
  const older = reports.filter((r) => new Date(r.created_date).getTime() <= weekAgo);
  const avg = (a) => (a.length ? a.reduce((s, r) => s + (r.pollution_score || 0), 0) / a.length : 0);
  const delta = Math.round(avg(recent) - avg(older));

  const verified = cleanups.filter((c) => c.verified);
  const byBeach = {};
  reports.forEach((r) => {
    const k = r.beach_name || 'Белгісіз';
    if (!byBeach[k]) byBeach[k] = { name: k, total: 0, n: 0 };
    byBeach[k].total += r.pollution_score || 0; byBeach[k].n += 1;
  });
  const beaches = Object.values(byBeach).map((b) => ({ ...b, score: Math.round(b.total / b.n) })).sort((a, b) => b.score - a.score);
  const chart = beaches.slice(0, 6).map((b) => ({ name: b.name.replace('Ақтау — ', ''), score: b.score }));

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text('EcoPulse — Әкімдік есебі', 14, 20);
    doc.setFontSize(11);
    let y = 36;
    doc.text(`Бағалау саны: ${reports.length}`, 14, y); y += 8;
    doc.text(`Расталған сенбілік: ${verified.length}`, 14, y); y += 8;
    doc.text(`Жиналған қоқыс: ${Math.round(verified.reduce((s,c)=>s+(c.waste_kg||0),0))} кг`, 14, y); y += 8;
    doc.text(`EcoSOS хабарлама: ${alerts.length} (жаңа: ${alerts.filter(a=>a.status==='new').length})`, 14, y); y += 14;
    doc.setFontSize(14); doc.text('Ең лас жағажайлар:', 14, y); y += 8;
    doc.setFontSize(11);
    beaches.slice(0, 10).forEach((b) => { doc.text(`${b.name} — ${b.score}/100 (${b.n} бағалау)`, 14, y); y += 7; });
    doc.save('ecopulse-report.pdf');
  };

  const exportExcel = () => {
    const rows = [['Жағажай', 'Орташа ластану', 'Бағалау саны']];
    beaches.forEach((b) => rows.push([b.name, b.score, b.n]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ecopulse-beaches.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('admin.title')}</h1>
          <p className="text-muted-foreground mt-2">Жағалау тазалығының жалпы мониторингі.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPdf} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-teal-500/10 text-sm hover:bg-muted transition-colors">
            <FileText className="w-4 h-4 text-rose-600" />{t('admin.exportPdf')}
          </button>
          <button onClick={exportExcel} className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-teal-500/10 text-sm hover:bg-muted transition-colors">
            <Sheet className="w-4 h-4 text-emerald-600" />{t('admin.exportExcel')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label={t('admin.weekly')} value={`${delta > 0 ? '+' : ''}${delta}`} sub={delta > 0 ? 'ластану өсті' : 'ластану азайды'} accent={delta > 0 ? 'text-rose-600' : 'text-emerald-600'} />
        <StatCard icon={Users} label={t('home.statsPeople')} value={new Set(verified.map((c) => c.user_email || c.user_name)).size} />
        <StatCard icon={Trash2} label={t('home.statsWaste')} value={`${Math.round(verified.reduce((s, c) => s + (c.waste_kg || 0), 0))} кг`} sub={`${verified.length} акция`} />
        <StatCard icon={Siren} label="EcoSOS" value={alerts.filter((a) => a.status === 'new').length} sub={`барлығы ${alerts.length}`} accent="text-rose-600" />
      </div>

      <div className="bg-card rounded-3xl p-6 border border-teal-500/10">
        <div className="text-sm font-medium mb-5">{t('admin.byBeach')}</div>
        {chart.length === 0 ? <div className="text-sm text-muted-foreground py-8 text-center">Дерек жоқ.</div> : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-card rounded-3xl border border-teal-500/10 divide-y divide-teal-500/5">
        <div className="p-5 text-sm font-medium">{t('admin.dirtiest')}</div>
        {beaches.length === 0 && <div className="p-5 text-sm text-muted-foreground">Дерек жоқ.</div>}
        {beaches.map((b) => (
          <div key={b.name} className="p-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">{b.name}</div>
              <div className="text-xs text-muted-foreground">{b.n} бағалау</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{b.score}/100</span>
              <PollutionBadge level={b.score > 60 ? 'dirty' : b.score > 25 ? 'medium' : 'clean'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}