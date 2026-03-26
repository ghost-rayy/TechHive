import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPwaModal: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Handle Android/Chrome prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show modal after a short delay to not annoy the user immediately
      const timer = setTimeout(() => setShowModal(true), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show iOS guide if not standalone after delay
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => setShowModal(true), 3000);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  if (isStandalone || !showModal) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 pb-8 md:inset-auto md:right-8 md:bottom-8 md:max-w-sm animate-in slide-in-from-bottom duration-500">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-violet-600/20 blur-3xl rounded-full group-hover:bg-violet-600/30 transition-colors" />
        
        <button 
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/20">
            <Download className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg leading-tight">Install TechHive App</h3>
            <p className="text-zinc-400 text-sm mt-1">Get the best shopping experience right from your home screen.</p>
          </div>
        </div>

        <div className="mt-6">
          {isIOS ? (
            <div className="space-y-4">
              <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                <p className="text-zinc-300 text-sm flex flex-wrap items-center gap-2">
                  1. Tap the <Share size={18} className="text-violet-400" /> Share button
                </p>
                <p className="text-zinc-300 text-sm mt-3 flex flex-wrap items-center gap-2">
                  2. Scroll down and tap <PlusSquare size={18} className="text-violet-400" /> <strong>"Add to Home Screen"</strong>
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-all"
              >
                Got it
              </button>
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium shadow-lg shadow-violet-600/25 transition-all transform active:scale-95"
            >
              Install Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallPwaModal;
