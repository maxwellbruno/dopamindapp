
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
    <div className="min-h-screen bg-navy-blue flex items-center justify-center relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-teal-primary/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="text-center z-10 animate-fade-in-up">
        {/* Brain Logo with Teal Gradient */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-teal-primary rounded-2xl blur-xl opacity-60 animate-teal-glow"></div>
            <div className="relative w-20 h-20 brain-icon shadow-2xl animate-breathe">
              {/* Brain halves */}
              <div className="w-full h-full flex">
                <div className="w-1/2 h-full bg-gradient-to-br from-teal-primary to-button-teal rounded-l-2xl"></div>
                <div className="w-1/2 h-full bg-gradient-to-bl from-teal-primary to-button-teal rounded-r-2xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-white">
            Dopamind
          </span>
        </h1>
        
        <p className="text-lg text-orange-accent mb-8 font-medium">
          Your Digital Wellness Companion
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-teal-primary rounded-full transition-all duration-300 ease-out"
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
              className="w-2 h-2 bg-teal-primary rounded-full animate-gentle-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
