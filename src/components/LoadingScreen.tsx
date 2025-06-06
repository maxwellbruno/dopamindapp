
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
    <div className="min-h-screen bg-deep-blue flex items-center justify-center relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-mint-green/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-warm-orange/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-mint-green/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="text-center z-10 animate-fade-in-up">
        {/* Brain Logo with Mint Gradient */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-mint-green rounded-2xl blur-xl opacity-60 animate-mint-glow"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-mint-green to-mint-green/80 rounded-2xl flex items-center justify-center shadow-2xl animate-breathe">
              {/* Brain icon using rounded rectangles to match the design */}
              <div className="w-12 h-10 relative">
                <div className="absolute left-0 top-0 w-5 h-8 bg-pure-white rounded-l-full"></div>
                <div className="absolute right-0 top-0 w-5 h-8 bg-pure-white rounded-r-full"></div>
                <div className="absolute left-2 top-1 w-1 h-6 bg-deep-blue rounded-full"></div>
                <div className="absolute right-2 top-1 w-1 h-6 bg-deep-blue rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-pure-white">
            Dopamind
          </span>
        </h1>
        
        <p className="text-lg text-warm-orange mb-8 font-medium">
          Your Digital Wellness Companion
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="h-1.5 bg-pure-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-mint-green rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-pure-white/80 mt-3 font-medium">
            Preparing your mindful experience...
          </p>
        </div>

        {/* Subtle breathing animation dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-mint-green rounded-full animate-gentle-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
