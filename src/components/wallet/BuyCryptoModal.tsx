import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useWallets } from '@privy-io/react-auth';

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
  const { wallets } = useWallets();

  const tokens = [
    { value: 'ETH', label: 'Ethereum (ETH)', price: '$3,200' },
    { value: 'USDT', label: 'Tether USD (USDT)', price: '$1.00' },
  ];

  const handleBuyCrypto = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      // Find the embedded wallet
      const embeddedWallet = wallets.find(wallet => 
        wallet.walletClientType === 'privy' || wallet.walletClientType === 'embedded'
      );
      
      if (!embeddedWallet) {
        toast.error('Embedded wallet not found');
        return;
      }

      toast.info('Opening Coinbase onramp...');
      
      // Use Privy's funding interface - Privy handles Coinbase onramp automatically
      // when configured with the appropriate credentials in the Privy dashboard
      await embeddedWallet.fund();
      
      toast.success('Funding interface opened successfully!');
      onClose();
    } catch (error) {
      console.error('Error opening funding interface:', error);
      toast.error('Failed to open funding interface. Please try again.');
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
            Buy Crypto
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
              <div className="bg-soft-gray rounded-lg p-3">
                <p className="text-sm text-text-secondary">You'll receive approximately:</p>
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
              <p className="font-mono text-xs text-text-secondary break-all">{walletAddress}</p>
              <p className="text-sm text-text-secondary mt-1">Base Network</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleBuyCrypto}
              disabled={!walletAddress || !amount}
              className="flex-1 bg-mint-green text-white hover:bg-mint-green/90"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy with Privy
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-text-secondary bg-soft-gray rounded p-3">
            <p><strong>Note:</strong> This uses Privy's secure funding interface. Transactions are processed on Base network.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCryptoModal;