import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';

const AuthScreen: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { login: privyLogin, ready: privyReady, authenticated } = usePrivy();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (authenticated) {
      window.location.href = '/';
    }
  }, [authenticated]);

  const handlePrivyLogin = async () => {
    if (!privyReady || !privyLogin || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await privyLogin();
    } catch (error) {
      console.error('Privy login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-deep-blue flex items-center justify-center px-4">
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
              Welcome
            </h2>
            <p className="text-deep-blue/70 text-sm">
              Sign in or create your account with Privy
            </p>
          </div>

          {/* Privy-only login options */}
          <div className="space-y-3">
            <Button 
              type="button" 
              onClick={handlePrivyLogin} 
              className="w-full bg-mint-green hover:bg-mint-green/90 text-pure-white h-12 rounded-xl font-semibold" 
              disabled={isSubmitting || !privyReady || authenticated}
            >
              {isSubmitting ? 'Signing in...' : (!privyReady ? 'Loading...' : 'Continue with Privy')}
            </Button>

            <div className="text-center text-xs text-deep-blue/60">
              Sign in with email, Google, or X (Twitter)
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/terms" className="text-deep-blue/70 text-sm hover:text-deep-blue transition-colors">
              Terms and conditions
            </Link>
          </div>
        </div>
      </div>
    </div>;
};
export default AuthScreen;