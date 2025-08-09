
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
  // Use Privy auth state in addition to Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user: privyUser, authenticated: privyAuthenticated, login: privyLogin, logout: privyLogout } = usePrivy() as any;
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

  // Mirror Privy auth into our app user state so the app can gate routes
  useEffect(() => {
    if (privyAuthenticated && privyUser) {
      // Best-effort extraction of email/name from Privy user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pUser: any = privyUser;
      const email = pUser?.email?.address || pUser?.linkedAccounts?.find((a: any) => a.type === 'email')?.address || '';
      const name = pUser?.name || pUser?.nickname || 'User';
      const id = String(pUser?.id || email || 'privy-user');
      setUser({ id, email, name });
      setIsLoading(false);
    }
  }, [privyAuthenticated, privyUser]);

  const login = async (_email: string, _password: string) => {
    try {
      await privyLogin();
    } catch (_) {
      // ignore and rely on Privy UI errors
    }
    return { error: null };
  };

  const register = async (_email: string, _password: string, _name: string) => {
    try {
      await privyLogin();
    } catch (_) {
      // ignore and rely on Privy UI errors
    }
    return { error: null };
  };

  const logout = async () => {
    try { await privyLogout?.(); } catch {}
    try { await supabase.auth.signOut(); } catch {}
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
