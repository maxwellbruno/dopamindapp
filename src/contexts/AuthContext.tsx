
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
  // Use Privy auth state in addition to Supabase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user: privyUser, authenticated: privyAuthenticated, login: privyLogin, logout: privyLogout, getAccessToken } = usePrivy() as any;
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

  // Bridge Privy auth into a Supabase session (do not override app user with Privy DID)
  useEffect(() => {
    if (!privyAuthenticated || !privyUser) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pUser: any = privyUser;
    const email = pUser?.email?.address || pUser?.linkedAccounts?.find((a: any) => a.type === 'email')?.address || '';

    (async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && email) {
          const token = await getAccessToken?.();
          const resp = await fetch('https://brgycopmuuanrrqmrdmf.supabase.co/functions/v1/privy-supabase-link', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ email, privy_id: String(pUser?.id || '') }),
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data?.email_otp) {
              await supabase.auth.verifyOtp({ email: data.email || email, token: data.email_otp, type: 'email' });
            }
          }
        }
      } catch (_) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, [privyAuthenticated, privyUser, getAccessToken]);

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
