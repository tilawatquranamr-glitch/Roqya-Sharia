import React, { useState } from 'react';
import { Sparkles, RotateCcw, Volume2, VolumeX, Shield, Award, Check } from 'lucide-react';

export const DigitalTasbeeh: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [totalSessionCount, setTotalSessionCount] = useState<number>(0);
  const [target, setTarget] = useState<number>(33);
  const [selectedPhrase, setSelectedPhrase] = useState<string>('سُبْحَانَ اللَّهِ');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const phrases = [
    'سُبْحَانَ اللَّهِ',
    'الْحَمْدُ لِلَّهِ',
    'لاَ إِلَهَ إِلاَّ اللَّهُ',
    'اللَّهُ أَكْبَرُ',
    'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    'لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ',
    'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ'
  ];

  const handleTap = () => {
    const nextCount = count + 1;
    setCount(nextCount);
    setTotalSessionCount(prev => prev + 1);

    // Audio click effect simulation
    if (soundEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(nextCount % target === 0 ? 880 : 520, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } catch (e) {
        // ignore audio context restriction
      }
    }

    // Vibration API if available
    if (navigator.vibrate) {
      navigator.vibrate(nextCount % target === 0 ? [50, 50, 50] : 15);
    }
  };

  const resetCount = () => {
    setCount(0);
  };

  const progressPercent = Math.min(100, Math.round((count / target) * 100));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold font-['Reem_Kufi'] text-slate-800 dark:text-slate-100">
              المسبحة الإلكترونية الرقمية
            </h2>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 border-teal-200 dark:border-teal-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="الصوت والتنبيه"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Phrase Selector Pills */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">اختر الذكر المفضل:</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {phrases.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPhrase(p)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-['Amiri'] font-bold transition-all ${
                  selectedPhrase === p
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Phrase Display */}
        <div className="py-2">
          <p className="font-['Amiri'] text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-300">
            {selectedPhrase}
          </p>
        </div>

        {/* Main Interactive Circular Sebha Counter */}
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 mx-auto flex items-center justify-center">
          {/* Outer SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-100 dark:stroke-slate-800 fill-none"
              strokeWidth="10"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-teal-500 fill-none transition-all duration-200"
              strokeWidth="10"
              strokeDasharray="600"
              strokeDashoffset={600 - (600 * progressPercent) / 100}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Counter Clickable Button */}
          <button
            onClick={handleTap}
            className="absolute inset-4 rounded-full bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 text-white shadow-2xl flex flex-col items-center justify-center group active:scale-95 transition-transform duration-100 border-4 border-teal-500/30"
          >
            <span className="text-4xl sm:text-5xl font-mono font-extrabold text-amber-300 tracking-wider">
              {count}
            </span>
            <span className="text-xs text-teal-200 mt-1 font-semibold">
              الهدف: {target}
            </span>
            <span className="text-[11px] text-teal-300/70 mt-2 font-medium opacity-80 group-hover:opacity-100">
              اضغط للتسبيح
            </span>
          </button>
        </div>

        {/* Target Buttons & Reset */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500">الهدف:</span>
            {[33, 100, 1000].map(t => (
              <button
                key={t}
                onClick={() => setTarget(t)}
                className={`px-2.5 py-1 rounded-xl transition-all ${
                  target === t
                    ? 'bg-teal-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              مجموع الجلسة: <strong className="text-teal-600 dark:text-teal-400 font-mono">{totalSessionCount}</strong>
            </div>

            <button
              onClick={resetCount}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-600 dark:text-slate-300 transition-all"
              title="تصفير العداد"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
