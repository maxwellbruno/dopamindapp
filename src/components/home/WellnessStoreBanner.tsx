import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const WellnessStoreBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/store')}
      className="w-full group relative overflow-hidden rounded-3xl p-6 text-left animate-fade-in-up transition-transform hover:scale-[1.01]"
      style={{ animationDelay: '0.25s' }}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-deep-blue via-mint-green to-emerald-500 dark:from-background dark:via-card dark:to-background" />
      <div className="absolute inset-0 bg-gradient-to-br from-deep-blue/90 to-mint-green/80 dark:from-foreground/20 dark:to-mint-green/30" />

      {/* Decorative glow */}
      <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -right-4 -bottom-10 w-32 h-32 bg-mint-green/20 rounded-full blur-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white drop-shadow-sm">
              Wellness Store
            </h3>
            <p className="text-sm text-white/90 mt-0.5">
              Teas, supplements & mindful essentials
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white font-semibold bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 group-hover:bg-white/30 transition-colors flex-shrink-0">
          <span className="text-sm hidden sm:inline">Shop now</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </button>
  );
};

export default WellnessStoreBanner;
