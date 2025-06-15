
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import AuthScreen from './components/AuthScreen';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Focus from './pages/Focus';
import Mood from './pages/Mood';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import SubscriptionManager from './pages/SubscriptionManager';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
    <div className="min-h-screen bg-light-gray">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/mood" element={<Mood />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/subscription" element={<SubscriptionManager />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
