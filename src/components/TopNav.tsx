
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain } from 'lucide-react';

const TopNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/focus', label: 'Focus' },
    { path: '/mood', label: 'Mood' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <header className="hidden md:flex bg-white dark:bg-deep-blue shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/home" className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-mint-green" />
            <span className="text-xl font-bold text-deep-blue dark:text-white">Dopamind</span>
          </Link>
          <nav className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-base font-medium transition-colors relative ${
                    isActive
                      ? 'text-deep-blue dark:text-white'
                      : 'text-cool-gray dark:text-gray-300 hover:text-deep-blue dark:hover:text-pure-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-mint-green rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
