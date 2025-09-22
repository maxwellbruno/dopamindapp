import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useFundWallet } from '@privy-io/react-auth';
import { base } from 'viem/chains';

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

  const handleFundWallet = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      toast.info('Opening Privy funding options...');
      
      // Build Privy funding config per docs
      const config: any = {
        chain: base,
        card: { preferredProvider: 'coinbase' }
      };
      
      // Only pass amount when funding with a stablecoin (interpreted as asset amount, not USD)
      if (selectedToken === 'USDT') {
        config.asset = 'USDC'; // map USDT selection to USDC on Base for Coinbase Onramp
        if (amount) {
          config.amount = amount.toString(); // amount in USDC units (e.g., '100' == 100 USDC)
        }
      }
      // For ETH, omit asset and amount so Privy defaults to native-currency with dashboard amount
      
      await fundWallet(walletAddress, config);
      
      // Close our modal since Privy will handle the funding flow
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
              <Label htmlFor="amount">Amount (USD) - Optional</Label>
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
              <Label htmlFor="token">Token to Buy - Optional</Label>
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
            <p><strong>Note:</strong> This opens Privy's funding modal with your enabled methods: Pay with card, Transfer from exchange, and Transfer from external wallet on Base network.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCryptoModal;