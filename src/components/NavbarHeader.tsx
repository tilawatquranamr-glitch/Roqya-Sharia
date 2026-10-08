import React, { useState } from 'react';
import { Volume2, BookOpen, Sun, Moon, Sparkles, HelpCircle, Smartphone, Monitor, ChevronDown } from 'lucide-react';
import { AppState, ThemeMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarHeaderProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({ appState, setAppState }) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const setThemeMode = (mode: ThemeMode) => {
    setAppState(prev => ({ ...prev, themeMode: mode }));
    setShowThemeMenu(false);
  };

  const navItems = [
    { id: 'audio', label: 'الرقية المسموعة', icon: Volume2 },
    { id: 'written', label: 'الرقية المكتوبة', icon: BookOpen },
    { id: 'adhkar', label: 'أذكار التحصين', icon: Sun },
    { id: 'tasbeeh', label: 'المسبحة الإلكترونية', icon: Sparkles },
    { id: 'guide', label: 'دليل الرقية', icon: HelpCircle },
    { id: 'apk', label: 'تطبيق APK', icon: Smartphone }
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-teal-100 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-teal-700/20 ring-2 ring-teal-500/30">
              <span className="font-['Reem_Kufi'] text-xl font-bold">رقية</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 font-['Reem_Kufi'] leading-tight flex items-center gap-1.5">
                الرقية الشرعية
                <span className="inline-block px-2 py-0.5 text-xs bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 rounded-full font-['Cairo'] font-medium">
                  سعد الغامدي
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                حصن المسلم بالقرآن والسنة المطهرة
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <PWAInstallButton />

            {/* Theme Mode Selector Menu */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700"
                title="تغيير الوضع (تلقائي / فاتح / داكن)"
                aria-label="خيارات المظهر والوضع الليلي"
              >
                {appState.themeMode === 'auto' && (
                  <>
                    <Monitor className="w-4 h-4 text-teal-500" />
                    <span className="hidden sm:inline">تلقائي</span>
                  </>
                )}
                {appState.themeMode === 'dark' && (
                  <>
                    <Moon className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">داكن</span>
                  </>
                )}
                {appState.themeMode === 'light' && (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline">فاتح</span>
                  </>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showThemeMenu && (
                <div className="absolute left-0 mt-2 w-44 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 text-xs font-medium animate-fade-in">
                  <div className="px-2 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 mb-1">
                    إعدادات المظهر
                  </div>
                  <button
                    onClick={() => setThemeMode('auto')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                      appState.themeMode === 'auto'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-teal-500" />
                      <span>ليلي تلقائي (النظام)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                      appState.themeMode === 'dark'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-amber-400" />
                      <span>الوضع الداكن (الليلي)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setThemeMode('light')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                      appState.themeMode === 'light'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>الوضع الفاتح (النهاري)</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}

        <nav className="flex space-x-1 space-x-reverse overflow-x-auto no-scrollbar py-2 border-t border-slate-100 dark:border-slate-800/80">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = appState.activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAppState(prev => ({ ...prev, activeTab: item.id }))}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30 ring-1 ring-teal-500'
                    : 'text-slate-600 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
