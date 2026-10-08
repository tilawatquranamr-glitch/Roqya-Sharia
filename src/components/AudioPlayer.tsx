import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, RotateCw, Repeat, Volume2, VolumeX,
  Clock, Download, Sparkles, AlertCircle, ShieldCheck, ListMusic, Gauge, Check,
  HardDriveDownload, Loader2, WifiOff, FolderDown, Trash2, Filter, Info
} from 'lucide-react';
import { AudioTrack, AppState } from '../types';
import { RUQYAH_AUDIO_TRACKS } from '../data/ruqyahData';
import { isTrackCached, cacheTrack, deleteCachedTrack, triggerFileDownload, getCachedTrackBlobUrl } from '../utils/offlineAudio';

interface AudioPlayerProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'جميع المقاطع' },
  { id: 'full', label: 'الرقية الشاملة' },
  { id: 'eye', label: 'العين والحسد' },
  { id: 'magic', label: 'السحر والمس' },
  { id: 'healing', label: 'آيات الشفاء' },
  { id: 'duas', label: 'الأدعية المأثورة' }
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ appState, setAppState }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [showSleepMenu, setShowSleepMenu] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  
  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Offline caching and batch download states
  const [cachedMap, setCachedMap] = useState<Record<string, boolean>>({});
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);
  const [isBatchDownloading, setIsBatchDownloading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; title: string }>({ current: 0, total: 0, title: '' });
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  // Initialize current track if null
  const currentTrack = appState.currentTrack || RUQYAH_AUDIO_TRACKS[0];

  useEffect(() => {
    if (!appState.currentTrack) {
      setAppState(prev => ({ ...prev, currentTrack: RUQYAH_AUDIO_TRACKS[0] }));
    }
    checkAllCachedTracks();
  }, []);

  // Check offline status for all tracks
  const checkAllCachedTracks = async () => {
    const map: Record<string, boolean> = {};
    for (const track of RUQYAH_AUDIO_TRACKS) {
      map[track.id] = await isTrackCached(track.url);
    }
    setCachedMap(map);
  };

  // Sleep timer interval
  useEffect(() => {
    let interval: any = null;
    if (appState.sleepTimerRemaining !== null && appState.sleepTimerRemaining > 0) {
      interval = setInterval(() => {
        setAppState(prev => {
          if (prev.sleepTimerRemaining === null || prev.sleepTimerRemaining <= 1) {
            if (audioRef.current) {
              audioRef.current.pause();
            }
            return {
              ...prev,
              isPlaying: false,
              sleepTimerMinutes: null,
              sleepTimerRemaining: null
            };
          }
          return {
            ...prev,
            sleepTimerRemaining: prev.sleepTimerRemaining - 1
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState.sleepTimerRemaining]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack.durationSeconds);
      setIsLoading(false);
      setAudioError(null);
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleEnded = () => {
      if (appState.isRepeatOne) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        const currentIndex = RUQYAH_AUDIO_TRACKS.findIndex(t => t.id === currentTrack.id);
        const nextTrack = RUQYAH_AUDIO_TRACKS[(currentIndex + 1) % RUQYAH_AUDIO_TRACKS.length];
        setAppState(prev => ({ ...prev, currentTrack: nextTrack, isPlaying: true }));
      }
    };
    const handleError = () => {
      setIsLoading(false);
      if (!usingFallback && currentTrack.fallbackUrl) {
        setUsingFallback(true);
        if (audioRef.current) {
          audioRef.current.src = currentTrack.fallbackUrl;
          audioRef.current.load();
          if (appState.isPlaying) {
            audioRef.current.play().catch(console.warn);
          }
        }
      } else {
        setAudioError('انقر على زر التشغيل للبدء والاستماع إلى الرقية الشرعية.');
      }
    };


    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, appState.isRepeatOne, appState.isPlaying, usingFallback]);

  // Sync playback speed and volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = appState.playbackSpeed;
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [appState.playbackSpeed, volume, isMuted]);

  // Effect to load audio when currentTrack or fallback changes
  useEffect(() => {
    let objectUrlToClean: string | null = null;
    let isCancelled = false;

    const prepareAudioSource = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      const targetUrl = usingFallback && currentTrack.fallbackUrl ? currentTrack.fallbackUrl : currentTrack.url;
      const cachedBlobUrl = await getCachedTrackBlobUrl(targetUrl);

      if (isCancelled) return;

      if (cachedBlobUrl) {
        objectUrlToClean = cachedBlobUrl;
        audio.src = cachedBlobUrl;
      } else {
        audio.src = targetUrl;
      }

      audio.load();
      if (appState.isPlaying) {
        audio.play().catch(err => {
          console.warn('Auto-play prevented or load error:', err);
        });
      }
    };

    prepareAudioSource();

    return () => {
      isCancelled = true;
      if (objectUrlToClean) {
        URL.revokeObjectURL(objectUrlToClean);
      }
    };
  }, [currentTrack.id, usingFallback]);

  // MediaSession API Integration for Background Audio & Lockscreen Controls
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: `${currentTrack.reciter} • ${currentTrack.subtitle}`,
        album: 'الرقية الشرعية - سعد الغامدي',
        artwork: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setAppState(prev => ({ ...prev, isPlaying: true }))).catch(console.error);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setAppState(prev => ({ ...prev, isPlaying: false }));
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', () => {
        skipTime(-10);
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        skipTime(10);
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        const currentIndex = RUQYAH_AUDIO_TRACKS.findIndex(t => t.id === currentTrack.id);
        const prevIndex = (currentIndex - 1 + RUQYAH_AUDIO_TRACKS.length) % RUQYAH_AUDIO_TRACKS.length;
        selectTrack(RUQYAH_AUDIO_TRACKS[prevIndex]);
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        const currentIndex = RUQYAH_AUDIO_TRACKS.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % RUQYAH_AUDIO_TRACKS.length;
        selectTrack(RUQYAH_AUDIO_TRACKS[nextIndex]);
      });
    } catch (e) {
      console.warn('MediaSession error:', e);
    }
  }, [currentTrack]);



  // Handle play / pause toggle
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (appState.isPlaying) {
      audio.pause();
      setAppState(prev => ({ ...prev, isPlaying: false }));
    } else {
      setIsLoading(true);
      setAudioError(null);

      const targetUrl = usingFallback && currentTrack.fallbackUrl ? currentTrack.fallbackUrl : currentTrack.url;
      if (!audio.src || audio.src === '' || audio.src === window.location.href) {
        audio.src = targetUrl;
        audio.load();
      }

      try {
        await audio.play();
        setAppState(prev => ({ ...prev, isPlaying: true }));
        setIsLoading(false);
      } catch (err) {
        console.warn('Initial play failed, trying fallback:', err);
        if (!usingFallback && currentTrack.fallbackUrl) {
          setUsingFallback(true);
          audio.src = currentTrack.fallbackUrl;
          audio.load();
          try {
            await audio.play();
            setAppState(prev => ({ ...prev, isPlaying: true }));
            setIsLoading(false);
            return;
          } catch (e2) {
            console.error('Fallback play failed:', e2);
          }
        }
        setIsLoading(false);
        setAudioError('انقر على زر التشغيل للبدء والاستماع إلى الرقية الشرعية.');
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
    }
  };

  const selectTrack = (track: AudioTrack) => {
    setAppState(prev => ({
      ...prev,
      currentTrack: track,
      isPlaying: true
    }));
    setUsingFallback(false);
    setAudioError(null);
    setCurrentTime(0);

    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.load();
      audioRef.current.play().catch(console.warn);
    }
  };


  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const setSleepTimer = (minutes: number | null) => {
    setShowSleepMenu(false);
    if (minutes === null) {
      setAppState(prev => ({ ...prev, sleepTimerMinutes: null, sleepTimerRemaining: null }));
    } else {
      setAppState(prev => ({
        ...prev,
        sleepTimerMinutes: minutes,
        sleepTimerRemaining: minutes * 60
      }));
    }
  };

  // Download a single MP3 file directly
  const handleDownloadSingleTrack = async (track: AudioTrack) => {
    setDownloadingTrackId(track.id);
    setDownloadNotification(`جاري تنزيل ملف "${track.title}"...`);
    
    await triggerFileDownload(track.url, `${track.title} - الشيخ سعد الغامدي`);
    
    // Also save to cache for offline listening inside app
    await cacheTrack(track.url);
    setCachedMap(prev => ({ ...prev, [track.id]: true }));
    
    setDownloadingTrackId(null);
    setDownloadNotification(`تم تنزيل "${track.title}" بنجاح!`);
    setTimeout(() => setDownloadNotification(null), 4000);
  };

  // Batch download all MP3 tracks to device
  const handleBatchDownloadAllTracks = async () => {
    if (isBatchDownloading) return;
    setIsBatchDownloading(true);
    const total = RUQYAH_AUDIO_TRACKS.length;

    for (let i = 0; i < total; i++) {
      const track = RUQYAH_AUDIO_TRACKS[i];
      setBatchProgress({ current: i + 1, total, title: track.title });
      setDownloadNotification(`جاري تنزيل (${i + 1}/${total}): ${track.title}`);

      // Trigger download
      await triggerFileDownload(track.url, `${i + 1}. ${track.title} - سعد الغامدي`);
      
      // Also cache for offline in-app playback
      await cacheTrack(track.url);
      setCachedMap(prev => ({ ...prev, [track.id]: true }));
      
      // Small delay between downloads for user experience
      await new Promise(r => setTimeout(r, 1200));
    }

    setIsBatchDownloading(false);
    setBatchProgress({ current: total, total, title: '' });
    setDownloadNotification('تم تنزيل جميع المقاطع الصوتية للرقية الشرعية كاملاً بنجاح!');
    setTimeout(() => setDownloadNotification(null), 6000);
  };

  // Cache all tracks for offline playback in-app
  const handleCacheAllForOffline = async () => {
    if (isBatchDownloading) return;
    setIsBatchDownloading(true);
    const total = RUQYAH_AUDIO_TRACKS.length;

    for (let i = 0; i < total; i++) {
      const track = RUQYAH_AUDIO_TRACKS[i];
      setBatchProgress({ current: i + 1, total, title: track.title });
      setDownloadNotification(`جاري حفظ للاستماع بدون إنترنت (${i + 1}/${total}): ${track.title}`);

      await cacheTrack(track.url);
      setCachedMap(prev => ({ ...prev, [track.id]: true }));
      await new Promise(r => setTimeout(r, 300));
    }

    setIsBatchDownloading(false);
    setDownloadNotification('تم حفظ جميع المقاطع للاستماع بدون إنترنت بنجاح!');
    setTimeout(() => setDownloadNotification(null), 5000);
  };

  // Toggle single track offline cache
  const handleToggleCacheTrack = async (e: React.MouseEvent, track: AudioTrack) => {
    e.stopPropagation();
    const isCached = cachedMap[track.id];
    if (isCached) {
      await deleteCachedTrack(track.url);
      setCachedMap(prev => ({ ...prev, [track.id]: false }));
      setDownloadNotification(`تم إزالة "${track.title}" من التخزين المؤقت`);
    } else {
      setDownloadingTrackId(track.id);
      await cacheTrack(track.url);
      setCachedMap(prev => ({ ...prev, [track.id]: true }));
      setDownloadingTrackId(null);
      setDownloadNotification(`تم حفظ "${track.title}" للاستماع بدون إنترنت`);
    }
    setTimeout(() => setDownloadNotification(null), 3000);
  };

  // Filtered tracks list
  const filteredTracks = selectedCategory === 'all'
    ? RUQYAH_AUDIO_TRACKS
    : RUQYAH_AUDIO_TRACKS.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={usingFallback && currentTrack.fallbackUrl ? currentTrack.fallbackUrl : currentTrack.url}
        preload="metadata"
      />

      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-amber-950/90 border border-amber-500/50 text-amber-200 px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-sm animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-2">
            <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold">وضع عدم الاتصال بالإنترنت (أوفلاين) - تعمل المقاطع المحفوظة تلقائياً بدون شبكة</span>
          </div>
        </div>
      )}

      {/* Global Notification Banner */}

      {downloadNotification && (
        <div className="bg-teal-950/90 border border-teal-500/50 text-teal-200 px-4 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 text-sm animate-fade-in backdrop-blur-md">
          <div className="flex items-center gap-2">
            {isBatchDownloading ? (
              <Loader2 className="w-5 h-5 text-teal-400 animate-spin shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="font-semibold">{downloadNotification}</span>
          </div>
          {isBatchDownloading && batchProgress.total > 0 && (
            <span className="bg-teal-800 text-teal-100 text-xs px-2.5 py-1 rounded-full font-mono shrink-0">
              {batchProgress.current} / {batchProgress.total}
            </span>
          )}
        </div>
      )}

      {/* Main Reciter & Player Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/40">
        {/* Islamic Ornament Background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          {/* Reciter Avatar Frame */}
          <div className="relative group shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-tr from-amber-500 to-teal-400 p-1 shadow-2xl">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex flex-col items-center justify-center text-center p-3 relative overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-teal-600/20 backdrop-blur-3xl" />
                <span className="font-['Reem_Kufi'] text-2xl font-bold text-amber-300 z-10">الشيخ</span>
                <span className="font-['Cairo'] text-lg font-bold text-white z-10">سعد الغامدي</span>
                <span className="text-[11px] text-teal-200 mt-1 z-10 font-medium">الرقية الشرعية MP3</span>
              </div>
            </div>

            {/* Audio Wave Animated Rings when playing */}
            {appState.isPlaying && (
              <div className="absolute -inset-2 rounded-2xl border-2 border-teal-400/40 animate-ping pointer-events-none opacity-40" />
            )}
          </div>

          {/* Track Details & Player Controls */}
          <div className="flex-1 w-full text-center md:text-right space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>صوت عالي النقاء والجودة • تشغيل بالخلفية</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-['Reem_Kufi'] text-white">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-teal-200 font-medium mt-1">
                {currentTrack.subtitle} • {currentTrack.reciter}
              </p>
              {currentTrack.description && (
                <p className="text-xs text-slate-300/80 mt-2 line-clamp-2">
                  {currentTrack.description}
                </p>
              )}
            </div>

            {/* Error Banner */}
            {audioError && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
                <span>{audioError}</span>
              </div>
            )}

            {/* Scrubber & Timeline */}
            <div className="space-y-1.5 pt-2">
              <input
                type="range"
                min="0"
                max={duration || currentTrack.durationSeconds}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400 hover:accent-teal-300 transition-all"
              />
              <div className="flex items-center justify-between text-xs text-teal-200 font-mono dir-ltr">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || currentTrack.durationSeconds)}</span>
              </div>
            </div>

            {/* Main Action Control Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-2">
              {/* Skip -10s */}
              <button
                onClick={() => skipTime(-10)}
                className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-teal-200 hover:text-white transition-all ring-1 ring-white/10"
                title="تراجُع 10 ثوانٍ"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Play / Pause Primary Button */}
              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-bold flex items-center justify-center shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all"
                title={appState.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : appState.isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current mr-0.5" />
                )}
              </button>

              {/* Skip +10s */}
              <button
                onClick={() => skipTime(10)}
                className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-teal-200 hover:text-white transition-all ring-1 ring-white/10"
                title="تقديم 10 ثوانٍ"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              {/* Repeat Mode Toggle */}
              <button
                onClick={() => setAppState(prev => ({ ...prev, isRepeatOne: !prev.isRepeatOne }))}
                className={`p-2.5 rounded-full transition-all ring-1 ring-white/10 ${
                  appState.isRepeatOne
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-teal-200'
                }`}
                title={appState.isRepeatOne ? 'تكرار المقطع مفعل' : 'تكرار المقطع غير مفعل'}
              >
                <Repeat className="w-5 h-5" />
              </button>

              {/* Sleep Timer Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  className={`p-2.5 rounded-full transition-all ring-1 ring-white/10 flex items-center gap-1 ${
                    appState.sleepTimerMinutes !== null
                      ? 'bg-teal-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-teal-200'
                  }`}
                  title="مؤقت النوم"
                >
                  <Clock className="w-5 h-5" />
                </button>

                {showSleepMenu && (
                  <div className="absolute bottom-12 left-0 sm:right-0 sm:left-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 w-48 z-30 text-xs space-y-1">
                    <p className="px-3 py-1.5 font-bold text-teal-300 border-b border-slate-800">مؤقت توقيف التشغيل</p>
                    {[15, 30, 45, 60].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setSleepTimer(mins)}
                        className={`w-full text-right px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                          appState.sleepTimerMinutes === mins ? 'bg-teal-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span>بعد {mins} دقيقة</span>
                        {appState.sleepTimerMinutes === mins && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                    <button
                      onClick={() => setSleepTimer(null)}
                      className="w-full text-right px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 font-semibold transition-all"
                    >
                      إيقاف المؤقت
                    </button>
                  </div>
                )}
              </div>

              {/* Speed Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-3 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-teal-200 text-xs font-bold transition-all ring-1 ring-white/10 flex items-center gap-1"
                  title="سرعة التشغيل"
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>{appState.playbackSpeed}x</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-12 left-0 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 w-32 z-30 text-xs space-y-1">
                    {[0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                      <button
                        key={speed}
                        onClick={() => {
                          setAppState(prev => ({ ...prev, playbackSpeed: speed }));
                          setShowSpeedMenu(false);
                        }}
                        className={`w-full text-center px-3 py-1.5 rounded-xl transition-all ${
                          appState.playbackSpeed === speed ? 'bg-teal-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        {speed === 1.0 ? 'عادي (1x)' : `${speed}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Download Current Track Button */}
              <button
                onClick={() => handleDownloadSingleTrack(currentTrack)}
                disabled={downloadingTrackId === currentTrack.id}
                className="p-2.5 rounded-full bg-teal-500/20 hover:bg-teal-500/40 text-teal-200 hover:text-white transition-all ring-1 ring-teal-500/40 flex items-center gap-1.5"
                title="تنزيل الملف الصوتي الحالي MP3"
              >
                {downloadingTrackId === currentTrack.id ? (
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Countdown Banner if Sleep Timer active */}
            {appState.sleepTimerRemaining !== null && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-200 rounded-full text-xs font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>سيتوقف التشغيل خلال {formatTime(appState.sleepTimerRemaining)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Batch Audio Download Header Card */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white rounded-3xl p-6 shadow-md border border-teal-800/60 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <FolderDown className="w-4 h-4" />
            <span>تنزيل شامل لكافة الصوتيات</span>
          </div>
          <h3 className="text-xl font-bold font-['Reem_Kufi'] text-white">
            تحميل جميع مقاطع الرقية الشرعية للشيخ سعد الغامدي (MP3)
          </h3>
          <p className="text-xs text-teal-200/80 max-w-xl">
            يمكنك تحميل كافة الملفات الصوتية المأثورة للرقية الشرعية مباشرة على جهازك، أو حفظها للاستماع التلقائي في التطبيق بدون الحاجة للاتصال بالإنترنت.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          {/* Download All MP3s Button */}
          <button
            onClick={handleBatchDownloadAllTracks}
            disabled={isBatchDownloading}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
          >
            {isBatchDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>جاري تحميل الملفات ({batchProgress.current}/{batchProgress.total})...</span>
              </>
            ) : (
              <>
                <HardDriveDownload className="w-5 h-5" />
                <span>تنزيل جميع الملفات (MP3)</span>
              </>
            )}
          </button>

          {/* Cache All for Offline In-App */}
          <button
            onClick={handleCacheAllForOffline}
            disabled={isBatchDownloading}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-teal-500/40 text-teal-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            title="حفظ كافة الملفات في الذاكرة للعمل بدون شبكة"
          >
            <WifiOff className="w-4 h-4" />
            <span>حفظ للعمل بدون إنترنت</span>
          </button>
        </div>
      </div>

      {/* Playlist & Category Filter Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-lg font-bold font-['Reem_Kufi'] text-slate-800 dark:text-slate-100">
              قائمة المقاطع حسب الفئة ({filteredTracks.length})
            </h3>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Track List Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTracks.map((track, idx) => {
            const isCurrent = currentTrack.id === track.id;
            const isCached = !!cachedMap[track.id];
            const isDownloadingThis = downloadingTrackId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => selectTrack(track)}
                className={`group p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isCurrent
                    ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 dark:border-teal-500/60 shadow-sm ring-1 ring-teal-500/30'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                      isCurrent
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {isCurrent && appState.isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          <span className="w-1 bg-white animate-[bounce_0.6s_infinite_100ms] h-full" />
                          <span className="w-1 bg-white animate-[bounce_0.6s_infinite_300ms] h-3" />
                          <span className="w-1 bg-white animate-[bounce_0.6s_infinite_200ms] h-full" />
                        </div>
                      ) : (
                        <span>0{idx + 1}</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className={`text-sm font-bold font-['Cairo'] truncate ${
                        isCurrent ? 'text-teal-900 dark:text-teal-200' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {track.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {track.subtitle} • {track.duration}
                      </p>
                    </div>
                  </div>

                  {/* Play Indicator Circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCurrent ? 'bg-teal-600 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-teal-600 group-hover:text-white'
                  }`}>
                    {isCurrent && appState.isPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current mr-0.5" />
                    )}
                  </div>
                </div>

                {/* Track Bottom Action Controls: Offline & Single Download Buttons */}
                <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/80 pt-3 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Offline Saved Badge */}
                    {isCached && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>محفوظ بدون إنترنت</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Toggle Cache for Offline */}
                    <button
                      onClick={(e) => handleToggleCacheTrack(e, track)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 text-xs"
                      title={isCached ? 'حذف من التخزين المؤقت' : 'حفظ للاستماع بدون إنترنت'}
                    >
                      {isCached ? (
                        <>
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span className="hidden sm:inline">إزالة الأوفلاين</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>حفظ أوفلاين</span>
                        </>
                      )}
                    </button>

                    {/* Direct Single MP3 Download Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadSingleTrack(track);
                      }}
                      disabled={isDownloadingThis}
                      className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all flex items-center gap-1 text-xs shadow-sm"
                      title="تنزيل ملف MP3 إلى الجهاز"
                    >
                      {isDownloadingThis ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>تنزيل MP3</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
