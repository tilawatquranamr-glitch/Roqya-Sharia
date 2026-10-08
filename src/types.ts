export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  reciter: string;
  duration: string; // e.g. "28:15" or "05:30"
  durationSeconds: number;
  url: string;
  fallbackUrl?: string;
  category: 'full' | 'eye' | 'magic' | 'healing' | 'tranquility' | 'duas';
  description?: string;
}

export interface RuqyahVerse {
  id: string;
  category: 'fatiha_kursi' | 'baqarah' | 'healing' | 'eye_envy' | 'magic' | 'muawwidhat' | 'prophetic_duas';
  categoryTitle: string;
  surahName?: string;
  verseNumber?: string;
  arabicText: string;
  transliteration?: string;
  recommendedRepeats: number;
  benefit?: string;
  audioTimestamp?: number; // seconds into full track
}

export interface DhikrItem {
  id: string;
  text: string;
  repeatCount: number;
  virtue?: string;
  source?: string;
}

export interface AdhkarCategory {
  id: 'morning' | 'evening' | 'sleep' | 'after_prayer';
  title: string;
  iconName: string;
  items: DhikrItem[];
}

export interface RuqyahGuideTopic {
  id: string;
  title: string;
  icon: string;
  content: string[];
  tips?: string[];
}

export type ThemeMode = 'auto' | 'light' | 'dark';
export type ReaderFontFamily = 'naskh' | 'quran' | 'tajawal' | 'amiri';

export interface AppState {
  activeTab: 'audio' | 'written' | 'adhkar' | 'tasbeeh' | 'guide' | 'apk';
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  playbackSpeed: number;
  sleepTimerMinutes: number | null; // null = off
  sleepTimerRemaining: number | null; // seconds
  isRepeatOne: boolean;
  fontSize: number; // 18 to 36px
  readerFont: ReaderFontFamily;
  themeMode: ThemeMode; // 'auto' | 'light' | 'dark'
  bookmarks: string[]; // verse IDs
  readCounts: Record<string, number>; // verseID -> count
  adhkarCounts: Record<string, number>; // dhikrID -> current count
  darkMode: boolean;
}

