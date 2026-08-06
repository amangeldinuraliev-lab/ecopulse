export function computeHealth(reports = [], alerts = []) {
  const avgPollution = reports.length
    ? reports.reduce((s, r) => s + (r.pollution_score || 0), 0) / reports.length
    : 50;
  const sevWeight = { low: 2, medium: 5, high: 9, critical: 14 };
  const openAlerts = alerts.filter((a) => a.status !== 'resolved');
  const alertPenalty = Math.min(30, openAlerts.reduce((s, a) => s + (sevWeight[a.severity] || 3), 0));
  const score = Math.max(0, Math.min(100, Math.round(100 - avgPollution * 0.7 - alertPenalty)));
  let band = 'healthy';
  if (score < 30) band = 'critical';
  else if (score < 60) band = 'dangerous';
  else if (score < 90) band = 'moderate';
  return { score, band };
}

export const HEALTH_BANDS = {
  healthy: { from: '#10b981', to: '#059669', labelKey: 'health.healthy' },
  moderate: { from: '#f59e0b', to: '#d97706', labelKey: 'health.moderate' },
  dangerous: { from: '#f97316', to: '#ea580c', labelKey: 'health.dangerous' },
  critical: { from: '#ef4444', to: '#dc2626', labelKey: 'health.critical' },
};