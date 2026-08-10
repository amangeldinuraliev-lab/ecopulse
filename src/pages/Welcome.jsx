import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Waves, Wind, Droplets, Sprout, Trash2, LifeBuoy, Camera, Coins, ArrowRight, Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function Welcome() {
  const { t, lang, setLang } = useI18n();

  const features = [
    { icon: Wind, title: t('welcomeF1'), desc: 'AQI · PM2.5 · CO · NO₂', color: 'from-sky-400 to-blue-500' },
    { icon: Droplets, title: t('waterTitle'), desc: 'pH · Salinity · O₂', color: 'from-cyan-500 to-teal-600' },
    { icon: Sprout, title: t('soilCard'), desc: 'Oil impact · Erosion', color: 'from-amber-500 to-green-600' },
    { icon: Coins, title: t('welcomeF2'), desc: '3 ECO = 1 ₸', color: 'from-yellow-400 to-amber-500' },
    { icon: LifeBuoy, title: t('welcomeF3'), desc: t('ecososCard'), color: 'from-red-500 to-rose-600' },
    { icon: Camera, title: t('welcomeF4'), desc: t('ecotourTitle'), color: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-sm">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div className="font-bold text-slate-900 tracking-tight">EcoPulse</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              {['kk', 'ru', 'en'].map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${lang === l ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}>
                  {l === 'kk' ? '🇰🇿 ҚҚ' : l === 'ru' ? '🇷🇺 РУ' : '🇬🇧 EN'}
                </button>
              ))}
            </div>
            <Link to="/login" className="px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-teal-700">{t('welcomeLogin')}</Link>
            <Link to="/register" className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700">{t('welcomeRegister')}</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        <section className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold mb-4">
            <Globe className="w-3.5 h-3.5" /> Mangistau · Caspian coast
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-4">{t('welcomeTitle')}</h1>
          <p className="text-lg text-slate-500 mb-8">{t('welcomeSubtitle')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
              {t('welcomeLogin')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:border-teal-300 transition-all">
              {t('welcomeRegister')}
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${f.color} mb-3`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-bold text-slate-900">{f.title}</div>
              <div className="text-sm text-slate-500 mt-1">{f.desc}</div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 mb-2">EcoPulse</h2>
          <p className="text-slate-500 leading-relaxed">{t('welcomeAbout')}</p>
          <p className="text-xs text-slate-400 mt-4">{t('slogan')}</p>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Waves className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">EcoPulse</span>
          </div>
          <p>{t('slogan')} — Mangistau, Caspian coast</p>
        </div>
      </footer>
    </div>
  );
}
