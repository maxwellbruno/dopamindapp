import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [amount, setAmount] = useState('');
  const { fundWallet } = useFundWallet({
    onUserExited: ({ fundingMethod, chain, address, balance }) => {
      console.log('Funding flow exited', {
        fundingMethod,
        chain: (chain as any)?.id ?? chain,
        address,
        balance,
      });
    },
  });

  const handleFundWallet = async () => {
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount) {
      toast.error('Please enter an amount to add');
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0.000333) {
      toast.error('Minimum is 0.000333 ETH');
      return;
    }

    try {
      // Open Privy's funding modal with ETH on Base (Coinbase preferred)
      await fundWallet(walletAddress, {
        chain: base,
        amount: amt.toString(),
        card: { preferredProvider: 'coinbase' },
        // asset defaults to 'native-currency' (ETH)
      });
      // Close after opening to preserve user gesture
      onClose();
    } catch (error) {
      console.error('Funding error:', error);
      toast.error('Unable to open funding options. Please try again.');
    }
  };

  const calculateEstimate = () => {
    if (!amount) return 0;
    const val = parseFloat(amount);
    return isNaN(val) ? 0 : val;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-mint-green" />
            Add Funds
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (ETH) — min 0.000333 ETH
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.000333"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.000333"
                step="0.000001"
                required
              />
            </div>

            {amount && (
              <div className="bg-light-gray rounded-lg p-3">
                <p className="text-sm text-cool-gray">You'll receive approximately:</p>
                <p className="font-semibold text-lg">
                  {calculateEstimate().toFixed(6)} ETH
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
              Add Funds
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-cool-gray bg-light-gray rounded p-3">
            <p><strong>Note:</strong> This opens the Privy funding modal for ETH on Base with options to Pay with card, Transfer from an exchange, Transfer from wallet, or Receive funds.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCryptoModal;