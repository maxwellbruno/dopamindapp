
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: '🏠', label: 'Home', gradient: 'from-serenity-blue to-mindful-mint' },
    { path: '/focus', icon: '🎯', label: 'Focus', gradient: 'from-serenity-blue to-lavender-haze' },
    { path: '/mood', icon: '😊', label: 'Mood', gradient: 'from-lavender-haze to-tranquil-green' },
    { path: '/profile', icon: '👤', label: 'Profile', gradient: 'from-mindful-mint to-tranquil-green' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4">
        <div className="glass-card rounded-3xl px-4 py-3 neuro-shadow">
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
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} rounded-2xl opacity-20`}></div>
                  )}
                  
                  <div className={`relative z-10 text-xl mb-1 transition-all duration-300 ${
                    isActive ? 'transform scale-110' : ''
                  }`}>
                    {item.icon}
                  </div>
                  
                  <span className={`relative z-10 text-xs font-semibold transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent` 
                      : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                  
                  {isActive && (
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r ${item.gradient} rounded-full`}></div>
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
