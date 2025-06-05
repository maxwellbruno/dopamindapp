
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-light-mint flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header with app icon */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-mint-green/20 rounded-3xl blur-xl"></div>
              <div className="relative w-16 h-16 bg-mint-green/20 rounded-3xl flex items-center justify-center">
                <span className="text-4xl">🧠</span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-deep-blue mb-1 tracking-wide">Dopamind</h1>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-deep-blue mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Sign in to continue your progress' : 'Join thousands improving their digital wellness'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="dopamind-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-deep-blue font-medium text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 border-mint-green focus:border-mint-green focus:ring-mint-green/20 rounded-xl bg-gray-50"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-deep-blue font-medium text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border-mint-green focus:border-mint-green focus:ring-mint-green/20 rounded-xl bg-gray-50"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-deep-blue font-medium text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 border-mint-green focus:border-mint-green focus:ring-mint-green/20 rounded-xl bg-gray-50"
                required
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-mint-green hover:bg-emerald-600 text-white h-12 rounded-xl font-semibold mt-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-600 text-sm"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="text-warm-orange font-medium">
                {isLogin ? 'Create one' : 'Sign in'}
              </span>
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6 px-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;

