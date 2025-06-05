
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let success;
      if (isLogin) {
        success = await login(email, password);
        if (!success) {
          setError('Invalid email or password');
        }
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setIsSubmitting(false);
          return;
        }
        success = await register(email, password, name);
        if (!success) {
          setError('Email already exists');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full blur-lg opacity-60 animate-mint-glow"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl">
                <svg 
                  className="w-10 h-10 text-white" 
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
          <h1 className="text-3xl font-bold text-white mb-2">
            Dopamind
          </h1>
          <p className="text-blue-800 text-lg font-medium mb-2">
            {isLogin ? 'Welcome back' : 'Begin your wellness journey'}
          </p>
          <p className="text-emerald-400 text-sm">
            {isLogin ? 'Sign in to continue your progress' : 'Create an account to get started'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="dopamind-card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label 
                  htmlFor="name" 
                  className="text-blue-800 font-semibold text-sm"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required={!isLogin}
                  className="h-12 bg-white border-gray-200 text-blue-800 placeholder:text-gray-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-blue-800 font-semibold text-sm"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-12 bg-white border-gray-200 text-blue-800 placeholder:text-gray-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-blue-800 font-semibold text-sm"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="h-12 bg-white border-gray-200 text-blue-800 placeholder:text-gray-400 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-300"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in-up">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Switch Auth Mode */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-amber-500 hover:text-amber-600 text-sm font-medium transition-colors duration-300 hover:underline"
            >
              {isLogin 
                ? "Don't have an account? Create one" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
