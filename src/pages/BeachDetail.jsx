import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import { statusInfo, todayKey } from '@/lib/ecoHelpers';
import { Image } from '@/components/ui/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

function Stars({ value, onChange, size = 20 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange && onChange(n)}
          className={n <= value ? 'text-amber-400' : 'text-slate-300'}>
          <Star className="w-5 h-5" fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

export default function BeachDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [beach, setBeach] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const b = await base44.entities.Beach.get(id);
      setBeach(b);
      const r = await base44.entities.Review.filter({ beach_id: id }, '-created_date', 100);
      setReviews(r);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [id]);

  const name = (b) => {
    const { lang } = { lang: localStorage.getItem('ecopulse_lang') || 'kk' };
    return b[`name_${lang}`] || b.name;
  };

  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : (beach?.visitor_rating || '—');

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const created = await base44.entities.Review.create({
        beach_id: id,
        beach_name: beach.name,
        author_name: user?.full_name || user?.email || 'Anonymous',
        rating,
        comment: comment.trim(),
        verified: true,
        rewarded: false,
        created_date_key: todayKey(),
      });
      try {
        const res = await base44.functions.invoke('rewardEcoCoin', {
          type: 'review', related_type: 'review', related_id: created.id,
          description: 'Review for ' + beach.name,
        });
        if (res.data && res.data.ok) {
          await base44.entities.Review.update(created.id, { rewarded: true });
          setMsg({ type: 'success', text: t('beachReviewRewardOk') });
        } else if (res.data && res.data.reason === 'limit_reached') {
          setMsg({ type: 'warn', text: t('beachReviewLimit') });
        } else {
          setMsg({ type: 'error', text: res.data?.error || 'Error' });
        }
      } catch (err) {
        setMsg({ type: 'error', text: err.message });
      }
      setComment(''); setRating(5);
      await load();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
    setSubmitting(false);
  };

  if (loading) return <div className="text-center text-slate-400 py-12">{t('loading')}</div>;
  if (!beach) return <div className="text-center text-slate-400 py-12">{t('dataUnavailable')}</div>;

  const attrs = [
    { key: 'beachCleanliness', value: beach.cleanliness },
    { key: 'beachRoadCondition', value: beach.road_condition },
    { key: 'beachSafety', value: beach.safety },
    { key: 'beachNature', value: beach.natural_beauty },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700">
        <ArrowLeft className="w-4 h-4" /> {t('nav.map')}
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="h-48 bg-slate-100">
          {beach.image_url ? <Image src={beach.image_url} fittingType="fill" className="w-full h-full" /> : null}
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{name(beach)}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo(beach.coastal_status).bg}`}>
              {statusInfo(beach.coastal_status).label} {t(beach.coastal_status)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
            <span className="text-lg font-bold text-slate-900">{avg}</span>
            <span className="text-slate-400 text-sm">/ 5 · {reviews.length} {t('beachReviews')}</span>
          </div>
          {beach.district && <div className="text-sm text-slate-500 mt-1">{beach.district}</div>}
          {(beach.description || beach.description_ru || beach.description_en) && (
            <p className="text-slate-600 mt-3">{beach[`description_${localStorage.getItem('ecopulse_lang') || 'kk'}`] || beach.description}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {attrs.map((a, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-xs text-slate-400">{t(a.key)}</div>
                <div className="text-xl font-bold text-slate-800">{a.value || '—'}</div>
                <div className="text-[10px] text-slate-400">/ 5</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1">{t('beachAddReview')}</h2>
        <p className="text-xs text-teal-600 mb-4">{t('beachReviewReward')}</p>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('beachYourRating')}</Label>
            <Stars value={rating} onChange={setRating} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">{t('beachComment')}</Label>
            <Textarea id="comment" rows={3} value={comment} onChange={e => setComment(e.target.value)} required />
          </div>
          {msg && (
            <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : msg.type === 'warn' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
              {msg.text}
            </div>
          )}
          <Button type="submit" disabled={submitting}>{t('beachSubmit')}</Button>
        </form>
      </div>

      {/* Reviews list */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">{t('beachReviews')}</h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">{t('beachNoReviews')}</div>
        ) : (
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{r.author_name || 'Anonymous'}</span>
                    {r.rewarded && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-semibold">+1 ECO</span>}
                  </div>
                  <span className="text-xs text-slate-400">{new Date(r.created_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'text-amber-400' : 'text-slate-300'}`} fill={n <= r.rating ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <p className="text-slate-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
