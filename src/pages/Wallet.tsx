import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import WalletCard from '../components/profile/WalletCard';
import SendCryptoModal from '../components/wallet/SendCryptoModal';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { useFundWallet } from '@privy-io/react-auth';
import { base } from 'viem/chains';

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const { wallet, balances, connectWallet, isConnected } = useWallet();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const { fundWallet } = useFundWallet();

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Wallet connection error:', error);
    }
  };

  const handleSendCrypto = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    setSendModalOpen(true);
  };

  const handleBuyCrypto = async () => {
    if (!isConnected || !wallet?.address) {
      toast.error('Please connect your wallet first');
      return;
    }
    try {
      await fundWallet(wallet.address, {
        chain: base,
        card: { preferredProvider: 'coinbase' },
      });
    } catch (error: any) {
      console.error('Fund wallet error:', error);
      toast.error(`Unable to open funding: ${error?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray pb-20">
      <div className="px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold text-text-dark">Wallet</h1>
          </div>

          <WalletCard
            walletAddress={wallet?.address}
            ethBalance={balances.eth}
            usdcBalance={balances.usdc}
            dopamineBalance={balances.dopamine}
            onConnect={handleWalletConnect}
            onSend={handleSendCrypto}
            onBuy={handleBuyCrypto}
            isConnected={isConnected}
          />
        </div>
      </div>

      <SendCryptoModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        walletAddress={wallet?.address}
        ethBalance={balances.eth}
        usdcBalance={balances.usdc}
        dopamineBalance={balances.dopamine}
      />
    </div>
  );
};

export default Wallet;
