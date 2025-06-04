
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
    <div className="min-h-screen bg-gradient-to-br from-cloud-white via-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-serenity-blue to-mindful-mint rounded-3xl flex items-center justify-center mr-4 neuro-shadow">
              <div className="text-2xl">🧠</div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-midnight-slate to-gray-700 bg-clip-text text-transparent">
              Dopamind
            </h1>
          </div>
          <p className="text-slate-600 text-lg font-medium mb-2">
            {isLogin ? 'Welcome back' : 'Begin your wellness journey'}
          </p>
          <p className="text-slate-500 text-sm">
            {isLogin ? 'Sign in to continue your progress' : 'Create an account to get started'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="glass-card rounded-3xl p-8 neuro-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label 
                  htmlFor="name" 
                  className="text-slate-700 font-semibold text-sm"
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
                  className="h-12 bg-slate-50 border-zen-ash text-midnight-slate placeholder:text-slate-400 rounded-2xl focus:border-lavender-haze focus:ring-lavender-haze/20 transition-all duration-300"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-slate-700 font-semibold text-sm"
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
                className="h-12 bg-slate-50 border-zen-ash text-midnight-slate placeholder:text-slate-400 rounded-2xl focus:border-lavender-haze focus:ring-lavender-haze/20 transition-all duration-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-slate-700 font-semibold text-sm"
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
                className="h-12 bg-slate-50 border-zen-ash text-midnight-slate placeholder:text-slate-400 rounded-2xl focus:border-lavender-haze focus:ring-lavender-haze/20 transition-all duration-300"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-in-up">
                <p className="text-red-600 text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-serenity-blue hover:bg-blue-400 text-midnight-slate font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed neuro-shadow"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-midnight-slate/30 border-t-midnight-slate rounded-full animate-spin"></div>
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
              className="text-slate-600 hover:text-lavender-haze text-sm font-medium transition-colors duration-300 hover:underline"
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
          <p className="text-slate-400 text-xs">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
