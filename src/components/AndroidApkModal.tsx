import React, { useState } from 'react';
import { Smartphone, Download, Github, CheckCircle, Code, Copy, Check, FileCode, Shield } from 'lucide-react';

export const AndroidApkModal: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyToClipboard = (text: string, fileName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const capacitorConfig = `{
  "appId": "com.ruqyah.saadalghamdi",
  "appName": "الرقية الشرعية - سعد الغامدي",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  }
}`;

  const androidManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.ruqyah.saadalghamdi">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.VIBRATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="الرقية الشرعية - سعد الغامدي"
        android:supportsRtl="true">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const githubActionWorkflow = `name: Build Android APK
on:
  push:
    branches: [ main, master ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/setup-java@v4
        with: { distribution: 'zulu', java-version: '17' }
      - run: |
          npx cap init "الرقية الشرعية" "com.ruqyah.saadalghamdi" --web-dir "dist" || true
          npm i @capacitor/core @capacitor/cli @capacitor/android
          npx cap add android || true
          npx cap sync android
          cd android && chmod +x gradlew && ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: Ruqyah-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/40">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-9 h-9 text-amber-300" />
          </div>
          <div className="text-center sm:text-right space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>جاهز للتحويل المباشر إلى تطبيق Android APK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-['Reem_Kufi']">
              ملفات تكوين بناء تطبيق الأندرويد (Capacitor & WebView)
            </h2>
            <p className="text-xs sm:text-sm text-teal-200 leading-relaxed">
              تم إعداد كافة ملفات التكوين وأذونات AndroidManifest ومجرى البناء التلقائي GitHub Actions لتتمكن من تحويل المشروع إلى تطبيق أندرويد متكامل مجاناً.
            </p>
          </div>
        </div>
      </div>

      {/* Unified Single ZIP Download Card */}
      <div className="space-y-3">
        {/* Copyable Links Bar */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>🚀 رابط ملف ZIP المباشر الجاهز للتحويل إلى APK (قابل للنسخ):</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/ruqyah-apk-ready.zip`}
              className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-teal-600 dark:text-teal-400 font-semibold select-all focus:outline-none"
            />
            <button
              onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/ruqyah-apk-ready.zip`, 'apk_ready_url')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shrink-0 shadow-xs"
            >
              {copiedFile === 'apk_ready_url' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
        </div>

        <a
          href="/ruqyah-apk-ready.zip"
          download="ruqyah-apk-ready.zip"
          className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all border border-teal-400/30"
        >
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full border border-white/30 shadow-xs">
                ✨ جاهز لمحوّلات APK المباشرة (APK Ready Web Assets)
              </span>
              <span className="text-[11px] bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 rounded-full">
                index.html في الجذر مباشرة
              </span>
            </div>
            <h4 className="font-bold text-lg font-['Reem_Kufi'] text-white">
              تحميل ملف APK-Ready المباشر (.zip)
            </h4>
            <p className="text-xs text-teal-100 leading-relaxed">
              يحتوي على ملف <code className="bg-black/20 px-1.5 py-0.5 rounded text-amber-200">index.html</code> في المجلد الرئيسي مباشرة مع الأيقونة والـ Manifest لتوافقيته التامة مع كافة مواقع وبرامج تحويل الويب إلى APK مثل Web2APK و Website 2 APK Builder و WebView.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-2xl transition-all shrink-0 self-end sm:self-center">
            <span className="text-xs font-bold">تحميل الآن</span>
            <Download className="w-6 h-6 group-hover:scale-125 transition-transform" />
          </div>
        </a>


        {/* Individual Download Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="/ruqyah-app-source.zip"
            download="ruqyah-app-source.zip"
            className="bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold border border-slate-200 dark:border-slate-700/70 transition-all"
          >
            <span>الكود المصدري فقط (Source)</span>
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </a>

          <a
            href="/ruqyah-app-dist.zip"
            download="ruqyah-app-dist.zip"
            className="bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold border border-slate-200 dark:border-slate-700/70 transition-all"
          >
            <span>حزمة الويب فقط (Dist Web)</span>
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </a>
        </div>
      </div>

      {/* Step by Step Android Conversion Guide */}

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold font-['Reem_Kufi'] text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Github className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span>طريقة الحصول على ملف الـ APK مجاناً عبر GitHub Actions:</span>
        </h3>

        <ol className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-decimal list-inside pr-2 leading-relaxed">
          <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            قم برفع كود المشروع بالكامل إلى مستودع (Repository) خاص بك في موقع <strong>GitHub</strong>.
          </li>
          <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            سيتعرّف GitHub تلقائياً على ملف <code>.github/workflows/build.yml</code> وسيبدأ بناء تطبيق الـ APK في تبويب <strong>Actions</strong> فوراً وبشكل آلي مجاني.
          </li>
          <li className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
            بعد اكتمال عملية البناء (حوالي دقيقتين)، قم بتحميل الملف من قسم <strong>Artifacts</strong> وتثبيته مباشرة على هاتفك الأندرويد!
          </li>
        </ol>
      </div>

      {/* Code Snippets Section */}
      <div className="space-y-4">
        {/* capacitor.config.json */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              <span>capacitor.config.json</span>
            </span>
            <button
              onClick={() => copyToClipboard(capacitorConfig, 'cap')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              {copiedFile === 'cap' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === 'cap' ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>
          <pre className="bg-slate-950 text-teal-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto dir-ltr text-left">
            {capacitorConfig}
          </pre>
        </div>

        {/* AndroidManifest.xml */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              <span>AndroidManifest.xml</span>
            </span>
            <button
              onClick={() => copyToClipboard(androidManifest, 'manifest')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              {copiedFile === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === 'manifest' ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>
          <pre className="bg-slate-950 text-teal-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto dir-ltr text-left max-h-60">
            {androidManifest}
          </pre>
        </div>

        {/* .github/workflows/build.yml */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              <span>.github/workflows/build.yml</span>
            </span>
            <button
              onClick={() => copyToClipboard(githubActionWorkflow, 'workflow')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              {copiedFile === 'workflow' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === 'workflow' ? 'تم النسخ!' : 'نسخ الكود'}</span>
            </button>
          </div>
          <pre className="bg-slate-950 text-teal-300 p-4 rounded-2xl text-xs font-mono overflow-x-auto dir-ltr text-left max-h-60">
            {githubActionWorkflow}
          </pre>
        </div>
      </div>
    </div>
  );
};
