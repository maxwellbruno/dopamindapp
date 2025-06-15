
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
    <div className="min-h-screen bg-deep-blue flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header with app icon */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-mint-green/20 rounded-3xl blur-xl"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-mint-green to-mint-green rounded-3xl flex items-center justify-center">
                {/* Brain icon using rounded rectangles to match the design */}
                <div className="w-10 h-8 relative">
                  <div className="absolute left-0 top-0 w-4 h-6 bg-white rounded-l-full"></div>
                  <div className="absolute right-0 top-0 w-4 h-6 bg-white rounded-r-full"></div>
                  <div className="absolute left-1.5 top-0.5 w-0.5 h-5 bg-deep-blue rounded-full"></div>
                  <div className="absolute right-1.5 top-0.5 w-0.5 h-5 bg-deep-blue rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-pure-white mb-1 tracking-wide">Dopamind</h1>
        </div>

        {/* Auth Card */}
        <div className="bg-pure-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-deep-blue mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-deep-blue/70 text-sm">
              {isLogin ? 'Sign in to continue your progress' : 'Join thousands improving their digital wellness'}
            </p>
          </div>

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
                  className="mt-1 border-gray-300 focus:border-deep-blue focus:ring-2 focus:ring-deep-blue/20 focus:outline-none rounded-xl bg-light-gray text-deep-blue"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-deep-blue font-medium text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 border-gray-300 focus:border-deep-blue focus:ring-2 focus:ring-deep-blue/20 focus:outline-none rounded-xl bg-light-gray text-deep-blue"
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
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 border-gray-300 focus:border-deep-blue focus:ring-2 focus:ring-deep-blue/20 focus:outline-none rounded-xl bg-light-gray text-deep-blue"
                required
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-mint-green hover:bg-mint-green/90 text-pure-white h-12 rounded-xl font-semibold mt-6"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-mint-green text-sm font-medium hover:text-mint-green/80"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button className="text-deep-blue/70 text-sm hover:text-deep-blue">
              Terms and conditions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
