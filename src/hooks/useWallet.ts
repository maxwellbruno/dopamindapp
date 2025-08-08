import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePrivy, useWallets } from '@privy-io/react-auth';
interface WalletData {
  address?: string;
  privyDid?: string;
  provider: string;
}

interface TokenBalances {
  eth: string;
  usdt: string;
  dopamine: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balances, setBalances] = useState<TokenBalances>({
    eth: '0.00',
    usdt: '0.00',
    dopamine: '0.00'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login: privyLogin, authenticated: privyAuthenticated, user: privyUser } = usePrivy();
  const { wallets: privyWallets } = useWallets();
  // Fetch wallet data from database
  const fetchWallet = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching wallet:', error);
        return;
      }

      if (data) {
        setWallet({
          address: data.wallet_address,
          privyDid: data.privy_did,
          provider: data.wallet_provider
        });
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  // Save wallet to database
  const saveWallet = async (walletData: WalletData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_wallets')
        .upsert({
          user_id: user.id,
          wallet_address: walletData.address,
          privy_did: walletData.privyDid,
          wallet_provider: walletData.provider,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving wallet:', error);
        throw error;
      }

      setWallet(walletData);
    } catch (error) {
      console.error('Error saving wallet:', error);
      throw error;
    }
  };

// Connect wallet via Privy embedded wallet
const connectWallet = async () => {
  setIsLoading(true);
  try {
    if (!privyAuthenticated) {
      await privyLogin();
    }

    // Find embedded wallet from Privy
    const embedded = (privyWallets || []).find((w: any) =>
      w?.walletClientType === 'embedded' || w?.walletClientType === 'privy' || w?.isEmbedded
    ) as any;

    const address: string | undefined = embedded?.address;

    if (!address) {
      throw new Error('No embedded wallet available from Privy');
    }

    const walletData: WalletData = {
      address,
      privyDid: (privyUser as any)?.id,
      provider: 'privy'
    };

    await saveWallet(walletData);
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  // Fetch token balances (placeholder - will integrate with Base network)
  const fetchBalances = async () => {
    if (!wallet?.address) return;

    try {
      // Placeholder for Base network integration
      // This will be implemented with actual Base network calls
      setBalances({
        eth: '0.00',
        usdt: '0.00',
        dopamine: '0.00'
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

useEffect(() => {
  fetchWallet();
}, [user]);

// Auto-sync Privy embedded wallet to Supabase on session/wallet changes
useEffect(() => {
  const sync = async () => {
    try {
      const embedded = (privyWallets || []).find((w: any) =>
        w?.walletClientType === 'embedded' || w?.walletClientType === 'privy' || w?.isEmbedded
      ) as any;
      const address: string | undefined = embedded?.address;
      if (user && address && wallet?.address !== address) {
        await saveWallet({
          address,
          privyDid: (privyUser as any)?.id,
          provider: 'privy',
        });
      }
    } catch (e) {
      console.warn('Wallet sync skipped', e);
    }
  };
  sync();
}, [privyWallets, privyAuthenticated, user?.id]);

useEffect(() => {
  if (wallet?.address) {
    fetchBalances();
  }
}, [wallet?.address]);

  return {
    wallet,
    balances,
    isLoading,
    connectWallet,
    fetchBalances,
    isConnected: !!wallet?.address
  };
};