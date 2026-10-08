import React from 'react';
import { HelpCircle, CheckCircle2, UserCheck, Droplets, AlertCircle, ShieldCheck, HeartHandshake } from 'lucide-react';
import { RUQYAH_GUIDE_TOPICS } from '../data/ruqyahData';

export const RuqyahGuide: React.FC = () => {
  const iconsMap: Record<string, any> = {
    CheckCircle2,
    UserCheck,
    Droplets,
    AlertCircle
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/40 relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
            <HelpCircle className="w-7 h-7 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Reem_Kufi']">
              دليل وكيفية تطبيق الرقية الشرعية
            </h2>
            <p className="text-xs sm:text-sm text-teal-200 mt-1">
              إرشادات شرعية موثوقة لرُقية النفس والأهل والأبناء وطرق التداوي الصحيحة
            </p>
          </div>
        </div>
      </div>

      {/* Guide Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {RUQYAH_GUIDE_TOPICS.map(topic => {
          const IconComponent = iconsMap[topic.icon] || ShieldCheck;
          return (
            <div
              key={topic.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 hover:border-teal-400 dark:hover:border-teal-600 transition-all"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-['Cairo'] text-slate-800 dark:text-slate-100">
                  {topic.title}
                </h3>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {topic.content.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {topic.tips && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <p className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>تنبيه هام ومستحب:</span>
                  </p>
                  {topic.tips.map((tip, j) => (
                    <p key={j} className="pr-4">• {tip}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
