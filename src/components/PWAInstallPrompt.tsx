
import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    // Check if user has already dismissed the prompt
    const hasSeenPrompt = localStorage.getItem('dopamind_pwa_prompt_dismissed');
    
    setIsIOS(isIOSDevice);
    
    if (isMobile && !isStandalone && !isInWebAppiOS && !hasSeenPrompt) {
      // Show prompt after a short delay for better UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
        localStorage.setItem('dopamind_pwa_prompt_dismissed', 'installed');
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('dopamind_pwa_prompt_dismissed', 'dismissed');
  };

  const handleMaybeLater = () => {
    setShowPrompt(false);
    // Don't set permanent dismissal, allow showing again after some time
    localStorage.setItem('dopamind_pwa_prompt_shown', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-deep-blue rounded-t-3xl p-6 max-w-sm w-full mx-4 mb-0 shadow-2xl animate-slide-up">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-mint-green to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Smartphone className="text-white" size={24} />
          </div>
          
          <h3 className="text-xl font-bold text-deep-blue dark:text-white mb-2">
            🧘 Mindful Access Awaits
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Install Dopamind for a distraction-free experience. Access your wellness journey instantly, even offline.
          </p>
        </div>

        <div className="space-y-3">
          {isIOS ? (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              To install: Tap <span className="font-semibold">Share</span> → <span className="font-semibold">Add to Home Screen</span>
            </div>
          ) : null}
          
          {!isIOS && deferredPrompt ? (
            <Button
              onClick={handleInstall}
              className="w-full bg-mint-green hover:bg-mint-green/90 text-white font-semibold rounded-2xl py-3 flex items-center justify-center space-x-2"
            >
              <Download size={18} />
              <span>Install App</span>
            </Button>
          ) : null}
          
          <Button
            onClick={handleMaybeLater}
            variant="outline"
            className="w-full border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-2xl py-3"
          >
            Maybe Later
          </Button>
          
          <button
            onClick={handleDismiss}
            className="w-full text-gray-500 dark:text-gray-400 text-sm font-medium py-2"
          >
            Don't show again
          </button>
        </div>
        
        <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400">🌱</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Digital wellness, mindfully crafted
          </span>
          <span className="text-xs text-gray-400">🌱</span>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
