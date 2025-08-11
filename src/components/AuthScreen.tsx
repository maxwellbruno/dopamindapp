import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
const AuthScreen: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { login: privyLogin, ready: privyReady, authenticated } = usePrivy();
  
  console.log('AuthScreen rendered - privyReady:', privyReady, 'authenticated:', authenticated);
  console.log('Privy login function available:', !!privyLogin);

  // Auto-start login when opened outside iframe via fallback
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'start') {
        void privyLogin();
      }
    } catch {}
  }, [privyLogin]);

  const handlePrivyLogin = async (method?: 'email' | 'google' | 'twitter') => {
    console.log('Button clicked! handlePrivyLogin called with method:', method);
    console.log('privyReady:', privyReady, 'privyLogin function:', !!privyLogin);
    
    if (!privyReady) {
      console.log('Privy not ready yet, ignoring click');
      return;
    }
    
    if (!privyLogin) {
      console.error('Privy login function not available');
      return;
    }
    
    // If inside an iframe, navigate top window to start auth immediately
    try {
      if (typeof window !== 'undefined' && window.top && window.top !== window.self) {
        console.log('Inside iframe, redirecting to top window');
        const url = `${window.location.origin}/?auth=start`;
        window.open(url, '_top');
        return;
      }
    } catch (error) {
      console.error('Error checking iframe:', error);
    }

    setIsSubmitting(true);
    console.log('Starting Privy login...');
    
    try {
      // Use the standard Privy login method
      await privyLogin();
      console.log('Privy login successful');
    } catch (error) {
      console.error('Privy login error:', error);
      // Fallback: open top-level navigation to trigger auth outside iframe
      try {
        const url = `${window.location.origin}/?auth=start`;
        window.open(url, '_top');
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
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
            <Button type="button" onClick={() => handlePrivyLogin('email')} className="w-full bg-mint-green hover:bg-mint-green/90 text-pure-white h-12 rounded-xl font-semibold" disabled={isSubmitting || !privyReady}>Continue with Email</Button>

            <div className="flex items-center">
              <div className="flex-1 h-px bg-light-gray" />
              <span className="px-3 text-deep-blue/60 text-sm">or</span>
              <div className="flex-1 h-px bg-light-gray" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" onClick={() => handlePrivyLogin('google')} className="w-full bg-pure-white border border-gray-200 text-deep-blue h-12 rounded-xl font-semibold hover:bg-light-gray" disabled={isSubmitting || !privyReady}>
                Google
              </Button>
              <Button type="button" onClick={() => handlePrivyLogin('twitter')} className="w-full bg-pure-white border border-gray-200 text-deep-blue h-12 rounded-xl font-semibold hover:bg-light-gray" disabled={isSubmitting || !privyReady}>
                X (Twitter)
              </Button>
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