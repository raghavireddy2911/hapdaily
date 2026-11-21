'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running as standalone app
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    // 2. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((reg) => {
            // Check for updates periodically
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    // New content is available; can reload when convenient
                    console.log('New PWA update available.');
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration error:', err);
          });
      });
    }

    // 3. Listen for Android/Desktop PWA installation prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      (window as any).__hapInstallPrompt = promptEvent;

      // Only show banner if user hasn't explicitly dismissed it in this session
      const hasDismissed = sessionStorage.getItem('hap_pwa_dismissed');
      if (!hasDismissed && !isStandaloneMode) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Listen for appinstalled
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
      setIsStandalone(true);
      sessionStorage.removeItem('hap_pwa_dismissed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show native browser install prompt
    await deferredPrompt.prompt();

    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('hap_pwa_dismissed', 'true');
  };

  // Don't render banner if already installed or prompt unavailable
  if (isStandalone || !showInstallBanner || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 bg-white/95 backdrop-blur-md border border-emerald-200/80 rounded-3xl p-4 shadow-2xl shadow-emerald-950/10 flex items-center justify-between gap-3.5"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-700 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
            HAP
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-black text-gray-950 truncate">Install HAP App</h4>
            <p className="text-[11px] text-gray-500 truncate">
              Fast, fullscreen & works like a native mobile app
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
