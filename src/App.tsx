import React, { useState, useEffect } from 'react';
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
import { useIsMobile } from './hooks/use-mobile';
import Home from './pages/Home';
import Focus from './pages/Focus';
import Mood from './pages/Mood';
import MoodEntryDetail from './pages/MoodEntryDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import SubscriptionManager from './pages/SubscriptionManager';
import AllMoodEntries from './pages/AllMoodEntries';
import SoundGenre from './pages/SoundGenre';

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

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const isMobile = useIsMobile();
  const [settings] = useLocalStorage<UserSettings>('dopamind_settings', {
    dailyFocusGoal: 120,
    reminderTime: '09:00',
    theme: 'light',
    customAffirmation: 'I am focused and productive'
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  if (showLoading) {
    return <LoadingScreen />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-light-gray dark:bg-deep-blue">
      <TopNav />
      <main className={isMobile ? "pb-28" : "py-8"}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/mood/:id" element={<MoodEntryDetail />} />
          <Route path="/mood/all" element={<AllMoodEntries />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/subscription" element={<SubscriptionManager />} />
          <Route path="/sound/:id" element={<SoundGenre />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <BottomNav />
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
