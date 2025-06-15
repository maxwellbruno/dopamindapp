import React, { useState, useEffect, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { UserSettings } from './types/settings';
import LoadingScreen from './components/LoadingScreen';
import AuthScreen from './components/AuthScreen';
import BottomNav from './components/BottomNav';
import TopNav from './components/TopNav';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { useIsMobile } from './hooks/use-mobile';
import Home from './pages/Home';
import Focus from './pages/Focus';
import Mood from './pages/Mood';
import MoodEntryDetail from './pages/MoodEntryDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import SubscriptionManager from './pages/SubscriptionManager';
import AllMoodEntries from './pages/AllMoodEntries';
import AllFocusSessions from './pages/AllFocusSessions';
import SoundGenre from './pages/SoundGenre';
import Brainwaves from './pages/Brainwaves';
import BinauralFrequencies from './pages/BinauralFrequencies';
import GuidedMeditation from './pages/GuidedMeditation';
import BrainwaveDetail from './pages/BrainwaveDetail';
import BinauralDetail from './pages/BinauralDetail';
import AISoundscape from './pages/AISoundscape';
import TermsAndConditions from './pages/TermsAndConditions';

const queryClient = new QueryClient();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Immediately apply stored theme before React renders (to avoid FOUC)
(function applyInitialTheme() {
  try {
    const stored = window.localStorage.getItem('dopamind_settings');
    if (stored) {
      const { theme } = JSON.parse(stored);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  } catch {}
})();

const initialSettings: UserSettings = {
  dailyFocusGoal: 120,
  reminderTime: '09:00',
  theme: 'light',
  customAffirmation: 'I am focused and productive'
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [settings, setSettings] = useLocalStorage<UserSettings>('dopamind_settings', initialSettings);

  // Listen for theme changes and update HTML class in real time
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Listen to theme changes across tabs
    function storageHandler(e: StorageEvent) {
      if (e.key === 'dopamind_settings' && e.newValue) {
        try {
          const { theme } = JSON.parse(e.newValue);
          if (theme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        } catch {}
      }
    }
    window.addEventListener('storage', storageHandler);
    return () => window.removeEventListener('storage', storageHandler);
  }, [settings.theme]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <>
        <Routes>
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="*" element={<AuthScreen />} />
        </Routes>
        <PWAInstallPrompt />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray dark:bg-deep-blue">
      <TopNav />
      <main className={isMobile ? "pb-28" : "py-8"}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/focus/all" element={<AllFocusSessions />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/mood/:id" element={<MoodEntryDetail />} />
          <Route path="/mood/all" element={<AllMoodEntries />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/subscription" element={<SubscriptionManager />} />
          <Route path="/sound/:id" element={<SoundGenre />} />
          <Route path="/meditation/brainwaves" element={<Brainwaves />} />
          <Route path="/brainwave/:type" element={<BrainwaveDetail />} />
          <Route path="/meditation/binaural" element={<BinauralFrequencies />} />
          <Route path="/binaural/:hz" element={<BinauralDetail />} />
          <Route path="/meditation/guided" element={<GuidedMeditation />} />
          <Route path="/ai-soundscape" element={<AISoundscape />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav />
      <PWAInstallPrompt />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
