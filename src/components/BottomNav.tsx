
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimer, setScrollTimer] = useState<NodeJS.Timeout | null>(null);

  const navItems = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/focus', icon: '🎯', label: 'Focus' },
    { path: '/mood', icon: '😊', label: 'Mood' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];

  // Handle scroll for bottom nav auto-hide
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
      
      const newTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
      
      setScrollTimer(newTimer);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
    };
  }, [scrollTimer]);

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
      isScrolling ? 'transform translate-y-full' : 'transform translate-y-0'
    }`}>
      <div className="mx-4 mb-4">
        <div className="bg-deep-blue rounded-3xl px-4 py-3 shadow-lg">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center py-2 px-4 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'transform scale-110' 
                      : 'hover:scale-105'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-mint-green/20 rounded-2xl"></div>
                  )}
                  
                  <div className={`relative z-10 text-xl mb-1 transition-all duration-300 ${
                    isActive ? 'transform scale-110' : ''
                  }`}>
                    {item.icon}
                  </div>
                  
                  <span className={`relative z-10 text-xs font-semibold transition-all duration-300 ${
                    isActive 
                      ? 'text-warm-orange' 
                      : 'text-pure-white'
                  }`}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-mint-green rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
