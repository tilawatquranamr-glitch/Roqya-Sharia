import React, { useState, useEffect } from 'react';
import { NavbarHeader } from './components/NavbarHeader';
import { AudioPlayer } from './components/AudioPlayer';
import { RuqyahTextReader } from './components/RuqyahTextReader';
import { AdhkarSection } from './components/AdhkarSection';
import { DigitalTasbeeh } from './components/DigitalTasbeeh';
import { RuqyahGuide } from './components/RuqyahGuide';
import { AndroidApkModal } from './components/AndroidApkModal';
import { AppState, ThemeMode, ReaderFontFamily } from './types';
import { RUQYAH_AUDIO_TRACKS } from './data/ruqyahData';
import { Volume2, Play, Pause, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  // Load state from localStorage if available
  const [appState, setAppState] = useState<AppState>(() => {
    const savedBookmarks = localStorage.getItem('ruqyah_bookmarks');
    const savedReadCounts = localStorage.getItem('ruqyah_read_counts');
    const savedAdhkarCounts = localStorage.getItem('ruqyah_adhkar_counts');
    const savedFontSize = localStorage.getItem('ruqyah_font_size');
    const savedThemeMode = (localStorage.getItem('ruqyah_theme_mode') as ThemeMode) || 'auto';
    const savedReaderFont = (localStorage.getItem('ruqyah_reader_font') as ReaderFontFamily) || 'naskh';

    // Calculate initial dark mode
    const systemPrefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentHour = new Date().getHours();
    const isNightTime = currentHour >= 18 || currentHour < 6;
    const initialDarkMode = savedThemeMode === 'dark' || (savedThemeMode === 'auto' && (systemPrefersDark || isNightTime));

    return {
      activeTab: 'audio',
      currentTrack: RUQYAH_AUDIO_TRACKS[0],
      isPlaying: false,
      playbackSpeed: 1.0,
      sleepTimerMinutes: null,
      sleepTimerRemaining: null,
      isRepeatOne: false,
      fontSize: savedFontSize ? parseInt(savedFontSize, 10) : 22,
      readerFont: savedReaderFont,
      themeMode: savedThemeMode,
      bookmarks: savedBookmarks ? JSON.parse(savedBookmarks) : [],
      readCounts: savedReadCounts ? JSON.parse(savedReadCounts) : {},
      adhkarCounts: savedAdhkarCounts ? JSON.parse(savedAdhkarCounts) : {},
      darkMode: initialDarkMode
    };
  });

  // Handle Theme Mode changes (Auto / Light / Dark)
  useEffect(() => {
    const mode = appState.themeMode;
    localStorage.setItem('ruqyah_theme_mode', mode);

    const updateTheme = () => {
      let isDark = false;
      if (mode === 'dark') {
        isDark = true;
      } else if (mode === 'light') {
        isDark = false;
      } else {
        // Auto Mode: check system dark mode or time of day (6 PM - 6 AM)
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentHour = new Date().getHours();
        const isNight = currentHour >= 18 || currentHour < 6;
        isDark = systemDark || isNight;
      }

      setAppState(prev => prev.darkMode === isDark ? prev : { ...prev, darkMode: isDark });

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    if (mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = () => updateTheme();
      mediaQuery.addEventListener('change', handleMediaChange);

      // Check hourly for automatic night/day transition
      const interval = setInterval(updateTheme, 60000);

      return () => {
        mediaQuery.removeEventListener('change', handleMediaChange);
        clearInterval(interval);
      };
    }
  }, [appState.themeMode]);

  // Save font preferences
  useEffect(() => {
    localStorage.setItem('ruqyah_reader_font', appState.readerFont);
  }, [appState.readerFont]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('ruqyah_bookmarks', JSON.stringify(appState.bookmarks));
  }, [appState.bookmarks]);

  useEffect(() => {
    localStorage.setItem('ruqyah_read_counts', JSON.stringify(appState.readCounts));
  }, [appState.readCounts]);

  useEffect(() => {
    localStorage.setItem('ruqyah_adhkar_counts', JSON.stringify(appState.adhkarCounts));
  }, [appState.adhkarCounts]);

  useEffect(() => {
    localStorage.setItem('ruqyah_font_size', appState.fontSize.toString());
  }, [appState.fontSize]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-['Cairo',sans-serif] flex flex-col transition-colors duration-200">
      {/* Top Sticky Header */}
      <NavbarHeader appState={appState} setAppState={setAppState} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-20">
        {appState.activeTab === 'audio' && (
          <AudioPlayer appState={appState} setAppState={setAppState} />
        )}

        {appState.activeTab === 'written' && (
          <RuqyahTextReader appState={appState} setAppState={setAppState} />
        )}

        {appState.activeTab === 'adhkar' && (
          <AdhkarSection appState={appState} setAppState={setAppState} />
        )}

        {appState.activeTab === 'tasbeeh' && (
          <DigitalTasbeeh />
        )}

        {appState.activeTab === 'guide' && (
          <RuqyahGuide />
        )}

        {appState.activeTab === 'apk' && (
          <AndroidApkModal />
        )}
      </main>

      {/* Mini Floating Bottom Bar when listening on other tabs */}
      {appState.currentTrack && appState.activeTab !== 'audio' && (
        <div className="fixed bottom-3 right-3 left-3 sm:right-6 sm:left-auto sm:max-w-md z-50 bg-slate-900/95 text-white backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center justify-between gap-3 animate-slide-up">
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer"
            onClick={() => setAppState(prev => ({ ...prev, activeTab: 'audio' }))}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold font-['Cairo'] truncate text-teal-200">
                {appState.currentTrack.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {appState.currentTrack.reciter}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setAppState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
              className="p-2.5 rounded-full bg-teal-500 text-slate-950 font-bold hover:scale-105 transition-all shadow-md"
              title={appState.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {appState.isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current mr-0.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-['Reem_Kufi'] text-sm font-bold text-teal-700 dark:text-teal-400">
            تطبيق الرقية الشرعية المأثورة • بصوت الشيخ سعد الغامدي
          </p>
          <p className="flex items-center justify-center gap-1">
            <span>تم تطويره بنية الشفاء والخير والبركة لجميع المسلمين</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          </p>
        </div>
      </footer>
    </div>
  );
}
