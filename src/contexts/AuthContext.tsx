
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { usePrivy } from '@privy-io/react-auth';
import { cleanupAuthState, PrivyTokenVerifier } from '@/lib/authUtils';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  register: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authStateStable, setAuthStateStable] = useState(false);
  
  // Use Privy auth state
  const { user: privyUser, authenticated: privyAuthenticated, login: privyLogin, logout: privyLogout, getAccessToken } = usePrivy();
  
  console.log('🔍 AuthProvider state:', { privyAuthenticated, hasPrivyUser: !!privyUser, hasSupabaseUser: !!user, authStateStable });
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      if (currentUser) {
        setUser({ 
          id: currentUser.id, 
          email: currentUser.email || '', 
          name: currentUser.user_metadata.name || 'User' 
        });
      } else {
        setUser(null);
      }
      
      // Mark auth state as stable immediately
      setIsLoading(false);
      setAuthStateStable(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Link Privy authentication with Supabase
  useEffect(() => {
    let linkingInProgress = false;
    
    const linkAccounts = async () => {
      if (!privyAuthenticated || !privyUser || !authStateStable || linkingInProgress) {
        return;
      }
      
      linkingInProgress = true;

      // Get email from Privy user
      let email = privyUser.email?.address;
      if (!email) {
        const emailAccount = privyUser.linkedAccounts?.find((account: any) => account.type === 'email');
        email = emailAccount ? (emailAccount as any).address : null;
      }
      
      if (!email) {
        console.error('No email found in Privy user');
        return;
      }

      try {
        // Verify Privy token if available
        const accessToken = await getAccessToken();
        if (accessToken) {
          const isValidToken = await PrivyTokenVerifier.verifyToken(accessToken);
          if (!isValidToken) {
            console.warn('Privy token verification failed');
            return;
          }
        }

        // Check if already have a Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email === email) {
          return;
        }

        // Call edge function to link accounts
        const { data, error } = await supabase.functions.invoke('privy-supabase-link', {
          body: { 
            email,
            privy_id: privyUser.id 
          }
        });
        
        if (error) {
          console.error('Failed to link accounts:', error);
          return;
        }
        
        if (data?.email_otp) {
          const { error: otpError } = await supabase.auth.verifyOtp({
            type: 'email',
            email: data.email || email,
            token: data.email_otp
          });
          
          if (otpError) {
            console.error('OTP verification failed:', otpError);
          }
        }
      } catch (error) {
        console.error('Error linking accounts:', error);
      } finally {
        linkingInProgress = false;
      }
    };

    // Only link accounts when auth state is stable and we have Privy authentication
    if (authStateStable && privyAuthenticated && privyUser) {
      linkAccounts();
    }
  }, [privyAuthenticated, privyUser, authStateStable, getAccessToken]);

  const login = async (_email: string, _password: string) => {
    console.log('🔑 Login called, delegating to Privy');
    try {
      await privyLogin();
      return { error: null };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { error: error as any };
    }
  };

  const register = async (_email: string, _password: string, _name: string) => {
    console.log('📝 Register called, delegating to Privy');
    try {
      await privyLogin();
      return { error: null };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { error: error as any };
    }
  };

  const logout = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      // Sign out from both services
      await privyLogout?.();
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setAuthStateStable(false);
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Force cleanup anyway
      setUser(null);
      window.location.href = '/';
    }
  };

  const updateDisplayName = async (name: string) => {
    try {
      await supabase.auth.updateUser({ data: { name } });
      setUser(prev => (prev ? { ...prev, name } : prev));
    } catch (_) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateDisplayName, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
