
import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 flex items-center justify-center relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="text-center z-10 animate-fade-in-up">
        {/* Brain Logo with Mint Glow Effect */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-60 animate-mint-glow"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl animate-breathe">
              <svg 
                className="w-12 h-12 text-white drop-shadow-lg" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm3 13.5V16h-6v-.5C7.01 14.07 6 11.66 6 9c0-3.31 2.69-6 6-6s6 2.69 6 6c0 2.66-1.01 5.07-3 6.5z"/>
                <circle cx="10" cy="9" r="1"/>
                <circle cx="14" cy="9" r="1"/>
                <path d="M12 11c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-white">
            Dopamind
          </span>
        </h1>
        
        <p className="text-lg text-amber-400 mb-8 font-medium">
          Your Digital Wellness Companion
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-blue-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-white/80 mt-3 font-medium">
            Preparing your mindful experience...
          </p>
        </div>

        {/* Subtle breathing animation dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-emerald-400 rounded-full animate-gentle-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
