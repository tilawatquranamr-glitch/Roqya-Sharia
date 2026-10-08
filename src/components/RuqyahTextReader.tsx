import React, { useState } from 'react';
import {
  BookOpen, Star, RotateCcw, CheckCircle2, Volume2, Search, Plus, Minus,
  Sparkles, Filter, BookmarkCheck, Share2, Check
} from 'lucide-react';
import { RuqyahVerse, AppState, ReaderFontFamily } from '../types';
import { RUQYAH_VERSES, RUQYAH_AUDIO_TRACKS } from '../data/ruqyahData';

interface RuqyahTextReaderProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const RuqyahTextReader: React.FC<RuqyahTextReaderProps> = ({ appState, setAppState }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedVerseId, setCopiedVerseId] = useState<string | null>(null);

  const fontOptions: { id: ReaderFontFamily; label: string }[] = [
    { id: 'naskh', label: 'خط النسخ الواضح' },
    { id: 'quran', label: 'خط المصحف' },
    { id: 'tajawal', label: 'خط تجوال المريح' },
    { id: 'amiri', label: 'خط الأميري' }
  ];

  const getFontClass = (font: ReaderFontFamily) => {
    switch (font) {
      case 'naskh': return 'font-naskh';
      case 'quran': return 'font-quran';
      case 'tajawal': return 'font-tajawal';
      case 'amiri': return 'font-amiri';
      default: return 'font-naskh';
    }
  };


  const categories = [
    { id: 'all', label: 'الجميع' },
    { id: 'fatiha_kursi', label: 'الفاتحة والكرسي' },
    { id: 'baqarah', label: 'سورة البقرة' },
    { id: 'healing', label: 'آيات الشفاء' },
    { id: 'magic', label: 'إبطال السحر' },
    { id: 'eye_envy', label: 'العين والحسد' },
    { id: 'muawwidhat', label: 'المعوذتان والإخلاص' },
    { id: 'prophetic_duas', label: 'أدعية السنة' }
  ];

  // Increment repeat counter for verse
  const handleVerseTap = (verseId: string, maxTarget: number) => {
    setAppState(prev => {
      const current = prev.readCounts[verseId] || 0;
      const nextCount = current >= maxTarget ? 0 : current + 1;
      return {
        ...prev,
        readCounts: { ...prev.readCounts, [verseId]: nextCount }
      };
    });
  };

  // Reset counter
  const resetVerseCounter = (verseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppState(prev => ({
      ...prev,
      readCounts: { ...prev.readCounts, [verseId]: 0 }
    }));
  };

  // Toggle bookmark
  const toggleBookmark = (verseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppState(prev => {
      const isBookmarked = prev.bookmarks.includes(verseId);
      const updated = isBookmarked
        ? prev.bookmarks.filter(id => id !== verseId)
        : [...prev.bookmarks, verseId];
      return { ...prev, bookmarks: updated };
    });
  };

  // Copy text to clipboard
  const copyText = (text: string, verseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedVerseId(verseId);
    setTimeout(() => setCopiedVerseId(null), 2000);
  };

  // Jump to Audio tab with appropriate track
  const playVerseAudio = (verse: RuqyahVerse) => {
    // Find matching track or default to full
    let targetTrack = RUQYAH_AUDIO_TRACKS[0];
    if (verse.category === 'eye_envy') targetTrack = RUQYAH_AUDIO_TRACKS[1];
    else if (verse.category === 'magic') targetTrack = RUQYAH_AUDIO_TRACKS[2];
    else if (verse.category === 'healing') targetTrack = RUQYAH_AUDIO_TRACKS[3];
    else if (verse.category === 'prophetic_duas') targetTrack = RUQYAH_AUDIO_TRACKS[4];

    setAppState(prev => ({
      ...prev,
      activeTab: 'audio',
      currentTrack: targetTrack,
      isPlaying: true
    }));
  };

  // Filter verses
  const filteredVerses = RUQYAH_VERSES.filter(v => {
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory || (selectedCategory === 'bookmarks' && appState.bookmarks.includes(v.id));
    const matchesSearch = searchQuery.trim() === '' ||
      v.arabicText.includes(searchQuery) ||
      (v.surahName && v.surahName.includes(searchQuery)) ||
      (v.benefit && v.benefit.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Reem_Kufi'] text-slate-800 dark:text-slate-100">
                الرقية الشرعية المكتوبة بالتشكيل
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اقرأ آيات الشفاء والتعويذات مع عداد التكرار والتنقل السهل
              </p>
            </div>
          </div>

          {/* Font Size, Font Style & Bookmark Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Font Style Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold overflow-x-auto no-scrollbar">
              <span className="px-1.5 text-slate-500 shrink-0">الخط:</span>
              {fontOptions.map(font => (
                <button
                  key={font.id}
                  onClick={() => setAppState(prev => ({ ...prev, readerFont: font.id }))}
                  className={`px-2.5 py-1 rounded-xl text-xs whitespace-nowrap transition-all ${
                    appState.readerFont === font.id
                      ? 'bg-teal-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>

            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <span className="px-1.5 text-slate-500">الحجم:</span>
              <button
                onClick={() => setAppState(prev => ({ ...prev, fontSize: Math.max(18, prev.fontSize - 2) }))}
                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-800 dark:text-slate-100 shadow-xs"
                title="تصغير الخط"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center font-mono text-teal-600 dark:text-teal-400 font-bold">
                {appState.fontSize}
              </span>
              <button
                onClick={() => setAppState(prev => ({ ...prev, fontSize: Math.min(38, prev.fontSize + 2) }))}
                className="w-7 h-7 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-800 dark:text-slate-100 shadow-xs"
                title="تكبير الخط"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setSelectedCategory(selectedCategory === 'bookmarks' ? 'all' : 'bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all border ${
                selectedCategory === 'bookmarks'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Star className={`w-4 h-4 ${selectedCategory === 'bookmarks' ? 'fill-current' : ''}`} />
              <span>المفضلة ({appState.bookmarks.length})</span>
            </button>
          </div>

        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث عن سورة، كلمة أو دعاء في الرقية..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {/* Category Filters Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verses List */}
      <div className="space-y-4">
        {filteredVerses.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
              لم يتم العثور على نتائج تطابق خيارات البحث أوالتصفية.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-xs text-teal-600 dark:text-teal-400 font-bold hover:underline"
            >
              عرض جميع الآيات
            </button>
          </div>
        ) : (
          filteredVerses.map(verse => {
            const currentCount = appState.readCounts[verse.id] || 0;
            const isCompleted = currentCount >= verse.recommendedRepeats;
            const isBookmarked = appState.bookmarks.includes(verse.id);

            return (
              <div
                key={verse.id}
                onClick={() => handleVerseTap(verse.id, verse.recommendedRepeats)}
                className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border transition-all duration-200 cursor-pointer ${
                  isCompleted
                    ? 'border-emerald-500/80 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md'
                }`}
              >
                {/* Header Info */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 rounded-full text-xs font-bold font-['Cairo']">
                      {verse.categoryTitle}
                    </span>
                    {verse.surahName && (
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {verse.surahName} {verse.verseNumber && `(${verse.verseNumber})`}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {/* Listen Button */}
                    <button
                      onClick={() => playVerseAudio(verse)}
                      className="p-2 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/40 transition-all"
                      title="استمع للآية بصوت الشيخ سعد الغامدي"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Copy Button */}
                    <button
                      onClick={e => copyText(verse.arabicText, verse.id, e)}
                      className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      title="نسخ النص"
                    >
                      {copiedVerseId === verse.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                    </button>

                    {/* Bookmark Button */}
                    <button
                      onClick={e => toggleBookmark(verse.id, e)}
                      className={`p-2 rounded-xl transition-all ${
                        isBookmarked
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isBookmarked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
                    >
                      <Star className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Quranic Arabic Text */}
                <div className="my-5 text-slate-800 dark:text-slate-100 text-center selection:bg-teal-200 dark:selection:bg-teal-900">
                  <p
                    className={`${getFontClass(appState.readerFont)} font-medium leading-[2.4] tracking-wide`}
                    style={{ fontSize: `${appState.fontSize}px` }}
                  >
                    {verse.arabicText}
                  </p>
                </div>


                {/* Benefit Footnote */}
                {verse.benefit && (
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>فضل وركيزة القراءة:</strong> {verse.benefit}</span>
                  </div>
                )}

                {/* Tap Repetition Counter Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      المستحب قراءته: <strong className="text-teal-600 dark:text-teal-400">{verse.recommendedRepeats} مرات</strong>
                    </span>
                    {currentCount > 0 && (
                      <button
                        onClick={e => resetVerseCounter(verse.id, e)}
                        className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors mr-2"
                        title="إعادة ضبط العداد"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>إعادة</span>
                      </button>
                    )}
                  </div>

                  {/* Tap Badge Button */}
                  <div className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/40'
                      : currentCount > 0
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-teal-500 group-hover:text-white'
                  }`}>
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تمت القراءة ({currentCount}/{verse.recommendedRepeats})</span>
                      </>
                    ) : (
                      <>
                        <span>اضغط للعد ({currentCount}/{verse.recommendedRepeats})</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
