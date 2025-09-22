import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatEther, erc20Abi } from 'viem';
import { base } from 'viem/chains';
interface WalletData {
  address?: string;
  privyDid?: string;
  provider: string;
}

interface TokenBalances {
  eth: string;
  usdc: string;
  dopamine: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balances, setBalances] = useState<TokenBalances>({
    eth: '0.00',
    usdc: '0.00',
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

// Token contract addresses on Base network
  const USDC_CONTRACT = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'; // USDC on Base
  const DOPAMINE_CONTRACT = '0x0000000000000000000000000000000000000000'; // Placeholder - replace with actual DOPAMINE token contract

  // Create Base network client
  const baseClient = createPublicClient({
    chain: base,
    transport: http()
  });

  // Fetch token balances from Base network
  const fetchBalances = async () => {
    if (!wallet?.address) return;

    try {
      setIsLoading(true);
      
      // Fetch ETH balance
      const ethBalance = await baseClient.getBalance({
        address: wallet.address as `0x${string}`
      });
      
      // For now, use placeholder values for tokens until contracts are properly configured
      // In production, replace with actual token contract calls
      setBalances({
        eth: formatEther(ethBalance),
        usdc: '0.00', // Placeholder - will be fetched from USDC contract
        dopamine: '0.00' // Placeholder - will be fetched from DOPAMINE contract
      });
    } catch (error) {
      console.error('Error fetching balances:', error);
      // Keep existing balances on error
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  fetchWallet();
}, [user]);

// Auto-sync Privy embedded wallet to Supabase on session/wallet changes
useEffect(() => {
  const sync = async () => {
    try {
      console.log("Syncing Privy wallets:", {
        privyWallets: privyWallets?.map(w => ({ 
          address: w.address, 
          clientType: w.walletClientType
        })),
        privyAuthenticated,
        userId: user?.id
      });
      
      const embedded = (privyWallets || []).find((w: any) =>
        w?.walletClientType === 'embedded' || w?.walletClientType === 'privy' || w?.isEmbedded
      ) as any;
      const address: string | undefined = embedded?.address;
      
      console.log("Found embedded wallet:", { address, embedded: !!embedded });
      
      if (user && address && wallet?.address !== address) {
        console.log("Updating wallet address:", { old: wallet?.address, new: address });
        // Immediately reflect embedded wallet in UI
        setWallet({
          address,
          privyDid: (privyUser as any)?.id,
          provider: 'privy',
        });
        // Persist to Supabase in background
        await saveWallet({
          address,
          privyDid: (privyUser as any)?.id,
          provider: 'privy',
        });
        console.log("Wallet synced successfully");
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