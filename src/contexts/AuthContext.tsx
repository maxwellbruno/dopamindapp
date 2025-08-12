
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { usePrivy } from '@privy-io/react-auth';

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
  // Use Privy auth state
  const { user: privyUser, authenticated: privyAuthenticated, login: privyLogin, logout: privyLogout } = usePrivy();
  
  console.log('🔍 AuthProvider state:', { privyAuthenticated, hasPrivyUser: !!privyUser, hasSupabaseUser: !!user });
  useEffect(() => {
    setIsLoading(true);
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
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Link Privy authentication with Supabase
  useEffect(() => {
    const linkAccounts = async () => {
      if (!privyAuthenticated || !privyUser) {
        return;
      }

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
      }
    };

    // Small delay to ensure Privy authentication is fully settled
    const timeoutId = setTimeout(linkAccounts, 1000);
    return () => clearTimeout(timeoutId);
  }, [privyAuthenticated, privyUser]);

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
    try { await privyLogout?.(); } catch {}
    try { await supabase.auth.signOut(); } catch {}
    setUser(null);
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
