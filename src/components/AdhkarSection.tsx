import React, { useState } from 'react';
import { Sun, Moon, Bed, RotateCcw, CheckCircle2, Sparkles, Check } from 'lucide-react';
import { AppState } from '../types';
import { ADHKAR_CATEGORIES } from '../data/ruqyahData';

interface AdhkarSectionProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const AdhkarSection: React.FC<AdhkarSectionProps> = ({ appState, setAppState }) => {
  const [activeAdhkarCategory, setActiveAdhkarCategory] = useState<'morning' | 'evening' | 'sleep'>('morning');

  const currentCategoryObj = ADHKAR_CATEGORIES.find(c => c.id === activeAdhkarCategory) || ADHKAR_CATEGORIES[0];

  const handleDhikrTap = (dhikrId: string, maxRepeat: number) => {
    setAppState(prev => {
      const current = prev.adhkarCounts[dhikrId] || 0;
      const nextCount = current >= maxRepeat ? 0 : current + 1;
      return {
        ...prev,
        adhkarCounts: { ...prev.adhkarCounts, [dhikrId]: nextCount }
      };
    });
  };

  const resetDhikr = (dhikrId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppState(prev => ({
      ...prev,
      adhkarCounts: { ...prev.adhkarCounts, [dhikrId]: 0 }
    }));
  };

  const resetAllCategoryDhikr = () => {
    setAppState(prev => {
      const updatedCounts = { ...prev.adhkarCounts };
      currentCategoryObj.items.forEach(item => {
        updatedCounts[item.id] = 0;
      });
      return { ...prev, adhkarCounts: updatedCounts };
    });
  };

  // Calculate completion percentage
  const totalCategoryItems = currentCategoryObj.items.length;
  const completedCategoryItems = currentCategoryObj.items.filter(
    item => (appState.adhkarCounts[item.id] || 0) >= item.repeatCount
  ).length;
  const percentage = Math.round((completedCategoryItems / totalCategoryItems) * 100);

  return (
    <div className="space-y-6">
      {/* Category Tabs & Overall Progress Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-teal-600 text-white flex items-center justify-center shadow-md">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-['Reem_Kufi'] text-slate-800 dark:text-slate-100">
                أذكار الصباح والمساء والنوم
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                تحصين اليوم والليلة بالأذكار المأثورة
              </p>
            </div>
          </div>

          {/* Reset All Button */}
          <button
            onClick={resetAllCategoryDhikr}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير الأذكار</span>
          </button>
        </div>

        {/* Tab Selection Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { id: 'morning', label: 'أذكار الصباح', icon: Sun, color: 'amber' },
            { id: 'evening', label: 'أذكار المساء', icon: Moon, color: 'indigo' },
            { id: 'sleep', label: 'أذكار النوم', icon: Bed, color: 'teal' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeAdhkarCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdhkarCategory(tab.id as any)}
                className={`p-3 sm:p-4 rounded-2xl border font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20 ring-1 ring-teal-500'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Progress Status Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>نسبة إنجاز {currentCategoryObj.title}:</span>
            <span className="text-teal-600 dark:text-teal-400">{completedCategoryItems} من {totalCategoryItems} ({percentage}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Adhkar Items Grid */}
      <div className="space-y-4">
        {currentCategoryObj.items.map((item, idx) => {
          const currentCount = appState.adhkarCounts[item.id] || 0;
          const isCompleted = currentCount >= item.repeatCount;

          return (
            <div
              key={item.id}
              onClick={() => handleDhikrTap(item.id, item.repeatCount)}
              className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer shadow-sm ${
                isCompleted
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/80 ring-1 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600'
              }`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-3">
                <span className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    التكرار المطلوبة: <strong className="text-teal-600 dark:text-teal-400">{item.repeatCount} مرات</strong>
                  </span>
                  {currentCount > 0 && (
                    <button
                      onClick={e => resetDhikr(item.id, e)}
                      className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dhikr Main Arabic Text */}
              <p className="font-naskh text-lg sm:text-2xl font-medium text-slate-800 dark:text-slate-100 leading-[2.3] text-center py-3">
                {item.text}
              </p>


              {/* Virtue / Benefit */}
              {item.virtue && (
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span><strong>فضل الذكر:</strong> {item.virtue}</span>
                </div>
              )}

              {/* Tap Badge */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <div className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : currentCount > 0
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>مكتمل ({currentCount}/{item.repeatCount})</span>
                    </>
                  ) : (
                    <span>اضغط للتكرار ({currentCount}/{item.repeatCount})</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
