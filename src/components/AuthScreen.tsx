import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { Brain } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login: privyLogin, authenticated: privyAuthenticated } = usePrivy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = isLogin
      ? await login(email, password)
      : await register(email, password, name);

    if (result.error) {
      toast({
        title: "Authentication Error",
        description: result.error.message,
        variant: "destructive",
      });
    } else {
      // After Supabase auth succeeds, ensure a Privy session to auto-create embedded wallet
      try {
        if (!privyAuthenticated) {
          await privyLogin();
        }
      } catch (err) {
        console.warn('Privy login prompt dismissed or failed', err);
      }
      if (!isLogin) {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }
    }

    setIsSubmitting(false);
  };
  return (
    <div className="min-h-screen bg-deep-blue flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header with app icon */}
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-mint-green/20 rounded-3xl blur-xl"></div>
              <div className="relative w-16 h-16 bg-pure-white rounded-3xl flex items-center justify-center">
                <Brain className="text-mint-green" size={40} strokeWidth={2} />
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (isLogin ? 'Signing In...' : 'Creating Account...') : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          {/* Social login via Privy */}
          <div className="mt-6">
            <div className="flex items-center">
              <div className="flex-1 h-px bg-light-gray" />
              <span className="px-3 text-deep-blue/60 text-sm">or continue with</span>
              <div className="flex-1 h-px bg-light-gray" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button
                type="button"
                onClick={() => privyLogin()}
                className="w-full bg-pure-white border border-gray-200 text-deep-blue h-12 rounded-xl font-semibold hover:bg-light-gray"
                disabled={isSubmitting}
              >
                Google
              </Button>
              <Button
                type="button"
                onClick={() => privyLogin()}
                className="w-full bg-pure-white border border-gray-200 text-deep-blue h-12 rounded-xl font-semibold hover:bg-light-gray"
                disabled={isSubmitting}
              >
                X (Twitter)
              </Button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full bg-deep-blue text-pure-white h-12 rounded-xl font-semibold"
              disabled={isSubmitting}
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/terms" className="text-deep-blue/70 text-sm hover:text-deep-blue transition-colors">
              Terms and conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
