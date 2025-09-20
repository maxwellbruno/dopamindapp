import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, CreditCard, Building2, Wallet2 } from 'lucide-react';
import { toast } from 'sonner';
import { useFundWallet } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { supabase } from '@/integrations/supabase/client';

interface BuyCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

const BuyCryptoModal: React.FC<BuyCryptoModalProps> = ({
  isOpen,
  onClose,
  walletAddress
}) => {
  const [selectedToken, setSelectedToken] = useState('ETH');
  const [amount, setAmount] = useState('');
  const { fundWallet } = useFundWallet();

  const tokens = [
    { value: 'ETH', label: 'Ethereum (ETH)', price: '$3,200' },
    { value: 'USDT', label: 'Tether USD (USDT)', price: '$1.00' },
  ];

  const openOnramp = async (source: 'card' | 'exchange') => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('Not authenticated');

      const resp = await fetch('https://brgycopmuuanrrqmrdmf.functions.supabase.co/coinbase-onramp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          walletAddress,
          amount: Number(amount || 0) || 50,
          cryptoCurrency: selectedToken,
          fiatCurrency: 'USD',
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data?.onrampUrl) {
        throw new Error(data?.error || 'Failed to start funding');
      }
      // Try opening in a new tab; fallback to same tab
      const win = window.open(data.onrampUrl, '_blank', 'noopener');
      if (!win) {
        window.location.href = data.onrampUrl;
      }
    } catch (e: any) {
      console.error('Onramp open failed:', e);
      toast.error(e?.message || 'Could not start funding');
    }
  };

  const handleCardFunding = () => openOnramp('card');
  const handleExchangeFunding = () => openOnramp('exchange');
  const handleTransferFromWallet = async () => {
    if (!walletAddress) return toast.error('No wallet connected');
    try {
      await navigator.clipboard.writeText(walletAddress);
      toast.success('Wallet address copied');
    } catch {
      toast.info('Address: ' + walletAddress);
    }
  };

  const handleFundWallet = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      toast.info('Opening funding options...');
      
      // Use Privy's fundWallet with proper Base network configuration
      await fundWallet(walletAddress, {
        chain: base
      });
      onClose();
    } catch (error: any) {
      console.error('Error opening Privy funding:', error);
      toast.error(`Failed to open funding: ${error?.message || 'Unknown error'}`);
    }
  };

  const calculateEstimate = () => {
    if (!amount || !selectedToken) return 0;
    const tokenPrice = selectedToken === 'ETH' ? 3200 : 1;
    return parseFloat(amount) / tokenPrice;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-mint-green" />
            Add Crypto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token to Buy</Label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.value} value={token.value}>
                      {token.label} - {token.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {amount && (
              <div className="bg-light-gray rounded-lg p-3">
                <p className="text-sm text-cool-gray">You'll receive approximately:</p>
                <p className="font-semibold text-lg">
                  {calculateEstimate().toFixed(6)} {selectedToken}
                </p>
              </div>
            )}
          </div>

          {/* Funding Methods */}
          <div className="space-y-2">
            <Label>Funding methods</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleCardFunding} className="justify-start">
                <CreditCard className="h-4 w-4 mr-2" /> Pay with card
              </Button>
              <Button variant="outline" onClick={handleExchangeFunding} className="justify-start">
                <Building2 className="h-4 w-4 mr-2" /> Transfer from an exchange
              </Button>
              <Button variant="outline" onClick={handleTransferFromWallet} className="justify-start">
                <Wallet2 className="h-4 w-4 mr-2" /> Transfer from wallet
              </Button>
            </div>
          </div>

          {/* Wallet Address Info */}
          {walletAddress && (
            <div className="bg-mint-green/10 rounded-lg p-4 border border-mint-green/20">
              <h4 className="font-semibold text-sm text-mint-green mb-2">Destination Wallet</h4>
              <p className="font-mono text-xs text-cool-gray break-all">{walletAddress}</p>
              <p className="text-sm text-cool-gray mt-1">Base Network</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleFundWallet}
              disabled={!walletAddress}
              className="flex-1 bg-mint-green text-white hover:bg-mint-green/90"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Fund Wallet
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-cool-gray bg-light-gray rounded p-3">
            <p><strong>Note:</strong> This opens Privy's funding modal (Coinbase, card, or exchange) for secure funding on the Base network.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCryptoModal;