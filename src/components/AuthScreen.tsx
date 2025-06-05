
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
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-navy-blue flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header with app icon */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-primary/20 rounded-3xl blur-xl"></div>
              <div className="relative w-16 h-16 brain-icon">
                <div className="w-full h-full flex">
                  <div className="w-1/2 h-full bg-gradient-to-br from-teal-primary to-button-teal rounded-l-3xl"></div>
                  <div className="w-1/2 h-full bg-gradient-to-bl from-teal-primary to-button-teal rounded-r-3xl"></div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-wide">Dopamind</h1>
        </div>

        {/* Auth Card */}
        <div className="dopamind-card p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text-dark mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-text-light text-sm">
              {isLogin ? 'Sign in to continue your progress' : 'Join thousands improving their digital wellness'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-text-dark font-medium text-sm">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 border-gray-300 focus:border-teal-primary focus:ring-teal-primary/20 rounded-xl bg-gray-50"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-text-dark font-medium text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border-gray-300 focus:border-teal-primary focus:ring-teal-primary/20 rounded-xl bg-gray-50"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-text-dark font-medium text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 border-gray-300 focus:border-teal-primary focus:ring-teal-primary/20 rounded-xl bg-gray-50"
                required
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-button-teal hover:bg-teal-primary text-white h-12 rounded-xl font-semibold mt-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-accent text-sm font-medium"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button className="text-text-light text-sm">
              Terms and conditions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
