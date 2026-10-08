import React, { useState } from 'react';
import { Download, Smartphone, Check, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If running in standalone mode (already installed), don't show button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
        <Check className="w-3.5 h-3.5" />
        <span>مثبت كتطبيق</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-teal-900/20 active:scale-95 transition-all"
        title="تثبيت التطبيق على جهازك للعمل بدون إنترنت وفي الخلفية"
      >
        <Smartphone className="w-4 h-4" />
        <span>تثبيت التطبيق (PWA)</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-teal-500/40 text-teal-700 dark:text-teal-300 hover:bg-teal-500/10 text-xs sm:text-sm font-medium transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت على آيفون</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 left-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400">تثبيت التطبيق على iPhone / iPad</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                1. اضغط على زر <strong>مشاركة (Share)</strong> في أسفل متصفح Safari.<br />
                2. اختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition"
              >
                تم
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
